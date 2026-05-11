const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const aiService = require('../services/aiService');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @route   POST /api/ai/create-tasks
// @desc    Generate tasks using AI and save to project
router.post('/create-tasks', requireAuth, async (req, res) => {
  try {
    const { prompt, projectId, workspaceId } = req.body;
    if (!prompt || !projectId) {
      return res.status(400).json({ message: 'Prompt and Project ID are required' });
    }

    const tasksData = await aiService.generateTasks(prompt);
    
    // Process and save tasks
    const tasks = tasksData.map(t => ({
      ...t,
      project: projectId,
      workspace: workspaceId,
      dueDate: t.suggestedDeadline ? new Date(t.suggestedDeadline) : null,
      createdBy: req.user.id
    }));

    const savedTasks = await Task.insertMany(tasks);
    res.json({ tasks: savedTasks, message: `Successfully generated ${savedTasks.length} tasks` });
  } catch (error) {
    console.error('AI Task Error:', error);
    res.status(500).json({ message: 'Error generating tasks with AI' });
  }
});

// @route   POST /api/ai/summarize
// @desc    Summarize project progress
router.post('/summarize', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const tasks = await Task.find({ project: projectId });
    // Activity logs are scoped to workspaces, and sometimes have project info in meta
    const activities = await ActivityLog.find({ workspace: req.workspace?.id || { $exists: true } }).limit(20).sort({ createdAt: -1 });

    const projectData = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'Completed').length,
      overdueTasks: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length,
      recentActivity: activities.map(a => a.action)
    };

    const summary = await aiService.generateSummary(projectData);
    res.json({ summary });
  } catch (error) {
    console.error('AI Summary Error:', error);
    res.status(500).json({ message: 'Error generating summary' });
  }
});

// @route   POST /api/ai/search-query
// @desc    Convert NL to Mongo Query
router.post('/search-query', requireAuth, async (req, res) => {
  try {
    const { query, projectId } = req.body;
    
    const mongoQuery = await aiService.convertNLToQuery(query);
    // Ensure searches are scoped to project
    mongoQuery.project = projectId;
    
    const tasks = await Task.find(mongoQuery);
    res.json({ tasks, queryUsed: mongoQuery });
  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ message: 'Error performing AI search' });
  }
});

module.exports = router;
