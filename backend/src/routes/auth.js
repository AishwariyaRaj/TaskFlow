const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const authCtrl = require('../controllers/authController');

router.post('/register', authCtrl.register);
router.post('/verify-email', authCtrl.verifyEmail);
router.get('/verify-email', authCtrl.verifyEmail);
router.post('/resend-verification', authCtrl.resendVerification);
router.post('/login', authCtrl.login);
router.post('/google-login', authCtrl.googleLogin);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', requireAuth, authCtrl.logout);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password', authCtrl.resetPassword);
router.get('/me', requireAuth, authCtrl.getMe);
router.patch('/me', requireAuth, authCtrl.updateMe);

module.exports = router;
