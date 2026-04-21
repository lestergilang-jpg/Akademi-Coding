require('dotenv').config();
const { pool } = require('./config/database');

async function migrateVouchers() {
  try {
    console.log('🚀 Starting Voucher System Migration...');

    // 1. Create Vouchers Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('fixed', 'percentage')),
        value DECIMAL(12, 2) NOT NULL,
        usage_limit INTEGER DEFAULT NULL,
        user_limit INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        expiry_date TIMESTAMP NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Vouchers table created.');

    // 2. Create Voucher Courses Table (Junction)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS voucher_courses (
        voucher_id INT REFERENCES vouchers(id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(id) ON DELETE CASCADE,
        PRIMARY KEY (voucher_id, course_id)
      )
    `);
    console.log('✅ Voucher Courses junction table created.');

    // 3. Create Voucher Usage Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS voucher_usage (
        id SERIAL PRIMARY KEY,
        voucher_id INT REFERENCES vouchers(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        order_id VARCHAR(255),
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Voucher Usage table created.');

    console.log('🎉 Migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrateVouchers();
