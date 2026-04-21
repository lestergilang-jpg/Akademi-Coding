# Rencana Implementasi: Refactoring Admin Dashboard & Custom Landing Page

## 1. Arsitektur Dashboard Admin (Nested Routing & Responsive)
Masalah utama dashboard admin saat ini adalah tumpukan kode yang menjadi satu file besar, sehingga sulit dikelola dan tidak responsif.

**Perubahan Struktur Folder:**
Kami akan mengubah `app/admin/page.jsx` menjadi layout dan beberapa halaman terpisah:
- `app/admin/layout.jsx`: Berisi Logic Sidebar (Hamburger Menu), Auth Guard Admin, dan Frame Dashboard.
- `app/admin/dashboard/page.jsx`: Konten statistik ringkas.
- `app/admin/users/page.jsx`: Pengelolaan user.
- `app/admin/kursus/page.jsx`: Pengelolaan katalog & materi.
- `app/admin/transaksi/page.jsx`: Riwayat transaksi.
- `app/admin/settings/page.jsx`: **(Baru)** Pengaturan Landing Page.

**UI/UX Sidebar Mobile:**
- Menggunakan `useState` (`isSidebarOpen`) untuk kontrol off-canvas.
- Tombol Hamburger muncul di Navbar mobile (`block lg:hidden`).
- Sidebar akan memiliki animasi `translate-x` dan `overlay` gelap.

---

## 2. Arsitektur Kustomisasi Landing Page
Untuk membuat landing page bisa diedit dari admin, kita butuh jembatan antara Database dan Frontend Landing Page.

**A. Database State (Backend):**
- Membuat tabel `settings` dengan struktur key-value:
  ```sql
  CREATE TABLE settings (
      key VARCHAR(255) PRIMARY KEY,
      value JSONB -- Menyimpan data seperti { title: "..", hero_video: "..", benefits: [...] }
  );
  ```

**B. API Endpoints:**
- `GET /api/settings/landing`: Publik (bisa diakses landing page tanpa login).
- `POST /api/settings/landing`: Protected Admin (untuk menyimpan perubahan dari dashboard admin).

**C. Frontend Landing Page (`app/page.jsx`):**
- Mengubah Landing Page dari statis menjadi dinamis. 
- Menggunakan `useEffect` untuk fetch data dari `/api/settings/landing`.
- Jika data belum ada, gunakan data default (fallback) agar tampilan tidak kosong.

---

## ✅ Progress: SELESAI
1. **Migrations**: Tabel `settings` sudah dibuat (Migration 5).
2. **Backend**: Controller & Route `/api/settings` sudah siap.
3. **Frontend Admin (Layout)**: Sidebar baru yang responsif & mobile-friendly (Off-canvas) sudah aktif.
4. **Frontend Admin (Pages)**: Routing pecah menjadi `/admin/dashboard`, `/admin/users`, `/admin/kursus`, dan `/admin/transaksi`.
5. **Frontend Admin (Settings)**: Menu **Landing Page** baru sudah ada untuk edit Judul, Deskripsi, dan Media (Video/Gambar) Hero.
6. **Landing Page**: Sudah dinamis mengikuti input dari Admin Dashboard.

## 🏗️ Arsitektur "Custom Section" Lanjutan
Untuk kebutuhan masa depan (misal: edit testimonial/benefit), arsitektur kita sudah sangat mendukung karena:
- **Scalable Schema**: Kita menggunakan tipe data `JSONB` di PostgreSQL. Artinya, kita bisa menambah field apapun ke dalam object `value` tanpa perlu migrasi database lagi.
- **Unified API**: Cukup satu endpoint `/api/settings/:key` untuk mengelola bagian apapun di website.

**Contoh Pengembangan:**
Jika ingin menambah fitur edit Testimonial, Anda cukup menambah form di `AdminSettingsPage` dan mengirimkan array objek testimonial ke API tersebut. Frontend Landing Page tinggal melakukan mapping terhadap data tersebut.

**Semua sudah terpasang! Anda bisa mencoba mengakses `/admin/settings` untuk merubah tampilan web depannya.**

