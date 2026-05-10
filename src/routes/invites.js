const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const inviteCtrl = require('../controllers/inviteController');

// Workspace-scoped invite routes
router.post('/', requireAuth, requireRole(['Owner', 'Admin']), inviteCtrl.createInvite);
router.get('/', requireAuth, requireRole(['Owner', 'Admin']), inviteCtrl.listInvites);
router.delete('/:inviteId', requireAuth, requireRole(['Owner', 'Admin']), inviteCtrl.deleteInvite);

module.exports = router;
