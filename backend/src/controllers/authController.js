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
  const { name, email, password, whatsapp_number, promo_code } = req.body;

  if (!name || !email || !password || !whatsapp_number) {
    return res.status(400).json({ success: false, message: 'Nama, email, password, dan nomor WhatsApp wajib diisi.' });
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
      'INSERT INTO users (name, email, password, whatsapp_number, promo_code, is_verified, verification_token) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, email, hashedPassword, whatsapp_number, promo_code || null, false, verificationToken]
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
      return res.status(404).json({ success: false, message: 'Email ini belum terdaftar.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Password yang Anda masukkan salah.' });
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

// POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi.' });

  try {
    const { rows } = await pool.query('SELECT id, verification_token, is_verified FROM users WHERE email = $1', [email]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });
    }
    if (rows[0].is_verified) {
      return res.status(400).json({ success: false, message: 'Akun sudah terverifikasi. Silakan login.' });
    }

    await sendVerificationEmail(email, rows[0].verification_token);
    res.json({ success: true, message: 'Email verifikasi telah dikirim ulang.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengirim ulang email.' });
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

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'Semua kolom password wajib diisi.' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Konfirmasi password tidak cocok.' });
  }

  try {
    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini yang Anda masukkan salah.' });
    }
    if (await bcrypt.compare(newPassword, rows[0].password)) {
      return res.status(400).json({ success: false, message: 'Password baru tidak boleh sama dengan password saat ini.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.json({ success: true, message: 'Password berhasil diperbarui. Silakan login kembali jika diperlukan.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/request-email-change
// Kirim OTP 6-digit ke email LAMA untuk verifikasi sebelum ganti email
const requestEmailChange = async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;

  if (!newEmail) {
    return res.status(400).json({ success: false, message: 'Email baru wajib diisi.' });
  }

  // Cek format email dasar
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
  }

  try {
    // Pastikan email baru belum dipakai pengguna lain
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [newEmail, userId]
    );
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email ini sudah digunakan oleh akun lain.' });
    }

    // Pastikan email baru tidak sama dengan email saat ini
    const { rows: current } = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (current[0].email.toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Email baru tidak boleh sama dengan email saat ini.' });
    }

    // Generate OTP 6-digit
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 15 * 60000); // 15 menit

    await pool.query(
      'UPDATE users SET email_change_otp = $1, email_change_otp_expires = $2, email_change_new_email = $3 WHERE id = $4',
      [otp, expires, newEmail, userId]
    );

    const { sendEmailChangeOTP } = require('../utils/mailer');
    await sendEmailChangeOTP(current[0].email, otp, newEmail);

    res.json({
      success: true,
      message: `Kode OTP telah dikirim ke email lama Anda (${current[0].email}). Kode berlaku 15 menit.`,
    });
  } catch (error) {
    console.error('Request email change error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// POST /api/auth/verify-email-change
// Verifikasi OTP dan terapkan perubahan email
const verifyEmailChange = async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;

  if (!otp) {
    return res.status(400).json({ success: false, message: 'Kode OTP wajib diisi.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT email_change_otp, email_change_otp_expires, email_change_new_email FROM users WHERE id = $1',
      [userId]
    );
    const user = rows[0];

    if (!user.email_change_otp || !user.email_change_new_email) {
      return res.status(400).json({ success: false, message: 'Tidak ada permintaan ganti email yang aktif.' });
    }
    if (new Date() > new Date(user.email_change_otp_expires)) {
      return res.status(400).json({ success: false, message: 'Kode OTP sudah kedaluwarsa. Silakan minta ulang.' });
    }
    if (user.email_change_otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid. Periksa kembali kode yang dikirim ke email Anda.' });
    }

    // Terapkan perubahan email & bersihkan kolom OTP
    await pool.query(
      `UPDATE users
       SET email = $1,
           email_change_otp = NULL,
           email_change_otp_expires = NULL,
           email_change_new_email = NULL
       WHERE id = $2`,
      [user.email_change_new_email, userId]
    );

    res.json({
      success: true,
      message: `Email berhasil diperbarui menjadi ${user.email_change_new_email}.`,
    });
  } catch (error) {
    console.error('Verify email change error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

module.exports = {
  register, login, getMe, updateProfile, updateAvatar, verifyEmail,
  forgotPassword, resetPassword,
  resendVerification,
  changePassword, requestEmailChange, verifyEmailChange,
};
