const pool = require('./src/config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE users");
        console.log("USERS TABLE SCHEMA:");
        console.table(rows);
    } catch (error) {
        console.error("Error:", error.message);
    }
    process.exit();
}

checkSchema();
