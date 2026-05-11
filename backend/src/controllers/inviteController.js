const { v4: uuidv4 } = require('uuid');
const Invite = require('../models/Invite');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { sendMail } = require('../utils/email');
const { logActivity } = require('../services/activityService');

async function enforceMemberLimit(workspaceId) {
  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) {
    const err = new Error('Workspace not found');
    err.status = 404;
    throw err;
  }

  const plan = workspace.plan || 'FREE';
  if (plan !== 'PRO') return;

  const count = await User.countDocuments({ 'memberships.workspace': workspaceId });
  if (count >= 15) {
    const err = new Error('PRO plan supports up to 15 members. Upgrade to TEAM for unlimited members.');
    err.status = 403;
    throw err;
  }
}

async function createInvite(req, res) {
  try {
    const { workspaceId } = req.params;
    const { email, role = 'Member' } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    await enforceMemberLimit(workspaceId);

    // Check if user already a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const alreadyMember = (existingUser.memberships || []).some(
        m => String(m.workspace) === String(workspaceId)
      );
      if (alreadyMember) return res.status(400).json({ message: 'User is already a member' });
    }

    // Check for existing pending invite
    const existing = await Invite.findOne({ workspace: workspaceId, email: email.toLowerCase(), accepted: false, expiresAt: { $gt: new Date() } });
    if (existing) return res.status(400).json({ message: 'Invite already sent to this email' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const invite = await Invite.create({
      workspace: workspaceId,
      email: email.toLowerCase(),
      role,
      token,
      invitedBy: req.user._id,
      expiresAt
    });

    const frontendUrlRaw = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontend = frontendUrlRaw.split(',')[0].replace(/\/$/, '');
    const inviteUrl = `${frontend}/invites/${token}`;
    try {
      await sendMail({
        to: email,
        subject: `You're invited to join ${workspace.name}`,
        text: `Hi! You've been invited to join workspace "${workspace.name}" as ${role}. Click here to accept: ${inviteUrl}`,
        html: `<p>Hi! You've been invited to join workspace <strong>${workspace.name}</strong> as <strong>${role}</strong>.</p><p><a href="${inviteUrl}">Accept Invitation</a></p><p>This link expires in 7 days.</p>`
      });
    } catch (emailErr) {
      console.error('Failed to send invite email', emailErr);
    }

    await logActivity(workspaceId, req.user._id, 'invite.created', { email, role });
    
    const fullInvite = await Invite.findById(invite._id).populate('invitedBy', 'name email');
    res.status(201).json(fullInvite);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function getInvite(req, res) {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token }).populate('workspace', 'name slug').populate('invitedBy', 'name email');
    if (!invite) return res.status(404).json({ message: 'Invite not found or expired' });
    if (invite.accepted) return res.status(400).json({ message: 'Invite already accepted' });
    if (invite.expiresAt < new Date()) return res.status(400).json({ message: 'Invite expired' });
    res.json(invite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function acceptInvite(req, res) {
  try {
    const { token } = req.params;
    console.log(`\n[INVITE-ACCEPT] ========== START ==========`);
    console.log(`[INVITE-ACCEPT] Token: ${token}`);
    console.log(`[INVITE-ACCEPT] User: ${req.user._id} (${req.user.email})`);
    
    const invite = await Invite.findOne({ token });
    if (!invite) {
      console.log(`[INVITE-ACCEPT] ERROR: Invite not found`);
      return res.status(404).json({ message: 'Invite not found' });
    }
    
    console.log(`[INVITE-ACCEPT] Invite found: workspace=${invite.workspace}, role=${invite.role}`);
    
    if (invite.expiresAt < new Date()) {
      console.log(`[INVITE-ACCEPT] ERROR: Invite expired`);
      return res.status(400).json({ message: 'Invite expired' });
    }

    if (req.user.email.toLowerCase() !== invite.email.toLowerCase()) {
      console.log(`[INVITE-ACCEPT] ERROR: Email mismatch`);
      return res.status(403).json({ message: 'This invite was sent to a different email address' });
    }

    // Check if already a member - if yes, just return the workspace
    const user = await User.findById(req.user._id);
    const alreadyMember = (user.memberships || []).some(
      m => String(m.workspace) === String(invite.workspace)
    );
    
    if (!alreadyMember) {
      await enforceMemberLimit(invite.workspace);
      console.log(`[INVITE-ACCEPT] Not yet a member, adding...`);
      user.memberships = user.memberships || [];
      user.memberships.push({ workspace: invite.workspace, role: invite.role });
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();
      console.log(`[INVITE-ACCEPT] Membership added! Total: ${user.memberships.length}`);

      await Workspace.findByIdAndUpdate(invite.workspace, { $addToSet: { members: req.user._id } });
      console.log(`[INVITE-ACCEPT] Added to workspace members`);
    } else {
      console.log(`[INVITE-ACCEPT] Already a member, skipping add`);
    }

    // Mark invite as accepted if not already
    if (!invite.accepted) {
      invite.accepted = true;
      await invite.save();
      console.log(`[INVITE-ACCEPT] Marked invite as accepted`);
    }

    const workspace = await Workspace.findById(invite.workspace);
    const updatedUser = await User.findById(req.user._id).populate('memberships.workspace');
    
    console.log(`[INVITE-ACCEPT] SUCCESS! User now has ${updatedUser.memberships.length} memberships`);
    console.log(`[INVITE-ACCEPT] ========== END ==========\n`);
    
    await logActivity(invite.workspace, req.user._id, 'user.joined', { via: 'invite', role: invite.role });
    
    res.json({ 
      message: 'Invite accepted', 
      workspaceId: invite.workspace,
      workspace: workspace,
      role: invite.role,
      user: updatedUser 
    });
  } catch (err) {
    console.error(`[INVITE-ACCEPT] EXCEPTION:`, err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function acceptInvitePublic(req, res) {
  try {
    const { token } = req.params;
    const { email } = req.body;
    
    console.log(`\n[INVITE-ACCEPT-PUBLIC] ========== START ==========`);
    console.log(`[INVITE-ACCEPT-PUBLIC] Token: ${token}`);
    console.log(`[INVITE-ACCEPT-PUBLIC] Email from body: ${email}`);
    console.log(`[INVITE-ACCEPT-PUBLIC] Has auth header: ${!!req.headers.authorization}`);
    
    // Try to use req.user if authenticated
    let userId, userEmail;
    if (req.user) {
      userId = req.user._id;
      userEmail = req.user.email;
      console.log(`[INVITE-ACCEPT-PUBLIC] Using authenticated user: ${userEmail}`);
    } else if (email) {
      // Fall back to email from request body
      userEmail = email;
      console.log(`[INVITE-ACCEPT-PUBLIC] Using email from body: ${email}`);
    } else {
      console.log(`[INVITE-ACCEPT-PUBLIC] ERROR: No user auth and no email provided`);
      return res.status(400).json({ message: 'Email required' });
    }

    const invite = await Invite.findOne({ token });
    if (!invite) {
      console.log(`[INVITE-ACCEPT-PUBLIC] ERROR: Invite not found`);
      return res.status(404).json({ message: 'Invite not found' });
    }
    
    console.log(`[INVITE-ACCEPT-PUBLIC] Invite found: workspace=${invite.workspace}, email=${invite.email}, role=${invite.role}`);
    
    if (invite.expiresAt < new Date()) {
      console.log(`[INVITE-ACCEPT-PUBLIC] ERROR: Invite expired`);
      return res.status(400).json({ message: 'Invite expired' });
    }

    if (userEmail.toLowerCase() !== invite.email.toLowerCase()) {
      console.log(`[INVITE-ACCEPT-PUBLIC] ERROR: Email mismatch. Expected ${invite.email}, got ${userEmail}`);
      return res.status(403).json({ message: 'This invite was sent to a different email address' });
    }

    // Find or create user
    let user = await User.findOne({ email: invite.email.toLowerCase() });
    if (!user) {
      await enforceMemberLimit(invite.workspace);
      console.log(`[INVITE-ACCEPT-PUBLIC] User not found, creating...`);
      user = await User.create({
        email: invite.email.toLowerCase(),
        name: invite.email.split('@')[0],
        isEmailVerified: true,
        memberships: [{ workspace: invite.workspace, role: invite.role }]
      });
      console.log(`[INVITE-ACCEPT-PUBLIC] User created: ${user._id}`);
    } else {
      // Add membership if not already member
      userId = user._id;
      const alreadyMember = (user.memberships || []).some(
        m => String(m.workspace) === String(invite.workspace)
      );
      
      if (!alreadyMember) {
        await enforceMemberLimit(invite.workspace);
        console.log(`[INVITE-ACCEPT-PUBLIC] Not yet a member, adding...`);
        user.memberships = user.memberships || [];
        user.memberships.push({ workspace: invite.workspace, role: invite.role });
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();
        console.log(`[INVITE-ACCEPT-PUBLIC] Membership added! Total: ${user.memberships.length}`);
      } else {
        console.log(`[INVITE-ACCEPT-PUBLIC] Already a member, skipping add`);
      }
    }

    // Add to workspace members
    await Workspace.findByIdAndUpdate(invite.workspace, { $addToSet: { members: user._id } });

    // Mark invite as accepted if not already
    if (!invite.accepted) {
      invite.accepted = true;
      await invite.save();
      console.log(`[INVITE-ACCEPT-PUBLIC] Marked invite as accepted`);
    }

    const workspace = await Workspace.findById(invite.workspace);
    const finalUser = await User.findById(user._id).populate('memberships.workspace');
    
    console.log(`[INVITE-ACCEPT-PUBLIC] SUCCESS! User now has ${finalUser.memberships.length} memberships`);
    console.log(`[INVITE-ACCEPT-PUBLIC] ========== END ==========\n`);
    
    await logActivity(invite.workspace, user._id, 'user.joined', { via: 'invite', role: invite.role });
    
    res.json({ 
      message: 'Invite accepted', 
      workspaceId: invite.workspace,
      workspace: workspace,
      role: invite.role,
      user: finalUser,
      accessToken: null // Frontend will need to log in if not already
    });
  } catch (err) {
    console.error(`[INVITE-ACCEPT-PUBLIC] EXCEPTION:`, err.message);
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
}

async function listInvites(req, res) {
  try {
    const { workspaceId } = req.params;
    const invites = await Invite.find({ workspace: workspaceId })
      .populate('invitedBy', 'name email')
      .sort('-createdAt');
    res.json(invites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteInvite(req, res) {
  try {
    const { workspaceId, inviteId } = req.params;
    const invite = await Invite.findOneAndDelete({ _id: inviteId, workspace: workspaceId });
    if (!invite) return res.status(404).json({ message: 'Invite not found' });
    res.json({ message: 'Invite deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createInvite, getInvite, acceptInvite, acceptInvitePublic, listInvites, deleteInvite };
