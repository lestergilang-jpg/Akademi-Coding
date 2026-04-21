# Desain Arsitektur Dashboard & Manajemen Akun

Dokumen ini merangkum perbaikan arsitektur dan alur sistem untuk bagian login, routing dashboard, dan pengaturan profil agar lebih aman, terstruktur, dan profesional.

## 1. Alur Login & Penanganan Error
- **Notifikasi Error (Feedback User):** Saat user mencoba login dan gagal (karena password atau email salah), sistem harus mengembalikan HTTP status 401 (Unauthorized) dari backend. Frontend menangkap error ini dan menampilkan *toast* atau pesan peringatan berwarna merah (misal: "Email atau password yang Anda masukkan salah, silakan coba lagi.").
- **Rate Limiting:** Untuk mencegah *brute-force attack*, batasi percobaan login gagal (misal maksimal 5 kali berturut-turut, lalu akun terkena *cooldown* 15 menit).

## 2. Arsitektur Routing & Layout Dashboard
Untuk mengatasi masalah sidebar yang hilang di mobile dan sesi yang bertumpuk, kita akan menggunakan pendekatan **Dashboard Layouting** dengan _Nested Routing_.

**Struktur Routing (Contoh):**
- `/dashboard` -> Halaman utama/Overview
- `/dashboard/katalog-kursus` -> Halaman khusus katalog kursus
- `/dashboard/setting` -> Halaman khusus pengaturan profil akun

**UI/UX Layout & Responsivitas:**
- **State Sidebar:** Menggunakan sistem *state* (misalnya disisipkan menggunakan context atau state manager) yang mengatur apakah sidebar sedang terbuka (expanded) atau tertutup (collapsed).
- **Desktop:** Sidebar berada di sebelah kiri dan bersifat statis/tetap (*fixed*).
- **Mobile/Tablet:** Sidebar tersembunyi (*hidden* secara default) menggunakan *off-canvas menu*. Akan muncul tombol **Hamburger Menu (☰)** di bagian _Navbar_ atas. Jika tombol ini diklik, sidebar akan muncul dari samping (memakai animasi _slide-in_). Terdapat peneduh (_overlay_ / _backdrop_) di belakangnya agar user fokus ke sidebar.

## 3. Sistem Pengaturan Akun (`/dashboard/setting`)

### a. Profil Dasar
- **Nama Lengkap:** Input teks biasa. Divalidasi agar tidak kosong.
- **Nomor WhatsApp:** Input teks dengan validasi khusus nomor telepon (misalnya tidak boleh ada karakter huruf dan awalan kode negara).

### b. Ganti Email (High Security)
*Tujuan: Mencegah pengambilalihan akun secara cepat jika sesi device terbajak pengguna tak berwenang.*
- **Step 1:** User mengganti input email dan klik "Simpan".
- **Step 2:** Sistem akan membekukan perubahan dan mengirimkan **Kode OTP / Link Konfirmasi** ke **Email Lama**.
- **Step 3:** Di layar, muncul modal prompt meminta user memasukkan kode OTP tersebut (atau menunggu mereka klik link).
- **Step 4:** (Opsional & Sangat Direkomendasikan) Setelah diverifikasi di email lama, kirim link verifikasi ke **Email Baru** untuk memastikan email baru valid dan tidak typo. Jika valid, email di database baru diperbarui.

### c. Ganti Password (Aman & Profesional)
- **Form Ganti Password:** Wajib menyediakan tiga kolom:
  1. Password Lama
  2. Password Baru
  3. Konfirmasi Password Baru
- **Validasi:** Backend harus mencek kecocokan "Password Lama" yang diinput dengan yang ada di database menggunakan *hash comparison* (misal bcrypt) sebelum memperbarui ke password baru.
- **Fitur Lupa Password:** Tepat di bawah form "Password Lama", berikan link teks kecil **"Lupa Password?"**. Jika diklik, user akan diarahkan ke alur *Forgot Password* (kirim email reset password ke email yang terdaftar), sehingga jika memang lupa, mereka punya jalan keluar yang aman.
