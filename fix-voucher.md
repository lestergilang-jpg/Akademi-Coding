# Implementasi Sistem Voucher & Promo Code - Cuma Ngeprompt

Sistem ini dirancang agar Admin memiliki kendali penuh atas promosi, mulai dari tipe diskon hingga pembatasan kuota dan pemilihan kursus tertentu.

## 1. Skema Database (PostgreSQL)

### A. Tabel `vouchers`
Menyimpan data utama voucher.
| Kolom | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identifier unik. |
| `code` | VARCHAR(50) | Kode promo (Contoh: PROMOAWAL). |
| `type` | VARCHAR(20) | `percentage` atau `fixed`. |
| `value` | DECIMAL | Nilai diskon (misal: 50 untuk 50% atau 50000 untuk Rp 50rb). |
| `usage_limit` | INTEGER | Total kuota voucher secara global. |
| `user_limit` | INTEGER | Batas penggunaan per user (default 1). |
| `expiry_date` | TIMESTAMP | Batas waktu penggunaan. |
| `is_active` | BOOLEAN | Status aktif/non-aktif. |

### B. Tabel `voucher_courses` (Relasi Many-to-Many)
Menentukan voucher tersebut berlaku untuk kursus apa saja.
*   `voucher_id` (FK to vouchers)
*   `course_id` (FK to courses)

### C. Tabel `voucher_usage`
Melacak siapa saja yang sudah menggunakan voucher tertentu untuk validasi `user_limit`.
*   `voucher_id` (FK)
*   `user_id` (FK)
*   `used_at` (TIMESTAMP)

---

## 2. Fitur Backend (API)

### Admin API (`/api/admin/vouchers`)
1.  **POST Create**: Membuat voucher baru, termasuk memilih `course_ids` yang berlaku.
2.  **GET List**: Melihat daftar voucher, jumlah pemakaian (`used_count`), dan statusnya.
3.  **PUT Update**: Mengubah kuota, tanggal expired, atau menonaktifkan voucher.
4.  **DELETE**: Menghapus voucher (hanya jika belum pernah digunakan).

### Public API (`/api/vouchers/validate`)
*   **POST Validate**: Menerima `code` dan `course_id`.
*   **Validasi Logic**:
    1.  Cek apakah kode ada dan aktif (`is_active`).
    2.  Cek apakah tanggal sekarang belum melewati `expiry_date`.
    3.  Cek apakah total penggunaan masih di bawah `usage_limit`.
    4.  Cek apakah user ini sudah mencapai `user_limit` untuk kode ini.
    5.  Cek apakah `course_id` transaksi ada dalam daftar kursus yang diizinkan untuk voucher ini.
*   **Response**: Nominal potongan harga yang akan diterapkan.

---

## 3. Fitur Frontend

### A. Admin Panel (Manajemen Voucher)
*   Dashboard untuk menambah voucher.
*   Dropdown **Multi-Select** untuk memilih kursus mana saja yang bisa menggunakan kode tersebut.
*   Input untuk mengatur tipe diskon (Persen vs Nominal).

### B. Halaman Checkout (Integrasi Pembayaran)
*   Field input **"Kode Promo"**.
*   Tombol **"Terapkan"**.
*   Rincian Harga Otomatis:
    *   Harga Kursus: Rp XXX
    *   Potongan Promo: -Rp YYY (Merah)
    *   **Total Bayar: Rp ZZZ** (Bold)

---

## 4. Alur Integrasi Payment (Midtrans)
Sistem akan menghitung ulang total harga di backend tepat sebelum membuat link pembayaran Midtrans untuk memastikan harga yang dibayar adalah harga yang sudah dipotong promo secara sah.

---

**Apakah Anda setuju dengan struktur ini? Jika ya, saya akan langsung mulai membuat migrasi database dan API backend-nya.**
