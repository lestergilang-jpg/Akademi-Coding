const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration 4 (email_change OTP columns)...');
    await pool.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS email_change_otp VARCHAR(10),
        ADD COLUMN IF NOT EXISTS email_change_otp_expires TIMESTAMP,
        ADD COLUMN IF NOT EXISTS email_change_new_email VARCHAR(255);
    `);
    console.log('Migration 4 successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
runMigration();
