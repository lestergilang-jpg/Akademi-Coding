-- ============================================
-- AkademiCoding Database Schema (PostgreSQL)
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  discord_id VARCHAR(255),
  discord_username VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url VARCHAR(500),
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  whatsapp_number VARCHAR(50),
  promo_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_email ON users (email);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  original_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration INT DEFAULT 0, -- Duration in minutes
  order_index INT DEFAULT 0,
  is_locked BOOLEAN DEFAULT TRUE,
  is_preview BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_course_id ON lessons (course_id);

-- User Courses (Akses Course per User) table
CREATE TABLE IF NOT EXISTS user_courses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(255) PRIMARY KEY, -- Midtrans order_id
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INT REFERENCES courses(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_type VARCHAR(100),
  snap_token VARCHAR(500),
  midtrans_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_id ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_status ON transactions (status);

-- Function for updated_at tracking
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE OR REPLACE TRIGGER update_courses_modtime BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE OR REPLACE TRIGGER update_lessons_modtime BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE OR REPLACE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- Seed Data
-- ============================================

-- Insert Admin if not exists
INSERT INTO users (name, email, password, role, is_active) 
VALUES ('Admin', 'admin@akademicoding.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Insert Course if not exists
INSERT INTO courses (id, title, description, price, original_price) 
VALUES (1, 'JavaScript Full-Stack Bootcamp', 
'Kuasai JavaScript dari nol sampai expert. Belajar HTML, CSS, JavaScript, React, Node.js, dan buat project nyata yang bisa masuk portfolio kamu. Cocok untuk pemula total, tidak perlu background IT.',
299000, 999000)
ON CONFLICT (id) DO NOTHING;

-- Ensure sequences are updated if id 1 was inserted explicitly
SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));

-- Sample Lessons (Insert only if course 1 has no lessons)
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'Intro: Apa itu Web Developer?', 'Kenalan dengan dunia web development dan roadmap belajar kamu', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 15, 1, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 1);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'Setup Tools: VS Code & Browser', 'Install semua tools yang diperlukan untuk belajar coding', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 20, 2, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 2);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'HTML Dasar: Struktur Website', 'Belajar tag-tag HTML fundamental untuk membangun struktur halaman web', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 45, 3, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 3);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'HTML Lanjutan: Form & Table', 'Membuat form interaktif dan tabel data dengan HTML', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 40, 4, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 4);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'CSS Dasar: Styling Website', 'Membuat tampilan website jadi cantik dengan CSS', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 50, 5, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 5);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'CSS Flexbox & Grid', 'Layout modern dengan Flexbox dan CSS Grid', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 60, 6, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 6);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'CSS Responsive Design', 'Website yang tampil sempurna di HP dan Desktop', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 45, 7, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 7);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'JavaScript Dasar: Variable & Data Types', 'Mulai belajar bahasa pemrograman JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 55, 8, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 8);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'JavaScript: Function & Logic', 'Function, kondisi, dan perulangan di JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 65, 9, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 9);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'DOM Manipulation', 'Buat website interaktif dengan JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 70, 10, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 10);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'React.js Dasar', 'Framework JavaScript paling populer di dunia kerja', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 80, 11, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 11);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'React: Component & Props', 'Buat komponen yang bisa dipakai ulang', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 75, 12, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 12);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'React: State & Hooks', 'Kelola data dinamis di React', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 85, 13, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 13);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'Node.js & Express Dasar', 'Buat backend server sendiri dengan JavaScript', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 90, 14, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 14);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'REST API & Database', 'Hubungkan frontend dengan backend dan database', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 100, 15, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 15);
INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview)
SELECT 1, 'Project Final: Build Full-Stack App', 'Buat aplikasi full-stack lengkap untuk portfolio kamu', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 120, 16, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = 1 AND order_index = 16);
