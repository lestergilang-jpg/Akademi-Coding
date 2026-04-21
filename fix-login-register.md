# Perbaikan Alur Registrasi & Feedback Login

## 1. Alur Registrasi (Email Verification)
Masalah sebelumnya adalah user sering melewatkan pop-up "Cek Email" setelah register karena tampilannya yang terlalu kecil dan cepat hilang.

**Penyebab:** Registrasi hanya mengandalkan `toast` dan langsung me-redirect ke login.
**Solusi:**
- Menambahkan **Halaman Sukses Registrasi** statis di dalam `RegisterPage`.
- Jika pendaftaran berhasil, form akan berganti menjadi tampilan instruksi verifikasi.
- Menambahkan tombol **"Kirim Ulang Email"** yang terhubung ke API baru agar user tidak perlu mendaftar ulang jika email tidak sampai.
- Memberikan panduan eksplisit (Cek folder spam/promosi).

## 2. Peringatan Login (Persistent & Animasi)
Masalahnya adalah pesan error password salah menghilang terlalu cepat saat user mulai mengetik, sehingga user kadang tidak sempat membaca detail kesalahannya.

**Solusi:**
- Menghapus pembersihan alert otomatis saat user mengetik. Alert sekarang hanya akan hilang jika user menekan tombol "Masuk" kembali atau login berhasil.
- Menambahkan **Animasi Shake (Getar)** pada kartu login jika terjadi kesalahan (password salah/email tidak ada) untuk memberi sinyal visual yang kuat.

## 3. Detail Teknis
*   **Backend**: Menambahkan endpoint `POST /api/auth/resend-verification`.
*   **CSS**: Menambahkan keyframes `@keyframes shake` di `globals.css`.
*   **Frontend**: Penambahan state `isRegistered` di `register/page.jsx` dan `isShaking` di `login/page.jsx`.

**Perubahan sudah diterapkan dan siap digunakan!**
