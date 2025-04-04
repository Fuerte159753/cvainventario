const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sql311.byethost32.com',
  user: 'b32_38669081',
  password: '12345678',
  database: 'b32_38669081_cva',
  port: 3306, // Añade esto explícitamente
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // Aumenta timeout a 10 segundos
});
console.log('se conecto a la base de datos');
module.exports = pool;