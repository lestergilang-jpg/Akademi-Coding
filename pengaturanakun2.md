# Rencana Arsitektur & Implementasi: Profil, Password, dan Reset Password

Berikut adalah rancangan/arsitektur terbaik (Best Practice) untuk mengimplementasikan ketiga fitur baru yang kamu minta.

---

## 1. Fitur Ganti Foto Profil (Avatar)
Kita perlu sebuah mekanisme agar User bisa mengunggah gambar gambar dari komputernya.
* **Database:** Tambahkan kolom baru di tabel `users` yaitu `avatar_url` (tipe `VARCHAR(500)`).
* **Backend (Node.js/Express):** 
  - Kita akan menginstal *library* **Multer** di backend untuk menerima kiriman file gambar dari frontend.
  - Gambar akan disimpan secara lokal di folder `backend/public/uploads/avatars/`. (Atau jika nanti proyek membesar, bisa diganti ke *Cloudinary/AWS S3*).
  - Buat Endpoint baru khusus: `POST /api/auth/avatar` yang menerima FormData berisi gambar.
* **Frontend (Next.js):**
  - Di halaman pengaturan, sediakan `<input type="file" />` tersembunyi yang akan jalan ketika user menekan lingkaran foto profil mereka saat ini.
  - Berikan API untuk menampilkan kembali (preview) *URL image* yang baru diunggah.

---

## 2. Fitur Validasi Password Lama (Security Update)
Ini sangat penting! Mengizinkan perubahan password tanpa verifikasi password lama sangat riskan.
* **Backend (Update Controller `updateProfile`):**
  - Ubah skema *endpoint* `PUT /api/auth/profile`.
  - Alih-alih hanya menerima `password` baru, sekarang ambil input berupa `currentPassword` dan `newPassword`.
  - Cari user di database, lalu lakukan `bcrypt.compare(currentPassword, user.password)`.
  - Jika salah, kembalikan response `400 Bad Request` ("Password lama salah").
  - Jika benar, *hash* `newPassword` yang baru, lalu `UPDATE` ke database.
* **Frontend:**
  - Tambahkan 2 buah kolom di form pengaturan akun: "Password Saat Ini" dan "Password Baru".
  - Jika user masuk via Discord (terkadang tak punya password), beri pengecualian atau notifikasi khusus.

---

## 3. Fitur Lupa Password (Forgot Password) via Email
Mekanisme ini mirip dengan *verifikasi email*, namun memakai *Token* yang berbeda karena masa berlakunya harus dibatasi sangat singkat (contoh: 15 - 30 menit).
* **Database:** 
  - Tambahkan dua kolom di tabel `users` yakni `reset_password_token` (VARCHAR) dan `reset_password_expires` (TIMESTAMP).
* **Backend:**
  - **Endpoint 1: `POST /api/auth/forgot-password`**
    - Menerima `email` dari body. Jika email ada di DB, _generate_ token acak 64-karakter, simpan ke `reset_password_token`, dan hitung 15 menit ke depan untuk `reset_password_expires`.
    - Gunakan **Nodemailer** yang sudah di-setup sebelumnya, kirim *email* berisi link: `http://localhost:3000/reset-password?token=XYZ...`
  - **Endpoint 2: `POST /api/auth/reset-password`**
    - Menerima kumpulan data `token` dan `newPassword`.
    - Cocokkan token dan pastikan waktu `reset_password_expires` belum kedaluwarsa.
    - Ubah password user menjadi Hash `newPassword`, setelah itu *Null-kan* (hapus) nilai `reset_password_token`.
* **Frontend:**
  - **Halaman Login:** Tambahkan tombol/link "Lupa Password?" dan arahkan ke bawah.
  - **Halaman `/forgot-password`**: Menampilkan 1 input khusus untuk mengisi Email.
  - **Halaman `/reset-password`**: Menampilkan 2 buah field (Password Baru & Konfirmasi Password Baru) lalu jalankan Fetch API-nya.

---

### Langkah Apa yang Akan Kita Kerjakan Terlebih Dahulu?

Saran saya, kita bagi pengerjaannya menjadi 3 fase:
1. **Fase 1 (Keamanan Akun):** Menambahkan Validasi *Password Lama* pada saat *Update Profile* karena ini yang paling mendesak secara *Security*.
2. **Fase 2 (Reset Password):** Pembuatan alur "Lupa Password", karena ini nyambung dari fitur Nodemailer sebelumnya.
3. **Fase 3 (Foto Profil):** Multer Setup & penambahan sistem unggah foto di Front-End dan pengikatan (*Binding*) datanya di header navbar/dashboard.

Beritahu saya jika kamu setuju dengan struktur ini, dan kita akan mulai mengeksekusi **Fase 1 dan Fase 2** sekarang!
