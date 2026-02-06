const pool = require('./src/config/database');

async function checkSchema() {
    try {
        const [rows] = await pool.query("DESCRIBE user_companies");
        console.log("Schema user_companies:", rows);

        const [users] = await pool.query("DESCRIBE users");
        console.log("Schema users:", users);

        const [companies] = await pool.query("DESCRIBE companies");
        console.log("Schema companies:", companies);

    } catch (error) {
        console.error("Erro ao verificar schema:", error);
    } finally {
        process.exit();
    }
}

checkSchema();
