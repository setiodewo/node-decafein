// Author: Emanuel Setio Dewo, 04/09/2024

import mysql from 'mysql2/promise.js';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'decafein',
    password: '5w4t1z3n2024!',
    database: 'decafein'
});

console.log('DB Connected');

export default db;