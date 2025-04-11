const { Pool } = require('pg');

const pool = new Pool({
    user: 'sujitrajthirumurthy',
    host: 'localhost',
    database: 'userdb',
    password: 'postgres',
    port: 5432,
});

module.exports = pool