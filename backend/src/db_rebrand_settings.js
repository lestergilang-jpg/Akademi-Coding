require('dotenv').config();
const { pool } = require('./config/database');

async function rebrandSettings() {
  try {
    console.log('🔄 Rebranding database settings...');
    
    // Update Landing Page Title and Registration Status if they contain "Akademi Coding"
    await pool.query(`
      UPDATE settings 
      SET value = jsonb_set(
        jsonb_set(
          value, 
          '{hero,title}', 
          '"Dari Nol Jadi AI Prompt Engineer Dalam 4 Bulan"'
        ),
        '{registration_status}',
        '"Pendaftaran Cuma Ngeprompt Batch 1 — Akses Terbatas!"'
      )
      WHERE key = 'landing_page'
    `);
    
    console.log('✅ Database rebranding successful!');
  } catch (err) {
    console.error('❌ Database rebranding failed:', err);
  } finally {
    process.exit();
  }
}

rebrandSettings();
