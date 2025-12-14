const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '115.190.125.195',
  user: process.env.DB_USER || 'apifox',
  password: process.env.DB_PASSWORD || 'ed7ByXFKriSzpMtX',
  database: process.env.DB_NAME || 'apifox',
  waitForConnections: true,
  connectionLimit: 10,     // 最大连接数
  queueLimit: 0
});

module.exports = pool;