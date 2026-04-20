const { pool } = require('./config/database');

async function updateExistingUsers() {
  try {
    console.log('Connecting to database...');
    // Update existing users to be verified
    const result = await pool.query(`
      UPDATE users 
      SET is_verified = TRUE 
      WHERE is_verified = FALSE OR is_verified IS NULL
    `);
    console.log(`Successfully verified ${result.rowCount} existing users.`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    pool.end();
  }
}

updateExistingUsers();
