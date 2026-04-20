const midtransClient = require('midtrans-client');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// POST /api/transactions/create
const createTransaction = async (req, res) => {
  const { course_id } = req.body;
  const userId = req.user.id;

  try {
    // Check if already active in this course
    const { rows: userCourses } = await pool.query('SELECT * FROM user_courses WHERE user_id = $1 AND course_id = $2', [userId, course_id || 1]);
    if (userCourses.length) {
      return res.status(400).json({ success: false, message: 'Anda sudah memiliki akses penuh ke kursus ini.' });
    }

    // Get course
    const { rows: courses } = await pool.query('SELECT * FROM courses WHERE id = $1 AND is_active = TRUE', [course_id || 1]);
    if (!courses.length) return res.status(404).json({ success: false, message: 'Kursus tidak ditemukan.' });
    const course = courses[0];

    // Check existing pending transaction
    const { rows: existing } = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND course_id = $2 AND status = $3',
      [userId, course.id, 'pending']
    );
    if (existing.length && existing[0].snap_token) {
      return res.json({ success: true, data: { snap_token: existing[0].snap_token, order_id: existing[0].id } });
    }

    const orderId = `ORDER-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

    // Save transaction to DB first
    await pool.query(
      'INSERT INTO transactions (id, user_id, course_id, amount, status) VALUES ($1, $2, $3, $4, $5)',
      [orderId, userId, course.id, course.price, 'pending']
    );

    // Create Midtrans Snap Token
    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: course.price },
      customer_details: { first_name: req.user.name, email: req.user.email },
      item_details: [{ id: String(course.id), price: course.price, quantity: 1, name: course.title.substring(0, 50) }],
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/finish`,
        error: `${process.env.FRONTEND_URL}/payment/error`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
    };

    const snapResponse = await snap.createTransaction(parameter);

    // Save snap token
    await pool.query('UPDATE transactions SET snap_token = $1 WHERE id = $2', [snapResponse.token, orderId]);

    res.json({ success: true, data: { snap_token: snapResponse.token, order_id: orderId } });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi: ' + error.message });
  }
};

// POST /api/transactions/webhook (Midtrans notification)
const handleWebhook = async (req, res) => {
  try {
    console.log('Incoming Webhook Body:', req.body);

    if (!req.body || !req.body.order_id) {
      console.log('Skipping webhook: No order_id found in body (perhaps a Test Ping).');
      return res.status(200).json({ success: true, message: 'Test ping received' });
    }

    const notification = await snap.transaction.notification(req.body);
    const { order_id, transaction_status, fraud_status, payment_type } = notification;

    console.log(`Webhook processed: ${order_id} - ${transaction_status}`);

    let newStatus = 'pending';
    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'success' : 'failed';
    } else if (transaction_status === 'settlement') {
      newStatus = 'success';
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = 'failed';
    } else if (transaction_status === 'refund') {
      newStatus = 'refund';
    }

    await pool.query(
      'UPDATE transactions SET status = $1, payment_type = $2, midtrans_transaction_id = $3 WHERE id = $4',
      [newStatus, payment_type, notification.transaction_id, order_id]
    );

    // If payment success, activate user and insert into user_courses
    if (newStatus === 'success') {
      const { rows: trx } = await pool.query('SELECT user_id, course_id FROM transactions WHERE id = $1', [order_id]);
      if (trx.length) {
        const userId = trx[0].user_id;
        const courseId = trx[0].course_id;
        
        await pool.query('UPDATE users SET is_active = TRUE WHERE id = $1', [userId]);
        if (courseId) {
          await pool.query('INSERT INTO user_courses (user_id, course_id, status) VALUES ($1, $2, $3) ON CONFLICT (user_id, course_id) DO UPDATE SET status = $3', [userId, courseId, 'active']);
        }
        console.log(`✅ User ${userId} activated and assigned course ${courseId} after successful payment`);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

// GET /api/transactions/my - user's transaction history
const getMyTransactions = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, c.title as course_title FROM transactions t 
       LEFT JOIN courses c ON t.course_id = c.id 
       WHERE t.user_id = $1 ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi.' });
  }
};

// GET /api/admin/transactions - all transactions (admin)
const adminGetTransactions = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.*, u.name as user_name, u.email as user_email, c.title as course_title 
     FROM transactions t 
     LEFT JOIN users u ON t.user_id = u.id 
     LEFT JOIN courses c ON t.course_id = c.id 
     ORDER BY t.created_at DESC`
  );
  res.json({ success: true, data: rows });
};

module.exports = { createTransaction, handleWebhook, getMyTransactions, adminGetTransactions };
