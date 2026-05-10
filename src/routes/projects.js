const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const projectCtrl = require('../controllers/projectController');

// Create project (Owner/Admin/Member allowed to create by default)
router.post('/', requireAuth, requireRole(['Owner','Admin','Member']), projectCtrl.createProject);
router.get('/', requireAuth, requireRole(['Owner','Admin','Member']), projectCtrl.listProjects);
router.get('/:projectId', requireAuth, requireRole(['Owner','Admin','Member']), projectCtrl.getProject);
router.delete('/:projectId', requireAuth, requireRole(['Owner','Admin']), projectCtrl.deleteProject);

module.exports = router;
