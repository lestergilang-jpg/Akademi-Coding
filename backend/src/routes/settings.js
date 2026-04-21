const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to get settings (used by landing page)
router.get('/:key', getSettings);

// Admin route to update settings
router.post('/:key', protect, adminOnly, updateSettings);

module.exports = router;
