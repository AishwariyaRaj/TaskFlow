const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const workspaceCtrl = require('../controllers/workspaceController');

router.post('/', requireAuth, workspaceCtrl.createWorkspace);
router.get('/', requireAuth, workspaceCtrl.listWorkspaces);
router.get('/:workspaceId', requireAuth, requireRole(['Owner', 'Admin', 'Member']), workspaceCtrl.getWorkspace);
router.patch('/:workspaceId', requireAuth, requireRole(['Owner', 'Admin']), workspaceCtrl.updateWorkspace);
router.delete('/:workspaceId', requireAuth, requireRole(['Owner']), workspaceCtrl.deleteWorkspace);

module.exports = router;
