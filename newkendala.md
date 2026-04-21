# Rencana Implementasi Perbaikan Kendala

Berikut adalah langkah-langkah implementasi (implementation plan) untuk menyelesaikan kendala terkait Login, Register, dan Payment.

## 1. Kendala Login
**Deskripsi Masalah:** 
Tidak ada feedback peringatan error yang spesifik jika pengguna memasukkan password yang salah atau email yang belum terdaftar.

**Rencana Implementasi:**
- **Backend (Auth Controller):** 
  - Modifikasi logika pengecekan login.
  - Jika logika mencari email di database dan *tidak ditemukan*, backend akan mengembalikan status `400` atau `404` dengan pesan khusus: `"Email ini belum terdaftar"`.
  - Jika email ditemukan namun pengecekan `bcrypt` / password gagal, backend akan mengembalikan status `401` dengan pesan khusus: `"Password yang Anda masukkan salah"`.
- **Frontend (`/src/app/login`):**
  - Tangkap response error dari backend (menggunakan `try/catch` pada pemanggilan API).
  - Simpan pesan error ke dalam state lokal (misalnya `setErrorMessage`).
  - Tampilkan pesan error tersebut di UI (bisa menggunakan komponen alert merah atau teks merah di bawah kolom input terkait).

## 2. Kendala Register
**Deskripsi Masalah:**
Form register butuh penambahan kolom data, validasi, serta link ke halaman Terms and Condition & Privacy Policy.

**Rencana Implementasi:**
- **Database Modifikasi:**
  - Update tabel `users` (atau struktur terkait) di backend agar siap menerima field tambahan: `whatsapp_number` dan `promo_code`.
- **Backend (Auth Controller - Register):**
  - Sesuaikan payload untuk menerima Data: `full_name`, `email`, `whatsapp_number`, `password`, dan `promo_code`.
  - Validasi kecocokan `password` dan `password_confirmation` (bisa juga divalidasi di frontend).
- **Frontend (`/src/app/register`):**
  - Ubah UI Form Register agar memuat input:
    1. Nama Lengkap
    2. Email
    3. Nomor WhatsApp
    4. Password
    5. Konfirmasi Password
    6. Kode Promo (Opsional)
  - Di atas atau sejajar dengan tombol submit, tambahkan kalimat seperti *"Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami."*
  - Berikan tag `<a>` atau komponen `<Link>` dari Next.js pada teks tersebut dengan prop `target="_blank"` agar terbuka di tab baru.
- **Pembuatan Halaman Statis:**
  - Buat file `src/app/terms/page.jsx` untuk menampilkan poin 1 hingga 9 berisi teks "Syarat & Ketentuan" yang Anda lampirkan.
  - Buat file `src/app/privacy/page.jsx` (atau gabungkan posisinya jika diperlukan).

## 3. Kendala Payment
**Deskripsi Masalah:**
- Klik silang di popup Midtrans menyebabkan status langsung "Gagal" dan menyulitkan pembayaran ulang.
- Tidak ada Email Invoice dan cara pembayaran yang terkirim ke pelanggan.

**Rencana Implementasi:**
- **Perbaikan Alur Popup Midtrans (Frontend & Backend):**
  - Pada implementasi Midtrans Snap JS, event `onClose()` (saat user klik silang) jangan langsung menembak API backend untuk mengubah status ke `failed` atau `gagal`.
  - Ubah status menjadi `pending`.
  - Sediakan tombol **"Bayar Lagi"** atau **"Lanjutkan Pembayaran"** di riwayat pesanan (User Dashboard/Payment Invoice Page). Tombol ini akan otomatis memicu `window.snap.pay(token)` menggunakan token yang sudah pernah di-generate sebelumnya (sebab token `pending` Midtrans masih valid dalam periode waktu tertentu, misalnya 24 jam).
- **Pengiriman Email Invoice:**
  - **Backend Integrasi:** Pada Controller khusus Payment (saat status order *dibuat* / `pending`), panggil utilitas Email (`src/utils/mailer.js`).
  - Siapkan template email HTML di fungsi `mailer.js` yang merangkum: 
    - Nomor Tagihan (Invoice ID)
    - Detail Kursus / Layanan
    - Total Pembayaran
    - Instruksi / Link untuk melanjutkan proses pembayaran ke Midtrans.
  - Gunakan SMTP Nodemailer untuk mengirim email tersebut ke alamat `email` pengguna yang diinput.

---

### Daftar Pertanyaan (Untuk Klarifikasi)
Sebelum eksekusi ini dimulai, ada beberapa hal yang mohon Anda konfirmasi:
1. **Promo Code:** Apakah kode promo di form registrasi perlu langsung dicek *validitasnya* ke database pada saat itu juga (memotong harga otomatis), atau sekadar disimpan datanya sebagai referensi tim sales/admin?
2. **Kebijakan Privasi:** Anda melampirkan isi untuk Syarat & Ketentuan. Apakah dokumen/teks lengkap untuk **Kebijakan Privasi** sudah siap? Atau apakah Anda ingin saya buatkan template standarnya, atau menaruhnya menjadi satu halaman dengan Syarat & Ketentuan (karena di nomor 7 sudah sempat disebut)?
3. **Status Midtrans:** Setuju ya, saat popup di-silang asumsikan status menjadi **Pending** di database, bukan *Failed*, supaya kita bisa kasih tombol "Bayar Lagi" dengan resnap token?

Jika disetujui, saya akan lanjut melakukan koding backend dan frontend-nya.

1. Promo code tidak perlu dicek validitasnya di database pada saat itu juga (memotong harga otomatis), cukup disimpan datanya sebagai referensi tim sales/admin (mungkin kedepan nya akan saya ubah dan harus divalidasi untuk sekarang gausah dulu)
2. ya buatkan satu halaman aja untuk syarat dan ketentuan dan kebijakan privasi
3. setuju


