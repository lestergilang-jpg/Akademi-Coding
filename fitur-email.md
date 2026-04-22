# Rencana Implementasi: Fitur Email Verifikasi (OTP/Link)

Sistem pendaftaran yang sekarang memang mengizinkan siapa saja dengan _email palsu_ atau _asal-asalan_ untuk masuk ke sistem. Oleh karena itu, kita akan mengubah alurnya sehingga **tiap user baru wajib membuktikan kepemilikan emailnya sebelum bisa Login**.

Berikut kerangka arsitektur (_blueprint_) yang akan kita rombak:

## 1. Perombakan Database (Tabel Users)
Kita akan menambahkan setidaknya dua hingga tiga kolom di sisi *Database*:
- `is_verified` (BOOLEAN, otomatis FALSE untuk pendaftar baru).
- `verification_token` (VARCHAR, untuk menampung kode unik token rahasia verifikasi sementara).
- `verification_expires` (TIMESTAMP, opsional agar link-nya punya masa kadaluwarsa, misal 1 atau 24 jam).

## 2. Setting Pustaka Pengirim Email (Nodemailer)
- Waktu _user_ menekan "Daftar", _backend_ kita tidak akan langsung memberikan akses masuk (JWT token), melainkan akan menyusun pesannya dan memakai _library_ bernama **Nodemailer** untuk mengirim email sungguhan berisi URL verifikasi.
- Contoh email: *"Klik tautan ini untuk mengonfirmasi email Anda: http://.../api/auth/verify?token=XYZ"*

## 3. Penambahan Route Baru (Verifikasi)
- Kita akan buat endpoint baru di backend: `GET /api/auth/verify-email?token=<token_unik>`.
- Jika URL ini diklik dari email pengguna, sistem akan mengecek kecocokan `verification_token`. Bila sesuai, `is_verified` milik user tersebut akan diubah jadi **TRUE**.

## 4. Penahanan Login (Login Guard)
- Terakhir, di fungsi `admin` atau `login` biasa, sistem wajib dicegat di awal saat mengecek email & password. Jika `is_verified == FALSE`, maka lempar error *"Email Anda belum diverifikasi, tolong cek kotak masuk/spam email Anda"*.

---

## ❓ 3 Pertanyaan Klarifikasi Untuk Konfigurasi Email

Sebelum saya mulai menuliskan kode _backend_-nya, mohon konfirmasi beberapa hal ini:

1. **Penyedia SMTP Apa Yang Ingin Dipakai?**
   Untuk mengirim email, platform Anda butuh SMTP/Email Server. Anda mau pakai email apa sebagai pengirimnya? 
   *(Saran termudah & gratis: Memakai akun **Gmail biasa** (menggunakan Gmail App Password), atau pakai layanan khusus developer seperti **Resend** / **Mailtrap Sandbox**).*
2. **Perlakuan Khusus User Lama:** 
   Karena ada user lama yang sudah terdaftar di database saat ini (sebelum ada fitur ini), apakah Anda mau anggap mereka **otomatis sudah terverifikasi (auto-verified)**? Atau biarkan mereka tertolak sampai kita set manual database-nya?
3. **Sukses Verifikasi:** 
   Sesudah user mengklik URL konfirmasi dari kotak masuk email mereka, apakah Anda mau mereka dilempar / di-redirect otomatis ke halaman login frontend web Anda?

Tolong berikan jawabannya ya! Begitu *fix*, saya bisa langsung mengatur ulang _Backend_ sekaligus menghubungkan _Nodemailer_-nya.


1. saya mau pakai mailtrap sandbox dulu aja (bantu saya setup nya juga ya)
2. user lama otomatis sudah terverifikasi (auto-verified)
3. sesudah user mengklik URL konfirmasi dari kotak masuk email mereka, saya mau mereka dilempar / di-redirect otomatis ke halaman login frontend web saya


