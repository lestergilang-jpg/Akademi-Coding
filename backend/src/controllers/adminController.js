const { pool } = require('../config/database');

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({ success: true, data: rows });
};

// PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  const { rows: users } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (!users.length) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
  const newStatus = !users[0].is_active;
  await pool.query('UPDATE users SET is_active = $1 WHERE id = $2', [newStatus, req.params.id]);
  res.json({ success: true, message: `User ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`, data: { is_active: newStatus } });
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  const { rows: r1 } = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role = 'user'");
  const { rows: r2 } = await pool.query("SELECT COUNT(*) as active_users FROM users WHERE is_active = TRUE AND role = 'user'");
  const { rows: r3 } = await pool.query("SELECT COALESCE(SUM(amount), 0) as total_revenue FROM transactions WHERE status = 'success'");
  const { rows: r4 } = await pool.query("SELECT COUNT(*) as total_transactions FROM transactions");
  res.json({ 
    success: true, 
    data: { 
      total_users: parseInt(r1[0].total_users, 10), 
      active_users: parseInt(r2[0].active_users, 10), 
      total_revenue: parseFloat(r3[0].total_revenue), 
      total_transactions: parseInt(r4[0].total_transactions, 10) 
    } 
  });
};

module.exports = { getUsers, toggleUserActive, getStats };
