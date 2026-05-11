const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const taskCtrl = require('../controllers/taskController');

// List all tasks in workspace (with filters)
router.get('/tasks', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.listTasks);
// Calendar view optimized endpoint
router.get('/calendar', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.listTasks); 
// Create task under a project
router.post('/projects/:projectId/tasks', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.createTask);
// Get single task
router.get('/projects/:projectId/tasks/:taskId', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.getTask);
// Update task
router.put('/projects/:projectId/tasks/:taskId', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.updateTask);
router.patch('/projects/:projectId/tasks/:taskId', requireAuth, requireRole(['Owner', 'Admin', 'Member']), taskCtrl.updateTask);
// Delete task
router.delete('/projects/:projectId/tasks/:taskId', requireAuth, requireRole(['Owner', 'Admin']), taskCtrl.deleteTask);

module.exports = router;
