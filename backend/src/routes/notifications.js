const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const ctrl = require('../controllers/notificationController');

router.get('/', requireAuth, requireRole(['Owner','Admin','Member']), ctrl.listNotifications);
router.patch('/:notificationId/read', requireAuth, requireRole(['Owner','Admin','Member']), ctrl.markAsRead);
router.patch('/read-all', requireAuth, requireRole(['Owner','Admin','Member']), ctrl.markAllRead);

module.exports = router;
