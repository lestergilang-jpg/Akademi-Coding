const { pool } = require('./config/database');

async function updateToPremium() {
  const email = 'acelagulina@gmail.com'; // Email dari log Midtrans tadi
  try {
    const res = await pool.query(
      'UPDATE users SET is_active = TRUE WHERE email = $1 RETURNING id, name, email, is_active',
      [email]
    );

    if (res.rowCount > 0) {
      console.log('✅ BERHASIL!');
      console.log('User Updated:', res.rows[0]);
      console.log('\nSekarang akun Anda sudah Premium. Silakan refresh website atau Login ulang.');
    } else {
      console.log('❌ Gagal: User dengan email tersebut tidak ditemukan.');
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err.message);
  } finally {
    await pool.end();
  }
}

updateToPremium();
