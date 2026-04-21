# Rencana Rebranding: Cuma Ngeprompt

## 🔍 Perubahan Utama
Mengubah identitas brand dari "Akademi Coding" menjadi **"Cuma Ngeprompt"** di seluruh sistem.

## 💡 Cakupan Rebranding
1.  **Frontend Identity**:
    *   Mengubah teks logo gradasi dari `AkademiCoding` menjadi `CumaNgeprompt`.
    *   Update SEO metadata (Title & Description) di semua halaman.
    *   Update halaman Syarat & Ketentuan (Terms & Conditions) agar menggunakan identitas hukum yang baru.
    *   Update folder verifikasi email dan pesan sukses registrasi.
2.  **Backend & Email**:
    *   Update pengirim email (*Sender Name*) dari "Akademi Coding" menjadi "Cuma Ngeprompt".
    *   Update alamat email pengirim menjadi `noreply@cumangeprompt.com`.
    *   Update subjek email dan isi konten (*body*) email agar menggunakan brand baru.
    *   Update domain URL di email agar mengarah ke `cumangeprompt.com`.
3.  **Database Landing Page**:
    *   Membuat migration script (atau SQL update) untuk mengubah data di tabel `settings` (Title Hero, Deskripsi, dll) agar sesuai brand baru.

## 🛠️ Langkah-Langkah
*   [ ] Tahap 1: Update Email Utility (`mailer.js`).
*   [ ] Tahap 2: Global Search & Replace di Frontend components.
*   [ ] Tahap 3: Update dokumentasi hukum di `terms/page.jsx`.
*   [ ] Tahap 4: Update Database Settings via manual script or admin.

---

**Saya akan memulai dari perubahan backend dan dilanjutkan secara menyeluruh. Mohon tunggu prosesnya.**
