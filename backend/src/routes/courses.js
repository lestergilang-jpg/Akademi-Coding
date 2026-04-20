const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMyCourses, getCourses, getCourse, getLesson,
  adminGetAllCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
} = require('../controllers/courseController');

// Protected routes
router.get('/my', protect, getMyCourses);

// Public / optional auth
router.get('/', getCourses);
router.get('/:id', (req, res, next) => {
  // Inject user if token exists but don't block if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    const jwt = require('jsonwebtoken');
    const { pool } = require('../config/database');
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [decoded.id])
        .then(({ rows }) => { req.user = rows[0]; next(); })
        .catch(() => next());
    } catch { next(); }
  } else next();
}, getCourse);

// Protected
router.get('/lesson/:id', protect, getLesson);

// Admin
router.get('/admin/all', protect, adminOnly, adminGetAllCourses);
router.post('/admin', protect, adminOnly, adminCreateCourse);
router.put('/admin/:id', protect, adminOnly, adminUpdateCourse);
router.delete('/admin/:id', protect, adminOnly, adminDeleteCourse);
router.post('/admin/lesson', protect, adminOnly, adminCreateLesson);
router.put('/admin/lesson/:id', protect, adminOnly, adminUpdateLesson);
router.delete('/admin/lesson/:id', protect, adminOnly, adminDeleteLesson);

module.exports = router;
