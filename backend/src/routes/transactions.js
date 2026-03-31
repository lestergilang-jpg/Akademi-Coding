const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createTransaction, handleWebhook, getMyTransactions } = require('../controllers/transactionController');

router.post('/create', protect, createTransaction);
router.post('/webhook', handleWebhook); // No auth - Midtrans calls this
router.get('/my', protect, getMyTransactions);

module.exports = router;
