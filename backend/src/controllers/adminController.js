const { pool } = require('../config/database');

// GET /api/admin/users
const getUsers = async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ success: true, data: rows });
};

// PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!users.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
  const newStatus = !users[0].is_active;
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
  res.json({ success: true, message: `User ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, data: { is_active: newStatus } });
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM users WHERE role = "user"');
  const [[{ active_users }]] = await pool.query('SELECT COUNT(*) as active_users FROM users WHERE is_active = TRUE AND role = "user"');
  const [[{ total_revenue }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_revenue FROM transactions WHERE status = "success"');
  const [[{ total_transactions }]] = await pool.query('SELECT COUNT(*) as total_transactions FROM transactions');
  res.json({ success: true, data: { total_users, active_users, total_revenue, total_transactions } });
};

module.exports = { getUsers, toggleUserActive, getStats };
