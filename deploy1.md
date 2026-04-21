# Panduan Deploy Production - Akademi Coding (Ubuntu 24.04)

Dokumen ini berisi langkah-langkah teknis untuk mendepoy aplikasi ke VPS IDCloudHost.

## 1. Persiapan Awal (Server Setup)
Login ke VPS via SSH, lalu update sistem:
```bash
sudo apt update && sudo apt upgrade -y
```

Install Node.js (Versi 20 LTS disarankan):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Install tool pendukung:
```bash
sudo apt install -y git nginx postgresql postgresql-contrib
```

## 2. Setup Database (PostgreSQL)
Masuk ke PostgreSQL dan buat database:
```bash
sudo -u postgres psql
```
Lalu jalankan command SQL:
```sql
CREATE DATABASE akademi_coding;
CREATE USER admin_akademi WITH PASSWORD 'Rahasia123!';
GRANT ALL PRIVILEGES ON DATABASE akademi_coding TO admin_akademi;
\q
```

## 3. Clone & Persiapan Aplikasi
Buat folder di `/var/www/` atau langsung di home:
```bash
cd ~
git clone https://github.com/lestergilang-jpg/Akademi-Coding.git
cd Akademi-Coding
```

### Setup Backend
```bash
cd backend
npm install
cp .env.example .env # Sesuaikan isi .env (DB_URL, JWT_SECRET, dll)
node src/db_migration_3.js # Jalankan migrasi
node src/voucher_migration.js # Jalankan migrasi voucher
```

### Setup Frontend
```bash
cd ../frontend
npm install
# Buat file .env.production
# Isi dengan NEXT_PUBLIC_API_URL=https://api.domainkamu.com
npm run build
```

## 4. Automation dengan PM2
Install PM2 agar aplikasi tetap jalan meskipun terminal ditutup:
```bash
sudo npm install -g pm2

# Jalankan Backend
cd ~/Akademi-Coding/backend
pm2 start src/index.js --name "akademi-backend"

# Jalankan Frontend
cd ~/Akademi-Coding/frontend
pm2 start npm --name "akademi-frontend" -- start

# Save agar auto-start saat reboot
pm2 save
pm2 startup
```

## 5. Konfigurasi Nginx (Reverse Proxy)
Buat file konfigurasi nginx:
```bash
sudo nano /etc/nginx/sites-available/akademi
```
Isi dengan:
```nginx
server {
    server_name domainkamu.com; # Ganti ke domain utama

    location / {
        proxy_pass http://localhost:3000; # NextJS
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.domainkamu.com; # Ganti ke subdomain API

    location / {
        proxy_pass http://localhost:5000; # Express Backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/akademi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 6. SSL (Let's Encrypt)
Jalankan Certbot untuk HTTPS gratis:
```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d domainkamu.com -d api.domainkamu.com
```

## 7. Hal Penting
1. **Firewall**: Pastikan port 80 dan 443 terbuka di panel IDCloudHost.
2. **Environment**: Pastikan `MIDTRANS_SERVER_KEY` di backend menggunakan kunci Production jika sudah siap jualan.
3. **CORS**: Update `FRONTEND_URL` di backend `.env` ke domain asli Anda.
