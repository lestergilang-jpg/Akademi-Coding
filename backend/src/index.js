require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const voucherRoutes = require('./routes/vouchers');

// ─── Rate Limiter: Login ─────────────────────────────────────
// Maksimal 5 percobaan gagal per IP dalam 15 menit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  skipSuccessfulRequests: true, // Hanya hitung request yang GAGAL
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login yang gagal. Akun Anda dikunci sementara selama 15 menit. Silakan coba lagi nanti atau gunakan fitur Lupa Password.',
    retryAfter: 15,
  },
});

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ─── Routes ─────────────────────────────────────────────────
// Terapkan rate limiter KHUSUS pada endpoint login
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/vouchers', voucherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CumaNgeprompt API is running 🚀', time: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Start ───────────────────────────────────────────────────
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 CumaNgeprompt API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

start();
