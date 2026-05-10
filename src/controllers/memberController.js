const User = require('../models/User');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../services/activityService');

async function listMembers(req, res) {
  try {
    const { workspaceId } = req.params;
    const members = await User.find(
      { 'memberships.workspace': workspaceId },
      { name: 1, email: 1, createdAt: 1, memberships: 1 }
    ).lean();
    const result = members.map(u => {
      const membership = (u.memberships || []).find(m => String(m.workspace) === String(workspaceId));
      return { _id: u._id, name: u.name, email: u.email, role: membership?.role, joinedAt: u.createdAt };
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateMemberRole(req, res) {
  try {
    const { workspaceId, userId } = req.params;
    const { role } = req.body;
    if (!['Admin', 'Member'].includes(role)) return res.status(400).json({ message: 'Invalid role' });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    // Cannot change role of the owner
    if (String(workspace.owner) === String(userId)) {
      return res.status(403).json({ message: 'Cannot change the role of the workspace owner' });
    }

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const membership = (target.memberships || []).find(m => String(m.workspace) === String(workspaceId));
    if (!membership) return res.status(404).json({ message: 'User is not a member' });

    membership.role = role;
    await target.save();

    await logActivity(workspaceId, req.user._id, 'member.roleChanged', { targetUserId: userId, role });
    res.json({ message: 'Role updated', userId, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function removeMember(req, res) {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (String(workspace.owner) === String(userId)) {
      return res.status(403).json({ message: 'Cannot remove the workspace owner' });
    }

    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    target.memberships = (target.memberships || []).filter(m => String(m.workspace) !== String(workspaceId));
    await target.save();
    await Workspace.findByIdAndUpdate(workspaceId, { $pull: { members: userId } });

    await logActivity(workspaceId, req.user._id, 'member.removed', { targetUserId: userId });
    res.json({ message: 'Member removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listMembers, updateMemberRole, removeMember };
