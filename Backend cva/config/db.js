const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sql3.freesqldatabase.com',
  user: 'sql3773680',
  password: '6Q5RCgsIsA',
  database: 'sql3773680',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

// Validar conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1'); // Consulta de prueba
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1); // Sale del proceso si falla la conexión
  }
}

testConnection();

module.exports = pool;
