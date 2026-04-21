const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration 5 (settings table for landing page)...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Optional: Seed default landing page data
      INSERT INTO settings (key, value) 
      VALUES ('landing_page', '{
        "hero": {
          "title": "Dari Nol Jadi Web Developer Dalam 4 Bulan",
          "subtitle": "Kuasai JavaScript Full-Stack dan dapatkan skill yang dicari perusahaan tech.",
          "video_url": "",
          "image_url": ""
        },
        "registration_status": "Batch 7 — Slot terbatas 50 orang!"
      }')
      ON CONFLICT (key) DO NOTHING;
    `);
    console.log('Migration 5 successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}
runMigration();
