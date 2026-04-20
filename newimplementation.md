# Rencana Implementasi Fitur Integrasi Discord

Fitur ini akan memberikan fungsi bagi pengguna untuk mengintegrasikan akun akademi mereka dengan aplikasi Discord. Berdasarkan deskripsi Anda, fitur ini terbagi menjadi dua fungsionalitas utama: Mendaftar/Login dengan Discord (SSO), dan Menghubungkan (Link) akun ke Server Discord Anda setelah pembelian.

## 1. Perubahan pada Database (Schema)
Tabel `users` saat ini hanya menyimpan data email dan password lokal. Kita perlu menambahkan kolom untuk menyimpan identitas pengguna dari Discord.
- Tambahkan kolom `discord_id` (`VARCHAR`, opsional/null).
- Tambahkan kolom `discord_username` (`VARCHAR`, opsional/null).
- Karena pendaftaran via Discord tidak membutuhkan instruksi password lokal, kolom `password` harus dimodifikasi supaya bisa `NULL` ATAU kita berikan `default random password` bagi mereka yang registrasi murni lewat Discord.

## 2. Pendaftaran dan Login dengan Discord (SSO)
- Kita akan menambahkan rute di backend:
  - `GET /api/auth/discord`: Untuk mengarahkan (redirect) pengguna ke halaman persetujuan Discord.
  - `GET /api/auth/discord/callback`: Untuk menangani kode token yang diberikan Discord, lalu membaca data profil (`id` dan `username/email`).
- **Alur Login/Register**: 
  1. Jika `discord_id` sudah ada di database, langsung login dan hasilkan token JWT.
  2. Jika belum ada, tapi email-nya terdaftar, kita hubungkan (`link`) akun Discord tersebut ke email yang sudah ada (dengan mengecek email Discord).
  3. Jika akun/email belum ada sama sekali, kita buatkan *User* baru dengan data dari Discord tersebut.

## 3. Fitur "Link to Discord Server" di Dashboard
- Di bagian Dashboard pengguna (di `frontend/src/app/dashboard/page.jsx`), di tab "Pengaturan Profil" atau melalui _banner/popup_ khusus bagi member premium (`is_active = TRUE`), kita siapkan tombol **"Hubungkan ke Discord"**.
- Jika pengguna belum connect Discord, tombol ini akan meminta persetujuan OAuth2.
- Setelah berhasil login/terhubung dengan Discord, sistem akan otomatis:
  - Menggabungkan (join) user tersebut ke Server (Guild) Discord Anda secara otomatis menggunakan kapabilitas API Bot Discord (Scope: `guilds.join`).
  - (Opsional) Memberikan Role *Role Premium/Student* di server Discord Anda khusus bagi mereka yang sudah bayar (`user.is_active = TRUE`).

---

## ❓ Pertanyaan Klarifikasi Sebelum Mulai Coding

Agar implementasinya sesuai ekspektasi Anda, saya butuh jawaban untuk mengatur *logic* dan *scope* API-nya:

1. **Tentang Server Discord (Guild):** Apakah Anda ingin bot secara **otomatis memasukkan** user ke dalam server Discord Anda (tanpa perlu klik link invite)? Atau cukup menyediakan link invite (URL biasa) yang hanya muncul setelah user berhasil login/bayar?
2. **Role Otomatis (Auto Role):** Apakah Anda ingin sistem kita **secara otomatis memberikan Role khusus** (misalnya "Premium Student") di Server Discord Anda kepada user yang sudah berhasil membayar?
3. **Prioritas Pendaftaran:** Untuk pendaftaran di awal halaman login, apakah kita perlu menampilkan tombol besar "Login with Discord", atau tombol Discord ini eksklusif hanya ditaruh di dalam Dashboard setelah mereka registrasi biasa dan menyelesaikan pembayaran?

Silakan beri tahu saya preferensi jawaban Anda untuk poin di atas, lalu kita akan melangkah ke tahap *coding*-nya!

jawaban :
1. ya bisa otomatis memasukkan user ke dalam server discord saya (tanpa perlu klik link invite)
2. ya bisa otomatis memberikan role khusus (misalnya "Premium Student") di server discord saya kepada user yang sudah berhasil membayar
3. ya tombol tombol Discord ini eksklusif hanya ditaruh di dalam Dashboard setelah mereka registrasi biasa dan menyelesaikan pembayaran