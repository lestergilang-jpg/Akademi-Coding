const nodemailer = require('nodemailer');

// Setup Mailtrap transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST || "live.smtp.mailtrap.io",
  port: parseInt(process.env.MAILTRAP_PORT) || 587,
  secure: process.env.MAILTRAP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  },
  // Recommended for STARTTLS on port 587
  tls: {
    rejectUnauthorized: false // Helps avoid local cert issues, usually fine for SMTP
  }
});

const sendVerificationEmail = async (toEmail, token) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const verificationLink = `${backendUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: '"Cuma Ngeprompt" <noreply@cumangeprompt.com>',
    to: toEmail,
    subject: 'Verifikasi Akun Cuma Ngeprompt Anda',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d1a;color:#e2e8f0;border-radius:12px;overflow:hidden;border:1px solid #ffffff10;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🎉 Selamat Datang!</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:16px;line-height:1.6;">Halo,</p>
          <p style="font-size:14px;line-height:1.6;color:#94a3b8;">
            Terima kasih telah mendaftar di <strong>Cuma Ngeprompt</strong>. Untuk mengaktifkan akun kamu dan mulai belajar, silakan klik tombol di bawah ini:
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verificationLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:12px;font-weight:bold;box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">Verifikasi Email Saya</a>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;">
            Atau klik link ini jika tombol tidak berfungsi:<br/>
            <a href="${verificationLink}" style="color:#6366f1;word-break:break-all;">${verificationLink}</a>
          </p>
          <hr style="border:none;border-top:1px solid #ffffff10;margin:24px 0;" />
          <p style="color:#64748b;font-size:12px;text-align:center;">Salam hangat,<br/>Tim Cuma Ngeprompt</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to: ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

const sendPasswordResetEmail = async (toEmail, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Cuma Ngeprompt" <noreply@cumangeprompt.com>',
    to: toEmail,
    subject: 'Reset Password Cuma Ngeprompt Anda',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d1a;color:#e2e8f0;border-radius:12px;overflow:hidden;border:1px solid #ffffff10;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🔑 Reset Password</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:16px;line-height:1.6;">Halo,</p>
          <p style="font-size:14px;line-height:1.6;color:#94a3b8;">
            Kami menerima permintaan untuk mereset password akun <strong>Cuma Ngeprompt</strong> kamu. Klik tombol di bawah ini untuk mengatur ulang password:
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetLink}" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:12px;font-weight:bold;box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">Reset Password</a>
          </div>
          <p style="color:#d1d5db;background:#ef444420;padding:12px;border-radius:8px;font-size:12px;border-left:3 solid #ef4444;">
            ⏰ Tautan ini hanya berlaku selama <strong>15 menit</strong>. Jika kamu tidak meminta ini, silakan abaikan email ini.
          </p>
          <hr style="border:none;border-top:1px solid #ffffff10;margin:24px 0;" />
          <p style="color:#64748b;font-size:12px;text-align:center;">Salam hangat,<br/>Tim Cuma Ngeprompt</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to: ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

const sendInvoiceEmail = async (toEmail, userName, orderId, courseTitle, amount) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  const mailOptions = {
    from: '"Cuma Ngeprompt" <noreply@cumangeprompt.com>',
    to: toEmail,
    subject: `Invoice Pembayaran - Cuma Ngeprompt [${orderId}]`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d1a;color:#e2e8f0;border-radius:12px;overflow:hidden;border:1px solid #ffffff10;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🧾 Invoice Pembayaran</h1>
        </div>
        <div style="padding:32px 24px;">
          <p style="font-size:16px;line-height:1.6;">Halo, <strong>${userName}</strong>!</p>
          <p style="font-size:14px;line-height:1.6;color:#94a3b8;">
            Terima kasih telah memesan kursus di <strong>Cuma Ngeprompt</strong>. Berikut adalah rincian tagihan Anda:
          </p>
          
          <div style="background:#1e1e2e;padding:16px;border-radius:12px;margin:24px 0;border:1px solid #ffffff05;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
               <span style="color:#64748b;font-size:12px;">Order ID:</span>
               <span style="color:#e2e8f0;font-size:12px;font-family:monospace;">${orderId}</span>
            </div>
            <div style="margin-bottom:8px;">
               <span style="color:#64748b;font-size:12px;">Kursus:</span><br/>
               <span style="color:#e2e8f0;font-size:14px;font-weight:bold;">${courseTitle}</span>
            </div>
            <div style="padding-top:12px;border-top:1px solid #ffffff05;margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
               <span style="color:#64748b;font-size:12px;">Total Bayar:</span>
               <span style="color:#10b981;font-size:18px;font-weight:900;">Rp ${parseInt(amount).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <p style="font-size:13px;color:#94a3b8;text-align:center;margin-bottom:24px;">
            Status: <span style="color:#f59e0b;font-weight:bold;">PENDING</span>
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="${frontendUrl}/dashboard" style="display:inline-block;padding:14px 32px;background:#6366f1;color:white;text-decoration:none;border-radius:12px;font-weight:bold;box-shadow:0 10px 15px -3px rgba(99,102,241,0.3);">Selesaikan Pembayaran</a>
          </div>
          
          <hr style="border:none;border-top:1px solid #ffffff10;margin:24px 0;" />
          <p style="color:#64748b;font-size:12px;text-align:center;">Salam hangat,<br/>Tim Cuma Ngeprompt</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent to: ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending invoice email:', error);
    throw error;
  }
};

const sendEmailChangeOTP = async (toEmail, otp, newEmail) => {
  const mailOptions = {
    from: '"Cuma Ngeprompt" <noreply@cumangeprompt.com>',
    to: toEmail,
    subject: 'Kode OTP Verifikasi Ganti Email — Cuma Ngeprompt',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#0d0d1a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🔐 Verifikasi Ganti Email</h1>
        </div>
        <div style="padding:32px 24px;">
          <p>Halo,</p>
          <p>Kamu baru saja meminta untuk mengganti email akun <strong>Cuma Ngeprompt</strong> ke:</p>
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
          <p style="color:#64748b;font-size:12px;text-align:center;">Salam hangat,<br/>Tim Cuma Ngeprompt</p>
        </div>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendEmailChangeOTP,
};

