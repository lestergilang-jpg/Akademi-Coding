# Analisis Kendala: Tombol Beli Hilang Setelah Pembelian Pertama

## 1. Penyebab Masalah (Root Cause)
Masalah ini terletak pada logika pengecekan status di Frontend dan Backend yang menggunakan flag `is_active` pada tabel `users` sebagai penentu utama akses kursus.

### Detail Teknis:
1.  **Backend (`transactionController.js`)**: Saat pembayaran berhasil, sistem menjalankan:
    ```javascript
    await pool.query('UPDATE users SET is_active = TRUE WHERE id = $1', [userId]);
    ```
    Ini mengubah status user menjadi "Premium" secara global.
2.  **Frontend (`CourseDetailPage`)**: Banner pembelian (Paywall) dibungkus dengan kondisi:
    ```javascript
    {!user?.is_active && ( ... )}
    ```
    Karena `is_active` sudah bernilai `true` setelah pembelian pertama, maka banner pembelian akan **hilang selamanya** untuk kursus apapun, karena sistem menganggap user tersebut sudah memiliki akses global (Premium).

---

## 2. Solusi yang Diusulkan

Akses kursus harus didasarkan pada data di tabel `user_courses` (per kursus), bukan flag `is_active` (global). 

### Langkah Perbaikan:
1.  **Ubah Logika Tampilan Banner**: Ganti pengecekan `user.is_active` dengan pengecekan apakah kursus ID tertentu tersebut sudah ada di daftar kursus milik user.
2.  **Fetch Data Kepemilikan**: Sebelum menampilkan halaman detail kursus, frontend harus mengecek apakah user sudah membeli kursus spesifik tersebut.
3.  **Hapus Ketergantungan `is_active`**: Flag `is_active` mungkin tetap berguna untuk menandakan user yang sudah diverifikasi emailnya atau member berbayar, tapi jangan digunakan untuk membuka akses materi secara otomatis.

### Rencana Aksi Bangkitkan Tombol:
1.  Memperbaiki `CourseDetailPage` agar mengecek `hasAccess` berdasarkan tabel `user_courses`.
2.  Memastikan materi yang terbuka hanya yang ID-nya cocok dengan record di `user_courses`.

**Apakah Anda ingin saya langsung menerapkan perbaikan ini ke kode Anda?**
