const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
  }

  try {
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows: result } = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [name, email, hashedPassword]
    );

    const token = generateToken(result[0].id);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { token, user: { id: result[0].id, name, email, role: 'user', is_active: false } },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

// PUT /api/auth/profile (Feature 1)
const updateProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.user.id;

  try {
    // Check if email belongs to someone else
    if (email) {
      const { rows: existing } = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existing.length) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan pengguna lain.' });
      }
    }

    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Dynamic update
    if (name && email && hashedPassword) {
      await pool.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4', [name, email, hashedPassword, userId]);
    } else if (name && email) {
      await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);
    }

    const { rows } = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: { user: rows[0] } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui profil.' });
  }
};

module.exports = { register, login, getMe, updateProfile };
