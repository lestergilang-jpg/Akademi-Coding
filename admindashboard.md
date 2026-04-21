ini admin dashboard nya masih kurang mobile friendly nih tolong di perbaiki ya, buat file implementasi baru di fix-admindashboard.md

## 2. Arsitektur Routing & Layout Dashboard admin
Untuk mengatasi masalah sidebar yang hilang di mobile dan sesi yang bertumpuk, saya mau menggunakan pendekatan **Dashboard Layouting** dengan _Nested Routing_.

**Struktur Routing (Contoh):**
- `/admin/dashboard` -> Halaman utama/Overview
- `admin/users` -> Halaman khusus users
- `admin/kursus` -> Halaman khusus pengaturan katalog kursus
- `admin/transaksi` -> Halaman khusus transaksi

**UI/UX Layout & Responsivitas:**
- **State Sidebar:** Menggunakan sistem *state* (misalnya disisipkan menggunakan context atau state manager) yang mengatur apakah sidebar sedang terbuka (expanded) atau tertutup (collapsed).
- **Desktop:** Sidebar berada di sebelah kiri dan bersifat statis/tetap (*fixed*).
- **Mobile/Tablet:** Sidebar tersembunyi (*hidden* secara default) menggunakan *off-canvas menu*. Akan muncul tombol **Hamburger Menu (☰)** di bagian _Navbar_ atas. Jika tombol ini diklik, sidebar akan muncul dari samping (memakai animasi _slide-in_). Terdapat peneduh (_overlay_ / _backdrop_) di belakangnya agar user fokus ke sidebar.

di dashboard admin saya juga pengen bisa mengcustomize landing page, jadi saya bisa upload gambar/embed vidio dari youtube untuk hero section, terus bisa edit judul dan deskripsi hero section, terus bisa edit bagian section yang lain juga, tolong buatkan arsitektur nya ya gimana bagus nya