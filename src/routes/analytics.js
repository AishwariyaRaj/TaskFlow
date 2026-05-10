const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { requirePlan } = require('../middlewares/plan');
const ctrl = require('../controllers/analyticsController');

router.get('/', requireAuth, requireRole(['Owner','Admin']), requirePlan('PRO'), ctrl.getWorkspaceAnalytics);
router.get('/activity', requireAuth, requireRole(['Owner','Admin','Member']), requirePlan('PRO'), ctrl.getWorkspaceActivity);
router.get('/export', requireAuth, requireRole(['Owner','Admin']), requirePlan('TEAM'), ctrl.exportWorkspaceData);

module.exports = router;
