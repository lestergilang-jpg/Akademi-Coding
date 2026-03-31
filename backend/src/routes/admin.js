const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, toggleUserActive, getStats } = require('../controllers/adminController');
const { adminGetTransactions } = require('../controllers/transactionController');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/transactions', adminGetTransactions);

module.exports = router;
