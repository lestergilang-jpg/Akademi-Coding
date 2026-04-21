# Analisa Kendala: Thumbnail Katalog Kursus Tidak Muncul

## 🔍 Masalah Utama
Setelah saya melakukan penelusuran kode, saya menemukan bahwa thumbnail yang di-input melalui dashboard admin **memang belum dikonfigurasi untuk tampil** di tampilan frontend. 

Penyebab spesifiknya:
1. **Frontend Dashboard (Katalog):** Di file `frontend/src/app/dashboard/katalog-kursus/page.jsx`, bagian thumbnail masih menggunakan **placeholder kartu** yang berisi gradient dan icon buku (`FiBook`), bukan tag `<img>` yang mengambil data `thumbnail` dari database.
2. **Halaman Depan (Landing Page):** File `frontend/src/app/page.jsx` saat ini bersifat **statis**. Data kursus (termasuk thumbnailnya) yang ada di database belum dipanggil ke halaman ini, sehingga tampilan "Kurikulum" atau "Katalog" di depan masih berupa teks atau data hardcoded.

## 💡 Solusi & Rencana Perbaikan

1. **Perbaikan di Katalog (Dashboard):** 
   Update file `KatalogKursusPage` agar mengecek apakah ada field `thumbnail`. Jika ada, tampilkan gambar; jika tidak, baru tampilkan icon placeholder.
   
2. **Klarifikasi Halaman Depan:** 
   Saya perlu bertanya kepada Anda: Apakah Anda ingin halaman landing (`/`) juga secara otomatis mengambil daftar kursus dari database agar thumbnailnya ikut muncul di sana? Saat ini halaman depan masih statis.

---

## 🛠️ Langkah Implementasi (Fix Thumbnail Dashboard)

Saya akan mengubah bagian tampilan kartu di `frontend/src/app/dashboard/katalog-kursus/page.jsx` dari:
```jsx
<div className="h-44 bg-gradient-to-br from-brand-600/30 to-accent-600/30 flex items-center justify-center relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-accent-900/40" />
  <FiBook size={52} className="text-white/30 relative z-10 group-hover:scale-110 transition-transform duration-300" />
```

Menjadi lebih fleksibel (jika ada thumbnail, pakai `img`):
```jsx
<div className="h-44 bg-slate-800 flex items-center justify-center relative overflow-hidden">
  {c.thumbnail ? (
    <img 
      src={c.thumbnail} 
      alt={c.title} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
    />
  ) : (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 to-accent-900/40" />
      <FiBook size={52} className="text-white/30 relative z-10 group-hover:scale-110 transition-transform duration-300" />
    </>
  )}
```

**Apakah Anda ingin saya langsung terapkan perubahan ini?** Dan mohon berikan info jika Anda ingin Landing Page (`page.jsx` utama) juga dibuat dinamis mengikuti database.
