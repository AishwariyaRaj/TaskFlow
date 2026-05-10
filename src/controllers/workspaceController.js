const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { logActivity } = require('../services/activityService');

function mapLegacyPlan(legacy) {
  if (!legacy) return null;
  const s = String(legacy).trim().toLowerCase();
  if (s === 'pro') return 'PRO';
  if (s === 'team') return 'TEAM';
  if (s === 'free') return 'FREE';
  return null;
}

async function createWorkspace(req, res){
  try{
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const generatedSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    // Check slug uniqueness
    const existing = await Workspace.findOne({ slug: generatedSlug });
    if (existing) return res.status(400).json({ message: 'Workspace slug already taken' });

    const workspace = await Workspace.create({
      name,
      slug: generatedSlug,
      owner: req.user._id,
      members: [req.user._id]
    });
    // add membership to user
    const user = await User.findById(req.user._id);
    user.memberships = user.memberships || [];
    user.memberships.push({ workspace: workspace._id, role: 'Owner' });
    await user.save();
    await logActivity(workspace._id, req.user._id, 'workspace.created', { name: workspace.name });
    res.status(201).json(workspace);
  } catch(err){
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ message: 'Workspace slug already exists' });
    res.status(500).json({ message: 'Server error' });
  }
}

async function listWorkspaces(req, res){
  try{
    console.log(`[WORKSPACES] Fetching for user: ${req.user._id}`);
    const user = await User.findById(req.user._id).populate('memberships.workspace');
    const memberships = user.memberships || [];
    console.log(`[WORKSPACES] User has ${memberships.length} memberships`);
    const workspaces = memberships
      .filter(m => m.workspace) // filter out deleted workspaces
      .map(m => {
        console.log(`[WORKSPACES] Membership - workspace: ${m.workspace._id}, role: ${m.role}`);
        if (!m.workspace.plan) m.workspace.plan = mapLegacyPlan(m.workspace.billing?.plan) || 'FREE';
        return { workspace: m.workspace, role: m.role };
      });
    console.log(`[WORKSPACES] Returning ${workspaces.length} workspaces`);
    res.json(workspaces);
  } catch(err){
    console.error(`[WORKSPACES] Error:`, err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getWorkspace(req, res){
  try{
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId).populate('owner', 'name email');
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (!workspace.plan) workspace.plan = mapLegacyPlan(workspace.billing?.plan) || 'FREE';
    res.json(workspace);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateWorkspace(req, res){
  try{
    const { workspaceId } = req.params;
    const { name } = req.body;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    if (name) workspace.name = name;
    await workspace.save();
    await logActivity(workspaceId, req.user._id, 'workspace.updated', { name });
    res.json(workspace);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteWorkspace(req, res){
  try{
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    // Only the owner can delete
    if (String(workspace.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can delete this workspace' });
    }
    // Remove memberships from all members
    await User.updateMany(
      { 'memberships.workspace': workspaceId },
      { $pull: { memberships: { workspace: workspaceId } } }
    );
    await workspace.deleteOne();
    await logActivity(workspaceId, req.user._id, 'workspace.deleted', { name: workspace.name });
    res.json({ message: 'Workspace deleted' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createWorkspace, listWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace };
