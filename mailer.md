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


halo tampilan email diatas masih kaku banget, coba kamu desain ulang ya biar selaras dengan UI dashboard saya
jadi biar keliatan lebih profesional, tolong bantu ubah kode nya ya, jangan langsung terapkan di mailer.js tapi buatkan aja file baru newmailer.md nanti biar aku liat dulu tampilan baru nya seperti apa, saya kasih referensi UI nya di bawah ini

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Styling dasar untuk memastikan tampilan bersih di semua device */
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f4; padding-bottom: 40px; }
    .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 500px; border-spacing: 0; color: #232323; }
    .button { background-color: #5865F2; border-radius: 4px; color: #ffffff !important; display: block; font-size: 14px; font-weight: 700; line-height: 17px; padding: 14px; text-align: center; text-decoration: none; }
    .footer { width: 100%; max-width: 500px; margin: 0 auto; color: #a4a4a4; font-size: 12px; }
  </style>
</head>
<body>
  <center class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td height="40"></td></tr>
    </table>

    <table class="main" cellpadding="0" cellspacing="0">
      <tbody>
        <tr>
          <td style="padding: 30px 40px 10px 40px;">
            <div style="font-size: 20px; font-weight: bold; color: #5865F2; letter-spacing: 1px;">AKADEMI CODING</div>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px 40px; font-size: 32px; font-weight: 700; line-height: 38px; letter-spacing: -1px;">
            Reset Password Anda
          </td>
        </tr>

        <tr>
          <td style="padding: 10px 40px; font-size: 16px; line-height: 22px; color: #444444;">
            Halo, <br><br>
            Anda baru saja meminta untuk mengatur ulang password akun Akademi Coding Anda. Klik tombol di bawah ini untuk melanjutkan. 
            <p style="font-weight: bold; color: #e50914; font-size: 14px;">Tautan ini hanya berlaku selama 15 menit.</p>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <a href="${resetLink}" class="button">Reset Password</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding: 20px 40px 40px 40px; font-size: 14px; line-height: 20px; color: #777777;">
            Jika Anda tidak merasa meminta perubahan ini, abaikan saja email ini. Keamanan akun Anda adalah prioritas kami.
            <br><br>
            Salam hangat,<br>
            <strong>Tim Akademi Coding</strong>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="border-top: 2px solid #221f1f; font-size: 0; line-height: 0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>

    <table class="footer" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding: 30px 40px; text-align: left;">
          <p style="margin: 0; padding-bottom: 10px;">Ada pertanyaan? Hubungi Support kami.</p>
          <p style="margin: 0;">&copy; 2026 Akademi Coding Pte. Ltd.</p>
          <p style="font-size: 11px; margin-top: 15px;">
            Email ini dikirimkan otomatis sebagai bagian dari layanan keanggotaan Anda.
          </p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>

