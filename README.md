# AkademiCoding - Platform Kursus JavaScript

Platform kursus coding full-stack dengan fitur lengkap dari landing page hingga dashboard member.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT
- **Payment**: Midtrans Sandbox

## Struktur Folder

```
akademi-coding/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── database/
│   ├── .env
│   └── package.json
├── frontend/         # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── .env.local
│   └── package.json
└── README.md
```

## Cara Install & Run

### 1. Setup Database MySQL

Jalankan script SQL di `backend/src/database/schema.sql`

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local sesuai konfigurasi
npm run dev
```

### 4. Akses

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

Lihat `.env.example` di folder backend dan `.env.local.example` di folder frontend.

## Midtrans Sandbox

1. Daftar di https://sandbox.midtrans.com
2. Dapatkan Server Key & Client Key
3. Set di environment variables
4. Gunakan kartu test: 4811 1111 1111 1114
