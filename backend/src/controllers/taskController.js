const Task = require('../models/Task');
const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');
const { createWorkspaceNotification } = require('../services/notificationService');
const { executeAutomations } = require('../services/automationService');
const User = require('../models/User');

function extractMentionedEmails(text = ''){
  const matches = text.match(/@[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  return matches.map(token => token.slice(1).toLowerCase());
}

async function createTask(req, res){
  try{
    const { workspaceId, projectId } = req.params;
    const { title, description, status, priority, dueDate, assignees, attachments } = req.body;
    if (!title) return res.status(400).json({ message: 'title required' });
    const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const task = await Task.create({
      workspace: workspaceId,
      project: projectId,
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      assignees: assignees || [],
      attachments: attachments || [],
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email');

    await logActivity(workspaceId, req.user._id, 'task.created', { taskId: task._id, title: task.title, projectId });
    await createWorkspaceNotification({
      workspaceId,
      userIds: Array.from(new Set((task.assignees || []).map(String).concat(String(task.createdBy || '')).filter(Boolean))),
      type: 'task_created',
      title: `New task: ${task.title}`,
      message: `${req.user.name || 'A user'} created a task`,
      entityType: 'Task',
      entityId: task._id,
      data: { projectId }
    });

    const mentionedEmails = extractMentionedEmails(`${task.title || ''} ${task.description || ''}`);
    if (mentionedEmails.length){
      const mentionedUsers = await User.find({ email: { $in: mentionedEmails } }, { _id: 1 }).lean();
      const mentionedUserIds = mentionedUsers.map(u => String(u._id));
      if (mentionedUserIds.length){
        await createWorkspaceNotification({
          workspaceId,
          userIds: mentionedUserIds,
          type: 'task_mentioned',
          title: `You were mentioned in ${task.title}`,
          message: `${req.user.name || 'A user'} mentioned you in a task`,
          entityType: 'Task',
          entityId: task._id,
          data: { projectId, mentionedEmails }
        });
      }
    }
    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('task.created', populatedTask);

    // Run Automations
    setTimeout(() => {
      executeAutomations('task.created', { workspaceId, task: populatedTask, userId: req.user._id });
    }, 0);

    res.status(201).json(populatedTask);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function getTask(req, res){
  try{
    const { workspaceId, projectId, taskId } = req.params;
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId, project: projectId })
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateTask(req, res){
  try{
    const { workspaceId, projectId, taskId } = req.params;
    const updates = req.body;
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId, project: projectId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const previousAssignees = (task.assignees || []).map(String);
    Object.assign(task, updates);
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email');

    await logActivity(workspaceId, req.user._id, 'task.updated', { taskId: task._id, updates });
    const nextAssignees = (task.assignees || []).map(String);
    const assignedUsers = nextAssignees.filter(id => !previousAssignees.includes(id));
    if (assignedUsers.length){
      await createWorkspaceNotification({
        workspaceId,
        userIds: assignedUsers,
        type: 'task_assigned',
        title: `Assigned to ${task.title}`,
        message: `${req.user.name || 'A user'} assigned you to a task`,
        entityType: 'Task',
        entityId: task._id,
        data: { taskId: task._id, projectId }
      });
    }

    const mentionedEmails = extractMentionedEmails(`${task.title || ''} ${task.description || ''}`);
    if (mentionedEmails.length){
      const mentionedUsers = await User.find({ email: { $in: mentionedEmails } }, { _id: 1 }).lean();
      const mentionedUserIds = mentionedUsers.map(u => String(u._id));
      if (mentionedUserIds.length){
        await createWorkspaceNotification({
          workspaceId,
          userIds: mentionedUserIds,
          type: 'task_mentioned',
          title: `You were mentioned in ${task.title}`,
          message: `${req.user.name || 'A user'} mentioned you in a task`,
          entityType: 'Task',
          entityId: task._id,
          data: { taskId: task._id, projectId, mentionedEmails }
        });
      }
    }
    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('task.updated', populatedTask);

    // Run Automations
    setTimeout(() => {
      executeAutomations('task.updated', { workspaceId, task: populatedTask, userId: req.user._id, updates });
      if (updates.status === 'Done') {
        executeAutomations('task.completed', { workspaceId, task: populatedTask, userId: req.user._id });
      }
    }, 0);

    res.json(populatedTask);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function deleteTask(req, res){
  try{
    const { workspaceId, projectId, taskId } = req.params;
    const task = await Task.findOneAndDelete({ _id: taskId, workspace: workspaceId, project: projectId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await logActivity(workspaceId, req.user._id, 'task.deleted', { taskId: task._id, title: task.title });
    const io = req.app.get('io');
    if (io) io.to(String(workspaceId)).emit('task.deleted', { taskId: task._id, projectId });
    res.json({ message: 'Task deleted' });
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function listTasks(req, res){
  try{
    const { workspaceId } = req.params;
    const { status, assignee, project, dueBefore, dueAfter, priority, search } = req.query;
    const q = { workspace: workspaceId };
    if (status) q.status = status;
    if (project) q.project = project;
    if (priority) q.priority = priority;
    if (assignee) q.assignees = assignee;
    if (search) q.title = { $regex: search, $options: 'i' };
    if (dueBefore || dueAfter) q.dueDate = {};
    if (dueBefore) q.dueDate.$lte = new Date(dueBefore);
    if (dueAfter) q.dueDate.$gte = new Date(dueAfter);
    const tasks = await Task.find(q)
      .populate('assignees', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');
    res.json(tasks);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createTask, getTask, updateTask, deleteTask, listTasks };
