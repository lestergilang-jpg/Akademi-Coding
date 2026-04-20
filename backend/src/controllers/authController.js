const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const { sendVerificationEmail } = require('../utils/mailer');

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
    const verificationToken = uuidv4();

    const { rows: result } = await pool.query(
      'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashedPassword, false, verificationToken]
    );

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    let role = 'user';
    let is_verified = false;
    
    // Auto-verify and promote if admin email
    if (adminEmails.includes(email.toLowerCase())) {
      role = 'admin';
      is_verified = true;
      await pool.query("UPDATE users SET role = 'admin', is_verified = TRUE WHERE id = $1", [result[0].id]);
    } else {
      // Send the verification email to normal users
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    }

    // Do NOT return a token for unverified normal users to prevent auto-login
    if (!is_verified) {
      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Silakan cek kotak masuk atau folder spam email Anda untuk link verifikasi sebelum login.',
        data: null
      });
    }

    const token = generateToken(result[0].id);
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: { token, user: { id: result[0].id, name, email, role, is_active: false, avatar_url: null } },
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

    // Check .env for auto-admin (also auto-verifies them)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (adminEmails.includes(user.email.toLowerCase())) {
      if (user.role !== 'admin' || !user.is_verified) {
        user.role = 'admin';
        user.is_verified = true;
        await pool.query("UPDATE users SET role = 'admin', is_verified = TRUE WHERE id = $1", [user.id]);
      }
    }

    if (!user.is_verified) {
      return res.status(401).json({ success: false, message: 'Akun Anda belum terverifikasi. Silakan cek email Anda.' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, is_active: user.is_active, avatar_url: user.avatar_url },
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
  const { name, email, currentPassword, password } = req.body;
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
      const { rows: userRows } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
      const dbUser = userRows[0];
      
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Password saat ini wajib diisi untuk keamanan.' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Password saat ini salah.' });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Dynamic update
    if (name && email && hashedPassword) {
      await pool.query('UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4', [name, email, hashedPassword, userId]);
    } else if (name && email) {
      await pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3', [name, email, userId]);
    }

    const { rows } = await pool.query('SELECT id, name, email, role, is_active, avatar_url FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'Profil berhasil diperbarui.', data: { user: rows[0] } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memperbarui profil.' });
  }
};

// PUT /api/auth/profile/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file gambar yang diunggah.' });
    }
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, req.user.id]);
    
    const { rows } = await pool.query('SELECT id, name, email, role, is_active, avatar_url FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: 'Foto profil berhasil diperbarui.', data: { user: rows[0] } });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat unggah foto.' });
  }
};

// GET /api/auth/verify-email
const verifyEmail = async (req, res) => {
  const { token } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (!token) {
    return res.redirect(`${FRONTEND_URL}/login?verify=error`);
  }

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE verification_token = $1 AND is_verified = FALSE', [token]);
    
    if (!rows.length) {
      return res.redirect(`${FRONTEND_URL}/login?verify=invalid`);
    }

    await pool.query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1', [rows[0].id]);
    res.redirect(`${FRONTEND_URL}/login?verify=success`);
  } catch (err) {
    console.error('Verify Email Error:', err);
    res.redirect(`${FRONTEND_URL}/login?verify=error`);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
  
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });
    }
    
    const resetToken = uuidv4();
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins
    
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3',
      [resetToken, expires, rows[0].id]
    );
    
    const { sendPasswordResetEmail } = require('../utils/mailer');
    await sendPasswordResetEmail(email, resetToken);
    
    res.json({ success: true, message: 'Link reset password telah dikirim ke email Anda.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi.' });
  if (newPassword.length < 8) return res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
  
  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()',
      [token]
    );
    
    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2',
      [hashedPassword, rows[0].id]
    );
    
    res.json({ success: true, message: 'Password berhasil diubah. Silakan login dengan password baru.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = { register, login, getMe, updateProfile, updateAvatar, verifyEmail, forgotPassword, resetPassword };
