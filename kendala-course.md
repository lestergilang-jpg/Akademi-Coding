# Hasil Analisa Kendala: Beli Satu Course Tapi Semua Terbuka

## 🔍 Penyebab Masalah
Penyebab utamanya adalah sisa kode *legacy* (kode lama) dari versi sebelumnya di mana platform hanya memiliki 1 course. Saat itu, mekanisme untuk menandai seseorang sudah bayar adalah dengan mengubah status `is_active` pada spesifik pengguna tersebut (`users.is_active`) menjadi `TRUE`. 

Masalah terjadi di dua tempat:
1. **`transactionController.js`**: Ketika transaksi sukses, sistem mengupdate tabel `users` dan membuat `is_active = TRUE`, setelah itu sistem juga memasukkan akses course baru ke tabel `user_courses`.
2. **`courseController.js` (Bagian penentu akses)**: Di fungsi pengecekan akses (seperti `getCourse` dan `getLesson`), jika sistem melihat bahwa `req.user.is_active` adalah `TRUE`, maka sistem dengan **otomatis** membuka gembok akses (`isActive = true`) untuk **semua** course tanpa mempedulikan apakah course tersebut ada di tabel `user_courses` atau tidak. 

Karena pengguna baru saja membayar 1 course, status akunnya menjadi `is_active = TRUE`, dan ini secara otomatis menjadi "kunci master" pembuka semua course.

---

## 💡 Solusi
Kita perlu sedikit mengubah logika di `courseController.js`. Syarat untuk memberikan akses (`isActive = true`) **TIDAK BOLEH** secara pukul rata melihat `is_active` user lagi. Namun, kita tetap harus memastikan member lama yang dulunya beli Course pertama (ID 1) tidak kehilangan aksesnya, jadi fallback pengecekan `req.user.is_active` hanya dibatasi secara spesifik untuk `course_id = 1` saja.

### Langkah Perbaikan:

Ubah fungsi-fungsi di dalam `backend/src/controllers/courseController.js`

**1. Pada fungsi `getCourse`:**
Cari baris ini:
```javascript
      if (req.user.is_active) isActive = true;
```
ganti menjadi:
```javascript
      // Backward compatibility: is_active user flag hanya berlaku untuk course ID 1
      if (req.user.is_active && req.params.id == 1) isActive = true;
```

**2. Pada fungsi `getLesson`:**
Cari baris ini:
```javascript
    if (req.user.is_active) isActive = true;
```
ganti menjadi:
```javascript
    // Backward compatibility: is_active user flag hanya berlaku untuk course ID 1
    if (req.user.is_active && lesson.course_id == 1) isActive = true;
```

Dengan perubahan ini, user hanya akan difilter berdasarkan hak aksesnya secara akurat sesuai data pembelian di `user_courses`. Jika Anda setuju, respon saya dan ini akan langsung saya terapkan ke dalam sintaks kodenya.

