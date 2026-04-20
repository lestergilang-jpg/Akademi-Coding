const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration 2 (avatar_url)...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);');
    console.log('Migration 2 successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
runMigration();
