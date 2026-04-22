# Rencana Implementasi: Fitur Testimoni Real-Time

## 🎯 Objektif
Mengganti testimoni statis (dummy) di landing page dengan data asli yang diisi oleh pengguna melalui dashboard.

## 🛠️ Perubahan Teknis

### 1. Database (PostgreSQL)
Membuat tabel `testimonials` untuk menyimpan data ulasan.
```sql
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  occupation VARCHAR(255), -- Pekerjaan user (misal: "Mahasiswa", "Freelancer")
  is_public BOOLEAN DEFAULT FALSE, -- Kontrol tampil di landing page
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend API (Node.js)
*   `GET /api/testimonials/public`: Mengambil semua testimoni yang `is_public = true` untuk landing page.
*   `GET /api/testimonials/me`: Mengambil data testimoni milik user yang sedang login.
*   `POST /api/testimonials`: Membuat testimoni baru (Validasi: User harus sudah membeli minimal 1 kursus).
*   `PUT /api/testimonials/:id`: Mengupdate isi, rating, pekerjaan, atau status publik.
*   `DELETE /api/testimonials/:id`: Menghapus testimoni.

### 3. Frontend (Next.js)
*   **Halaman Baru**: `/dashboard/testimoni/page.jsx`
    *   Form input: Bintang (Rating), Textarea (Komentar), Input (Pekerjaan).
    *   Toggle Switch: "Tampilkan di Landing Page".
*   **Update Landing Page**: `src/app/page.jsx`
    *   Mengganti array `testimonials` statis dengan data dari API.
    *   Menampilkan foto dari `avatar_url` user dan nama dari `name` user secara otomatis.

---

## ❓ Pertanyaan Klarifikasi (Mohon Dijawab)

Sebelum saya mulai menulis kode, ada beberapa hal yang perlu saya pastikan:

1.  **Satu User Satu Testimoni?**: Apakah satu user hanya boleh punya **satu** testimoni global untuk platform, atau user bisa memberikan testimoni **per kursus** yang mereka beli? (Saran saya: Satu testimoni global agar landing page tidak penuh oleh orang yang sama).
2.  **Edit Pekerjaan**: Apakah "Pekerjaan" (Job Title) ingin diambil dari profil user (berarti kita perlu tambah kolom di tabel `users`) atau cukup diisi saat menulis testimoni saja?
3.  **Moderasi Admin**: Apakah user bebas menentukan `is_public` sendiri, atau perlu **Persetujuan Admin** terlebih dahulu sebelum muncul di landing page? (Untuk menghindari spam/kata-kata kasar).
4.  **Urutan Tampil**: Testimoni di landing page mau diurutkan berdasarkan apa? (Terbaru, Rating Tertinggi, atau Random?)
5.  **Default Foto**: Jika user belum menyambungkan Discord (tidak ada foto), apakah kita gunakan inisial nama seperti sekarang (misal: "SD") atau gambar placeholder?

---

**Silakan jawab pertanyaan di atas, setelah itu saya akan langsung eksekusi pembuatannya!**
jawaban : 
1. satu testimoni per user
2. tidak perlu admin tidak akan ikut campur dalam urusan testimoni (cukup diisi saat menulis testimoni saja)
3. ya saya sebagai admin nanti bisa mengatur untuk menampilkan atau tidak nya (nanti buatkan juga panel untuk admin bisa mengatur ini) saya mau hanya bisa ditampilkan 6-10 testimoni saja (bisa disetting admin di dashboard nya)
4. jika user belum menyambungkan discord maka user tidak bisa menulis testimoni, dan juga foto nya ngikut foto discord aja 