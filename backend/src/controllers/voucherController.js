const { pool } = require('../config/database');

/**
 * PUBLIC: Validate a voucher code
 * POST /api/vouchers/validate
 */
const validateVoucher = async (req, res) => {
  const { code, course_id } = req.body;
  const user_id = req.user.id;

  try {
    // 1. Get voucher details
    const { rows: vouchers } = await pool.query(
      'SELECT * FROM vouchers WHERE code = $1 AND is_active = TRUE',
      [code.toUpperCase()]
    );

    if (vouchers.length === 0) {
      return res.status(404).json({ success: false, message: 'Kode promo tidak valid atau tidak aktif.' });
    }

    const voucher = vouchers[0];

    // 2. Check expiry
    if (new Date(voucher.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: 'Kode promo sudah kadaluarsa.' });
    }

    // 3. Check overall usage limit
    if (voucher.usage_limit !== null && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ success: false, message: 'Kuota kode promo sudah habis.' });
    }

    // 4. Check per-user limit
    const { rows: usage } = await pool.query(
      'SELECT COUNT(*) FROM voucher_usage WHERE voucher_id = $1 AND user_id = $2',
      [voucher.id, user_id]
    );

    if (parseInt(usage[0].count, 10) >= voucher.user_limit) {
      return res.status(400).json({ success: false, message: 'Anda sudah mencapai batas penggunaan untuk kode promo ini.' });
    }

    // 5. Check course eligibility
    const { rows: eligibleCourses } = await pool.query(
      'SELECT * FROM voucher_courses WHERE voucher_id = $1 AND course_id = $2',
      [voucher.id, course_id]
    );

    if (eligibleCourses.length === 0) {
      return res.status(400).json({ success: false, message: 'Kode promo tidak berlaku untuk kursus ini.' });
    }

    // 6. Calculate discount
    let discount_amount = 0;
    const { rows: courses } = await pool.query('SELECT price FROM courses WHERE id = $1', [course_id]);
    const price = parseFloat(courses[0].price);

    if (voucher.type === 'percentage') {
      discount_amount = price * (parseFloat(voucher.value) / 100);
    } else {
      discount_amount = parseFloat(voucher.value);
    }

    // Ensure discount doesn't exceed price
    if (discount_amount > price) discount_amount = price;

    res.json({
      success: true,
      message: 'Kode promo berhasil diterapkan.',
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discount_amount: discount_amount,
        final_price: price - discount_amount
      }
    });

  } catch (err) {
    console.error('Error validating voucher:', err);
    res.status(500).json({ success: false, message: 'Gagal memvalidasi kode promo.' });
  }
};

/**
 * ADMIN: Get all vouchers
 * GET /api/admin/vouchers
 */
const adminGetVouchers = async (req, res) => {
  try {
    const { rows: vouchers } = await pool.query(`
      SELECT v.*, 
        (SELECT json_agg(course_id) FROM voucher_courses WHERE voucher_id = v.id) as course_ids
      FROM vouchers v 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data voucher.' });
  }
};

/**
 * ADMIN: Create a voucher
 * POST /api/admin/vouchers
 */
const adminCreateVoucher = async (req, res) => {
  const { code, type, value, usage_limit, user_limit, expiry_date, course_ids } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO vouchers (code, type, value, usage_limit, user_limit, expiry_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [code.toUpperCase(), type, value, usage_limit, user_limit, expiry_date]
    );

    const voucherId = rows[0].id;

    if (course_ids && course_ids.length > 0) {
      for (const courseId of course_ids) {
        await client.query(
          'INSERT INTO voucher_courses (voucher_id, course_id) VALUES ($1, $2)',
          [voucherId, courseId]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Voucher berhasil dibuat.', data: { id: voucherId } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating voucher:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat voucher (mungkin kode sudah ada).' });
  } finally {
    client.release();
  }
};

/**
 * ADMIN: Toggle voucher status
 * PUT /api/admin/vouchers/:id/toggle
 */
const adminToggleVoucher = async (req, res) => {
  try {
    const { rows: vouchers } = await pool.query('SELECT is_active FROM vouchers WHERE id = $1', [req.params.id]);
    if (vouchers.length === 0) return res.status(404).json({ success: false, message: 'Voucher tidak ditemukan.' });

    const newStatus = !vouchers[0].is_active;
    await pool.query('UPDATE vouchers SET is_active = $1 WHERE id = $2', [newStatus, req.params.id]);

    res.json({ success: true, message: `Voucher ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status voucher.' });
  }
};

/**
 * ADMIN: Delete voucher
 * DELETE /api/admin/vouchers/:id
 */
const adminDeleteVoucher = async (req, res) => {
  try {
    await pool.query('DELETE FROM vouchers WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Voucher berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus voucher.' });
  }
};

module.exports = {
  validateVoucher,
  adminGetVouchers,
  adminCreateVoucher,
  adminToggleVoucher,
  adminDeleteVoucher
};
