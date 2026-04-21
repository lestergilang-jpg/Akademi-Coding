const nodemailer = require('nodemailer');

// Setup Mailtrap transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAILTRAP_PORT || 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

const sendVerificationEmail = async (toEmail, token) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const verificationLink = `${backendUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"Akademi Coding" <noreply@akademicoding.com>',
    to: toEmail,
    subject: 'Verifikasi Akun Akademi Coding Anda',
    html: `
      <h2>Selamat Datang di Akademi Coding!</h2>
      <p>Terima kasih telah mendaftar. Untuk mulai belajar dan bisa login, silakan verifikasi alamat email Anda dengan menekan tombol/tautan di bawah ini:</p>
      <a href="${verificationLink}" style="display:inline-block; padding:10px 20px; background-color:#5865F2; color:white; text-decoration:none; border-radius:5px;">Verifikasi Email Saya</a>
      <br/><br/>
      <p>Atau copy & paste tautan ini ke browser Anda: <br/> <a href="${verificationLink}">${verificationLink}</a></p>
      <br/>
      <p>Salam hangat,<br/>Tim Akademi Coding</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (toEmail, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Akademi Coding" <noreply@akademicoding.com>',
    to: toEmail,
    subject: 'Reset Password Akademi Coding Anda',
    html: `
      <h2>Permintaan Reset Password</h2>
      <p>Anda baru saja meminta untuk mereset password akun Akademi Coding Anda.</p>
      <p>Klik tombol di bawah ini untuk mengatur ulang password Anda. Tautan ini hanya berlaku selama 15 menit.</p>
      <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#5865F2; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
      <br/><br/>
      <p>Jika Anda tidak meminta reset password, abaikan saja email ini.</p>
      <p>Salam hangat,<br/>Tim Akademi Coding</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendInvoiceEmail = async (toEmail, userName, orderId, courseTitle, amount) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: '"Akademi Coding" <noreply@akademicoding.com>',
    to: toEmail,
    subject: `Invoice Pembayaran - Akademi Coding [${orderId}]`,
    html: `
      <h2>Halo, ${userName}!</h2>
      <p>Terima kasih telah memesan kursus di Akademi Coding. Berikut adalah rincian tagihan Anda:</p>
      <ul>
        <li><strong>Order ID:</strong> ${orderId}</li>
        <li><strong>Kursus:</strong> ${courseTitle}</li>
        <li><strong>Total Tagihan:</strong> Rp ${parseInt(amount).toLocaleString('id-ID')}</li>
      </ul>
      <p>Status pembayaran Anda saat ini adalah <strong>Pending</strong>.</p>
      <p>Untuk melanjutkan pembayaran, silakan masuk ke dashboard akun Anda, lalu menuju ke bagian "Riwayat Transaksi" dan klik tombol "Lanjutkan Pembayaran".</p>
      <a href="${frontendUrl}/dashboard" style="display:inline-block; padding:10px 20px; background-color:#5865F2; color:white; text-decoration:none; border-radius:5px;">Ke Dashboard</a>
      <br/><br/>
      <p>Jika Anda sudah melakukan pembayaran, silakan abaikan email ini.</p>
      <p>Salam hangat,<br/>Tim Akademi Coding</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendEmailChangeOTP = async (toEmail, otp, newEmail) => {
  const mailOptions = {
    from: '"Akademi Coding" <noreply@akademicoding.com>',
    to: toEmail,
    subject: 'Kode OTP Verifikasi Ganti Email — Akademi Coding',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d1a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🔐 Verifikasi Ganti Email</h1>
        </div>
        <div style="padding:32px 24px;">
          <p>Halo,</p>
          <p>Kamu baru saja meminta untuk mengganti email akun <strong>Akademi Coding</strong> ke:</p>
          <p style="background:#1e1e2e;padding:12px 16px;border-radius:8px;border-left:4px solid #6366f1;font-weight:bold;color:#a5b4fc;">
            ${newEmail}
          </p>
          <p>Gunakan kode OTP berikut untuk mengkonfirmasi perubahan ini:</p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;background:#1e1e2e;border:2px solid #6366f1;border-radius:16px;padding:20px 40px;">
              <span style="font-size:40px;font-weight:900;letter-spacing:10px;color:#a5b4fc;font-family:monospace;">${otp}</span>
            </div>
          </div>
          <p style="color:#94a3b8;font-size:13px;">⏰ Kode ini hanya berlaku selama <strong style="color:#e2e8f0;">15 menit</strong>.</p>
          <p style="color:#94a3b8;font-size:13px;">⚠️ Jika kamu tidak meminta perubahan ini, abaikan email ini. Akun kamu tetap aman.</p>
          <hr style="border-color:#ffffff15;margin:24px 0;" />
          <p style="color:#64748b;font-size:12px;text-align:center;">Salam hangat,<br/>Tim Akademi Coding</p>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendEmailChangeOTP,
};
