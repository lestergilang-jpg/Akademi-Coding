const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updateAvatar, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { linkDiscord, discordCallback } = require('../controllers/discordController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile); // Feature 1

const upload = require('../utils/upload');
router.put('/profile/avatar', protect, upload.single('avatar'), updateAvatar);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/discord/link', linkDiscord);
router.get('/discord/callback', discordCallback);
router.get('/verify-email', verifyEmail);

module.exports = router;
