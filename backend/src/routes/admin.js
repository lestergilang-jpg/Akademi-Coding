const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getUsers, toggleUserActive, getStats } = require('../controllers/adminController');
const { adminGetTransactions } = require('../controllers/transactionController');
const { adminGetVouchers, adminCreateVoucher, adminToggleVoucher, adminDeleteVoucher } = require('../controllers/voucherController');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/transactions', adminGetTransactions);

// Vouchers
router.get('/vouchers', adminGetVouchers);
router.post('/vouchers', adminCreateVoucher);
router.put('/vouchers/:id/toggle', adminToggleVoucher);
router.delete('/vouchers/:id', adminDeleteVoucher);

module.exports = router;
