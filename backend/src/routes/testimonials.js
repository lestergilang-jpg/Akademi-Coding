const express = require('express');
const router = express.Router();
const { 
  getMyTestimonial, 
  upsertTestimonial, 
  getPublicTestimonials 
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');

// Public route (untuk landing page)
router.get('/public', getPublicTestimonials);

// User routes (butuh login)
router.get('/me', protect, getMyTestimonial);
router.post('/', protect, upsertTestimonial);

module.exports = router;
