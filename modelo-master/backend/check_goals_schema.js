const pool = require('./src/config/database');

async function check() {
    try {
        console.log("--- Schema: goals ---");
        const [goalsSchema] = await pool.query("DESCRIBE goals");
        console.log(goalsSchema.map(c => `${c.Field} (${c.Type})`).join(', '));

        console.log("\n--- Testing Query ---");
        const company_id = "undefined"; // Simulate invalid input
        const query = `
            SELECT g.*, u.full_name as responsible_name, u.avatar_url as responsible_avatar
            FROM goals g
            LEFT JOIN users u ON g.responsible_id = u.id
            WHERE g.company_id = ?
            ORDER BY g.deadline ASC
        `;
        const [rows] = await pool.query(query, [company_id]);
        console.log("Query success. Rows:", rows.length);

    } catch (error) {
        console.error("ERROR:", error);
    } finally {
        process.exit();
    }
}

check();
