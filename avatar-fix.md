# Rencana Implementasi: Sinkronisasi Avatar Discord

Dokumen ini berisi rencana teknis untuk menggantikan sistem upload avatar lokal dengan sinkronisasi otomatis menggunakan Discord.

## 1. Analisis Masalah Saat Ini
- **Error 404:** Path upload di server production tidak ditemukan atau terhapus.
- **Maintenance:** Mengelola file fisik di VPS memerlukan konfigurasi Nginx dan permission folder yang rumit.
- **Solusi:** Menggunakan CDN Discord (`cdn.discordapp.com`) sebagai sumber foto profil tunggal.

## 2. Strategi Perubahan

### Backend (Node.js)
- **Discord Controller:** Saat proses callback login Discord, kita akan menangkap `avatar_hash` dan `user_id` Discord untuk membentuk URL foto.
- **Users Table:** Memastikan kolom `avatar_url` menyimpan URL gambar dari Discord.
- **Cleanup:** Menonaktifkan route `POST /api/users/upload-avatar` dan menghapus middleware Multer.

### Frontend (Next.js)
- **AuthContext:** Memastikan data avatar dari backend langsung ditampilkan di seluruh komponen UI.
- **Settings Page:** Menghapus UI upload file (input file & button simpan) dan menggantinya dengan informasi status sinkronisasi Discord.
- **Navigasi/Dashboard:** Mengganti logika fallback gambar jika user belum menyambungkan Discord.

## 3. Daftar Pertanyaan untuk User
1. Bagaimana penanganan user yang daftar via Email/Password (Tanpa Discord)?
2. Apakah foto diupdate otomatis setiap Login?
3. Bolehkah menghapus total fitur upload lama?
4. Bagaimana tampilan di halaman Settings yang baru?

---
**Status:** Menunggu Konfirmasi User sebelum mulai Modifikasi Kode.

jawaban :
1. untuk user yang daftar via email/password (tanpa discord) saya mau foto nya avatar default 
2. ya otomatis ya
3. boleh dihapus total fitur upload nya, kan nanti udah ada fitur buat sambungin akun discord nya
4. menu "Ganti Foto Profil" di halaman setting akan kita hapus total dan diganti dengan keterangan "Foto profil disinkronkan dengan Discord"