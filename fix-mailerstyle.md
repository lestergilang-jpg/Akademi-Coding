# Perbaikan Style Template Email (Mailer)

## 🔍 Masalah Utama
Saat ini tampilan email untuk Verifikasi Akun, Reset Password, dan Invoice Pembayaran masih sangat standar (Plain HTML dengan tombol sederhana). Sementara itu, template **Ganti Email (OTP)** sudah menggunakan desain modern (Dark Mode, Gradient Header, Card Style). 

User menginginkan semua template email memiliki desain yang seragam dan profesional mengikuti gaya Akademi Coding.

## 💡 Solusi: Standardisasi Desain Email
Saya akan menerapkan desain "Premium Dark Theme" ke seluruh fungsi pengiriman email di `backend/src/utils/mailer.js`.

**Elemen Desain yang Digunakan:**
*   **Warna Background:** `#0d0d1a` (Deep Dark Blue).
*   **Header:** Gradient background (`#6366f1` ke `#8b5cf6`) dengan ikon emoji + Judul.
*   **Tipografi:** Font Arial/Sans-serif dengan warna konten `#e2e8f0`.
*   **Tombol/Aksi:** Style tombol yang lebar, bulat, dan kontras atau kotak kode yang besar.
*   **Footer:** Teks kecil abu-abu dengan divider halus.

## 🛠️ Langkah Implementasi
1.  **`sendVerificationEmail`**: Update tampilan dengan header "🎉 Verifikasi Akun" dan tombol verifikasi yang baru.
2.  **`sendPasswordResetEmail`**: Update tampilan dengan header "🔑 Reset Password" dan peringatan keamanan yang lebih jelas.
3.  **`sendInvoiceEmail`**: Update tampilan dengan header "🧾 Invoice Pembayaran" dan penulisan nominal harga yang lebih rapi di dalam card.

---

**Saya akan segera melakukan perubahan pada file `backend/src/utils/mailer.js`. Mohon ditunggu.**
