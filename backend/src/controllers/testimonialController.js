const { pool } = require('../config/database');

// ─── USER CONTROLLERS ────────────────────────────────────────

// GET /api/testimonials/me
const getMyTestimonial = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM testimonials WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    console.error('Get my testimonial error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data testimoni.' });
  }
};

// POST /api/testimonials
const upsertTestimonial = async (req, res) => {
  const { rating, content, occupation } = req.body;
  const userId = req.user.id;

  if (!rating || !content || !occupation) {
    return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
  }

  try {
    // 1. Validasi: Harus sudah konek Discord
    const { rows: userRows } = await pool.query('SELECT discord_id FROM users WHERE id = $1', [userId]);
    if (!userRows[0].discord_id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Kamu harus menyambungkan akun Discord terlebih dahulu di Pengaturan Akun untuk memberikan testimoni.' 
      });
    }

    // 2. Validasi: Harus punya minimal 1 kursus
    const { rows: courseRows } = await pool.query('SELECT id FROM user_courses WHERE user_id = $1', [userId]);
    if (courseRows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Kamu harus memiliki minimal satu kursus untuk memberikan testimoni.' 
      });
    }

    // 3. Upsert (Insert or Update)
    const { rows } = await pool.query(
      `INSERT INTO testimonials (user_id, rating, content, occupation, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) 
       DO UPDATE SET rating = EXCLUDED.rating, content = EXCLUDED.content, occupation = EXCLUDED.occupation, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, rating, content, occupation]
    );

    res.json({ success: true, message: 'Testimoni berhasil disimpan.', data: rows[0] });
  } catch (error) {
    console.error('Upsert testimonial error:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan testimoni.' });
  }
};

// ─── PUBLIC CONTROLLERS ──────────────────────────────────────

// GET /api/testimonials/public
const getPublicTestimonials = async (req, res) => {
  try {
    // Ambil limit dari settings (default 10)
    const { rows: settingsRows } = await pool.query("SELECT value FROM settings WHERE key = 'max_testimonials_landing'");
    const limit = settingsRows[0] ? parseInt(settingsRows[0].value) : 10;

    const { rows } = await pool.query(
      `SELECT t.*, u.name, u.avatar_url 
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       WHERE t.is_public = TRUE
       ORDER BY t.updated_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil testimoni.' });
  }
};

// ─── ADMIN CONTROLLERS ───────────────────────────────────────

// GET /api/admin/testimonials
const getAllTestimonials = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, u.name, u.email, u.avatar_url 
       FROM testimonials t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Admin get testimonials error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data.' });
  }
};

// PATCH /api/admin/testimonials/:id/status
const toggleTestimonialStatus = async (req, res) => {
  const { id } = req.params;
  const { is_public } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE testimonials SET is_public = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [is_public, id]
    );
    res.json({ success: true, message: 'Status testimoni diperbarui.', data: rows[0] });
  } catch (error) {
    console.error('Toggle testimonial status error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status.' });
  }
};

module.exports = {
  getMyTestimonial,
  upsertTestimonial,
  getPublicTestimonials,
  getAllTestimonials,
  toggleTestimonialStatus
};
