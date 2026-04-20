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

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
