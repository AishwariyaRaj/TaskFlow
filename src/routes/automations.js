const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const { requirePlan } = require('../middlewares/plan');
const ctrl = require('../controllers/automationController');

router.use(requireAuth);
router.use(requirePlan('TEAM'));

router.get('/', requireRole(['Owner', 'Admin']), ctrl.listRules);
router.post('/', requireRole(['Owner', 'Admin']), ctrl.createRule);
router.put('/:ruleId', requireRole(['Owner', 'Admin']), ctrl.updateRule);
router.delete('/:ruleId', requireRole(['Owner', 'Admin']), ctrl.deleteRule);

module.exports = router;
