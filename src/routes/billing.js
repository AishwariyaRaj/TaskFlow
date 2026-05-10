const express = require('express');
const router = express.Router({ mergeParams: true });
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/rbac');
const billingCtrl = require('../controllers/billingController');

router.post('/checkout', requireAuth, requireRole(['Owner', 'Admin']), billingCtrl.createCheckout);
router.get('/subscription', requireAuth, requireRole(['Owner', 'Admin', 'Member']), billingCtrl.getSubscription);
router.post('/portal', requireAuth, requireRole(['Owner', 'Admin']), billingCtrl.createPortalSession);
router.post('/verify-session', requireAuth, requireRole(['Owner', 'Admin']), billingCtrl.verifySession);

module.exports = router;
