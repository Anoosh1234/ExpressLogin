// db.js

const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'anoosh',
  database: 'express'
});

// Export the pool for shared use in other modules
module.exports = pool.promise();
