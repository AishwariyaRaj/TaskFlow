const Project = require('../models/Project');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { logActivity } = require('../services/activityService');
const { executeAutomations } = require('../services/automationService');

async function createProject(req, res){
  try{
    const { workspaceId } = req.params;
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // Limit check for FREE plan
    if (workspace.plan === 'FREE') {
      const projectCount = await Project.countDocuments({ workspace: workspaceId });
      if (projectCount >= 3) {
        return res.status(403).json({ 
          message: 'Project limit reached for FREE plan. Upgrade to PRO for unlimited projects.',
          limitReached: true 
        });
      }
    }

    const project = await Project.create({ workspace: workspaceId, name, description, createdBy: req.user._id });
    await logActivity(workspaceId, req.user._id, 'project.created', { projectId: project._id, name: project.name });
    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('project.created', project);

    // Run Automations
    setTimeout(() => {
      executeAutomations('project.created', { workspaceId, project, userId: req.user._id });
    }, 0);

    res.status(201).json(project);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function listProjects(req, res){
  try{
    const { workspaceId } = req.params;
    const projects = await Project.find({ workspace: workspaceId }).sort('-createdAt');
    res.json(projects);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getProject(req, res){
  try{
    const { workspaceId, projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteProject(req, res){
  try{
    const { workspaceId, projectId } = req.params;
    const project = await Project.findOneAndDelete({ _id: projectId, workspace: workspaceId });
    if (!project) return res.status(404).json({ message: 'Not found' });
    // remove tasks under this project
    await Task.deleteMany({ project: project._id });
    await logActivity(workspaceId, req.user._id, 'project.deleted', { projectId: project._id, name: project.name });
    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('project.deleted', { projectId: project._id });
    res.json({ message: 'Deleted' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createProject, listProjects, getProject, deleteProject };
