const { pool } = require('../config/database');

// GET /api/admin/settings/:key
const getSettings = async (req, res) => {
  try {
    const { key } = req.params;
    const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Settings not found' });
    }
    res.json({ success: true, data: rows[0].value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/settings/:key
const updateSettings = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
      [key, value]
    );
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
