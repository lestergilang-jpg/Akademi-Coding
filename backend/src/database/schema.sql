-- ============================================
-- AkademiCoding Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS akademi_coding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE akademi_coding;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration INT DEFAULT 0 COMMENT 'Duration in minutes',
  order_index INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT TRUE,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_id (course_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY COMMENT 'Midtrans order_id',
  user_id INT NOT NULL,
  course_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'success', 'failed', 'cancelled', 'refund') DEFAULT 'pending',
  payment_type VARCHAR(100),
  snap_token VARCHAR(500),
  midtrans_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- ============================================
-- Seed Data
-- ============================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role, is_active) VALUES
('Admin', 'admin@akademicoding.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'admin', TRUE);

-- Sample Course
INSERT IGNORE INTO courses (id, title, description, price, original_price) VALUES
(1, 'JavaScript Full-Stack Bootcamp', 
'Kuasai JavaScript dari nol sampai expert. Belajar HTML, CSS, JavaScript, React, Node.js, dan buat project nyata yang bisa masuk portfolio kamu. Cocok untuk pemula total, tidak perlu background IT.',
299000, 999000);

-- Sample Lessons
INSERT IGNORE INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview) VALUES
(1, 'Intro: Apa itu Web Developer?', 'Kenalan dengan dunia web development dan roadmap belajar kamu', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 15, 1, FALSE, TRUE),
(1, 'Setup Tools: VS Code & Browser', 'Install semua tools yang diperlukan untuk belajar coding', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 20, 2, FALSE, TRUE),
(1, 'HTML Dasar: Struktur Website', 'Belajar tag-tag HTML fundamental untuk membangun struktur halaman web', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 45, 3, TRUE, FALSE),
(1, 'HTML Lanjutan: Form & Table', 'Membuat form interaktif dan tabel data dengan HTML', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 40, 4, TRUE, FALSE),
(1, 'CSS Dasar: Styling Website', 'Membuat tampilan website jadi cantik dengan CSS', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 50, 5, TRUE, FALSE),
(1, 'CSS Flexbox & Grid', 'Layout modern dengan Flexbox dan CSS Grid', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 60, 6, TRUE, FALSE),
(1, 'CSS Responsive Design', 'Website yang tampil sempurna di HP dan Desktop', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 45, 7, TRUE, FALSE),
(1, 'JavaScript Dasar: Variable & Data Types', 'Mulai belajar bahasa pemrograman JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 55, 8, TRUE, FALSE),
(1, 'JavaScript: Function & Logic', 'Function, kondisi, dan perulangan di JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 65, 9, TRUE, FALSE),
(1, 'DOM Manipulation', 'Buat website interaktif dengan JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 70, 10, TRUE, FALSE),
(1, 'React.js Dasar', 'Framework JavaScript paling populer di dunia kerja', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 80, 11, TRUE, FALSE),
(1, 'React: Component & Props', 'Buat komponen yang bisa dipakai ulang', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 75, 12, TRUE, FALSE),
(1, 'React: State & Hooks', 'Kelola data dinamis di React', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 85, 13, TRUE, FALSE),
(1, 'Node.js & Express Dasar', 'Buat backend server sendiri dengan JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 90, 14, TRUE, FALSE),
(1, 'REST API & Database', 'Hubungkan frontend dengan backend dan database', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 100, 15, TRUE, FALSE),
(1, 'Project Final: Build Full-Stack App', 'Buat aplikasi full-stack lengkap untuk portfolio kamu', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 120, 16, TRUE, FALSE);
