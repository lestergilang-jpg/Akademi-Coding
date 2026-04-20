const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query('SELECT id, name, email, role, is_active, discord_id, discord_username, avatar_url FROM users WHERE id = $1', [decoded.id]);

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Token tidak valid.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau sudah expired.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya untuk admin.' });
};

const activeOnly = (req, res, next) => {
  if (req.user && req.user.is_active) return next();
  return res.status(403).json({ success: false, message: 'Silakan selesaikan pembayaran untuk mengakses konten ini.' });
};

module.exports = { protect, adminOnly, activeOnly };
