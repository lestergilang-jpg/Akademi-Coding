const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateVoucher } = require('../controllers/voucherController');

// All voucher validation requires user to be logged in
router.post('/validate', protect, validateVoucher);

module.exports = router;
