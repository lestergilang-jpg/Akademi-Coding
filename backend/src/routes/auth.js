const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, updateAvatar, verifyEmail,
  forgotPassword, resetPassword, resendVerification,
  changePassword, requestEmailChange, verifyEmailChange,
} = require('../controllers/authController');
const { linkDiscord, discordCallback } = require('../controllers/discordController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

const upload = require('../utils/upload');
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Account Security ──────────────────────────────────────────
router.post('/change-password', protect, changePassword);
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-email-change', protect, verifyEmailChange);

router.get('/discord/link', linkDiscord);
router.get('/discord/callback', discordCallback);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

module.exports = router;
