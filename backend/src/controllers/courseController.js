const { pool } = require('../config/database');

// GET /api/courses/my - user's purchased courses
const getMyCourses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.* FROM courses c 
       JOIN user_courses uc ON c.id = uc.course_id 
       WHERE uc.user_id = $1 AND uc.status = 'active'`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data my courses.' });
  }
};

// GET /api/courses - list all courses
const getCourses = async (req, res) => {
  try {
    const { rows: courses } = await pool.query(
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
    const { rows: courses } = await pool.query('SELECT * FROM courses WHERE id = $1 AND is_active = TRUE', [req.params.id]);
    if (!courses.length) return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });

    let isActive = false;
    if (req.user) {
      const { rows: uc } = await pool.query('SELECT status FROM user_courses WHERE user_id = $1 AND course_id = $2', [req.user.id, req.params.id]);
      if (uc.length && uc[0].status === 'active') isActive = true;
    }

    const { rows: lessons } = await pool.query(
      'SELECT id, title, description, duration, order_index, is_locked, is_preview, ' +
      (isActive ? 'video_url' : 'CASE WHEN is_preview = TRUE OR is_locked = FALSE THEN video_url ELSE NULL END AS video_url') +
      ' FROM lessons WHERE course_id = $1 ORDER BY order_index',
      [req.params.id]
    );

    res.json({ success: true, data: { ...courses[0], has_access: isActive, lessons } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data kursus.' });
  }
};

// GET /api/lessons/:id - single lesson (protected + active)
const getLesson = async (req, res) => {
  try {
    const { rows: lessons } = await pool.query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (!lessons.length) return res.status(404).json({ success: false, message: 'Materi tidak ditemukan.' });

    const lesson = lessons[0];
    
    let isActive = false;
    if (req.user) {
      const { rows: uc } = await pool.query('SELECT status FROM user_courses WHERE user_id = $1 AND course_id = $2', [req.user.id, lesson.course_id]);
      if (uc.length && uc[0].status === 'active') isActive = true;
    }

    if (lesson.is_locked && !lesson.is_preview && !isActive) {
      return res.status(403).json({ success: false, message: 'Materi terkunci. Selesaikan pembayaran untuk akses penuh.' });
    }

    res.json({ success: true, data: lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil materi.' });
  }
};

// =============== ADMIN CRUD ===============

const adminGetAllCourses = async (req, res) => {
  const { rows: courses } = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
  res.json({ success: true, data: courses });
};

const adminCreateCourse = async (req, res) => {
  const { title, description, thumbnail, price, original_price } = req.body;
  if (!title || !price) return res.status(400).json({ success: false, message: 'Judul dan harga wajib diisi.' });
  const { rows: result } = await pool.query(
    'INSERT INTO courses (title, description, thumbnail, price, original_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [title, description, thumbnail, price, original_price]
  );
  res.status(201).json({ success: true, data: result[0] });
};

const adminUpdateCourse = async (req, res) => {
  const { title, description, thumbnail, price, original_price, is_active } = req.body;
  const { rows: course } = await pool.query(
    'UPDATE courses SET title=$1, description=$2, thumbnail=$3, price=$4, original_price=$5, is_active=$6 WHERE id=$7 RETURNING *',
    [title, description, thumbnail, price, original_price, is_active, req.params.id]
  );
  res.json({ success: true, data: course[0] });
};

const adminDeleteCourse = async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Kursus berhasil dihapus.' });
};

const adminCreateLesson = async (req, res) => {
  const { course_id, title, description, video_url, duration, order_index, is_locked, is_preview } = req.body;
  const { rows: lesson } = await pool.query(
    'INSERT INTO lessons (course_id, title, description, video_url, duration, order_index, is_locked, is_preview) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [course_id, title, description, video_url, duration || 0, order_index || 0, is_locked ?? true, is_preview ?? false]
  );
  res.status(201).json({ success: true, data: lesson[0] });
};

const adminUpdateLesson = async (req, res) => {
  const { title, description, video_url, duration, order_index, is_locked, is_preview } = req.body;
  const { rows: lesson } = await pool.query(
    'UPDATE lessons SET title=$1, description=$2, video_url=$3, duration=$4, order_index=$5, is_locked=$6, is_preview=$7 WHERE id=$8 RETURNING *',
    [title, description, video_url, duration, order_index, is_locked, is_preview, req.params.id]
  );
  res.json({ success: true, data: lesson[0] });
};

const adminDeleteLesson = async (req, res) => {
  await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);
  res.json({ success: true, message: 'Materi berhasil dihapus.' });
};

module.exports = {
  getMyCourses, getCourses, getCourse, getLesson,
  adminGetAllCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
  adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
};
