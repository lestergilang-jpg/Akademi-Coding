const { pool } = require('../config/database');

// GET /api/courses - list all courses
const getCourses = async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT id, title, description, thumbnail, price, original_price FROM courses WHERE is_active = TRUE'
    );
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kursus.' });
  }
};

// GET /api/courses/:id - single course with lessons
const getCourse = async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ? AND is_active = TRUE', [req.params.id]);
    if (!courses.length) return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });

    const isActive = req.user?.is_active;

    const [lessons] = await pool.query(
      'SELECT id, title, description, duration, order_index, is_locked, is_preview, ' +
      (isActive ? 'video_url' : 'CASE WHEN is_preview = TRUE OR is_locked = FALSE THEN video_url ELSE NULL END AS video_url') +
      ' FROM lessons WHERE course_id = ? ORDER BY order_index',
      [req.params.id]
    );

    res.json({ success: true, data: { ...courses[0], lessons } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kursus.' });
  }
};

// GET /api/lessons/:id - single lesson (protected + active)
const getLesson = async (req, res) => {
  try {
    const [lessons] = await pool.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (!lessons.length) return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });

    const lesson = lessons[0];
    if (lesson.is_locked && !lesson.is_preview && !req.user.is_active) {
      return res.status(403).json({ success: false, message: 'Materi terkunci. Selesaikan pembayaran untuk akses penuh.' });
    }

    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil materi.' });
  }
};

// =============== ADMIN CRUD ===============

const adminGetAllCourses = async (req, res) => {
  const [courses] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
  res.json({ success: true, data: courses });
};

const adminCreateCourse = async (req, res) => {
  const { title, description, thumbnail, price, original_price } = req.body;
  if (!title || !price) return res.status(400).json({ success: false, message: 'Judul dan harga wajib diisi.' });
  const [result] = await pool.query(
    'INSERT INTO courses (title, description, thumbnail, price, original_price) VALUES (?, ?, ?, ?, ?)',
    [title, description, thumbnail, price, original_price]
  );
  const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: course[0] });
};

const adminUpdateCourse = async (req, res) => {
  const { title, description, thumbnail, price, original_price, is_active } = req.body;
  await pool.query(
    'UPDATE courses SET title=?, description=?, thumbnail=?, price=?, original_price=?, is_active=? WHERE id=?',
    [title, description, thumbnail, price, original_price, is_active, req.params.id]
  );
  const [course] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: course[0] });
};

const adminDeleteCourse = async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Kursus berhasil dihapus.' });
};

const adminCreateLesson = async (req, res) => {
  const { course_id, title, description, video_url, duration, order_index, is_locked, is_preview } = req.body;
  const [result] = await pool.query(
    'INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [course_id, title, description, video_url, duration || 0, order_index || 0, is_locked ?? true, is_preview ?? false]
  );
  const [lesson] = await pool.query('SELECT * FROM lessons WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: lesson[0] });
};

const adminUpdateLesson = async (req, res) => {
  const { title, description, video_url, duration, order_index, is_locked, is_preview } = req.body;
  await pool.query(
    'UPDATE lessons SET title=?, description=?, video_url=?, duration=?, order_index=?, is_locked=?, is_preview=? WHERE id=?',
    [title, description, video_url, duration, order_index, is_locked, is_preview, req.params.id]
  );
  const [lesson] = await pool.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
  res.json({ success: true, data: lesson[0] });
};

const adminDeleteLesson = async (req, res) => {
  await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Materi berhasil dihapus.' });
};

module.exports = {
  getCourses, getCourse, getLesson,
  adminGetAllCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
};
