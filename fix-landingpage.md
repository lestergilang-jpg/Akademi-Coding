# Rencana Pembaruan Landing Page: Pembersihan Emoticon & Animasi Scroll

## 🔍 Perubahan Utama
1.  **Eliminasi Emoticon**: Menghapus semua emoji/emoticon dari teks Landing Page agar tampilan lebih bersih dan profesional sesuai permintaan user.
2.  **Animasi Scroll (Vibe Check)**: Mengimplementasikan **Framer Motion** untuk memberikan efek *Fade-In*, *Fade-Up*, dan *Slide* saat elemen masuk ke dalam viewport (saat di-scroll).

## 🛠️ Langkah-Langkah Implementasi
*   [ ] **Pembersihan**: Sisir seluruh komponen di `frontend/src/app/page.jsx` dan hapus sisa emoji yang masih ada.
*   [ ] **Integasi Framer Motion**:
    *   Import `motion` dari `framer-motion`.
    *   Gunakan `initial={{ opacity: 0, y: 20 }}` dan `whileInView={{ opacity: 1, y: 0 }}` pada section utama.
    *   Tambahkan `staggerChildren` untuk elemen list (seperti fitur atau testimoni) agar muncul bergantian.
*   [ ] **Optimasi Performa**: Menggunakan prop `viewport={{ once: true }}` agar animasi hanya berjalan sekali saat pertama kali terlihat, menjaga performa tetap ringan.

---

**Saya akan segera memulai modifikasi pada frontend. Mohon tunggu prosesnya.**
