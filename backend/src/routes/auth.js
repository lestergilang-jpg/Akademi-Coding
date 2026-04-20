const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, verifyEmail } = require('../controllers/authController');
const { linkDiscord, discordCallback } = require('../controllers/discordController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile); // Feature 1

router.get('/discord/link', linkDiscord);
router.get('/discord/callback', discordCallback);
router.get('/verify-email', verifyEmail);

module.exports = router;
