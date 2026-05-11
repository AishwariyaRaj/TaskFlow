const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const memberCtrl = require('../controllers/memberController');

router.get('/', requireAuth, requireRole(['Owner', 'Admin', 'Member']), memberCtrl.listMembers);
router.patch('/:userId', requireAuth, requireRole(['Owner', 'Admin']), memberCtrl.updateMemberRole);
router.delete('/:userId', requireAuth, requireRole(['Owner', 'Admin']), memberCtrl.removeMember);

module.exports = router;
