const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration 3 (whatsapp_number, promo_code)...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_code VARCHAR(100);');
    console.log('Migration 3 successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
runMigration();
