const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP;');
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
runMigration();
