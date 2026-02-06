const pool = require('./src/config/database');

async function testQuery() {
    const user_id = "undefined"; // Simulate invalid input
    const company_id = 1; // Assuming company 1 exists

    let query = `
        SELECT uc.*, u.full_name as user_name, c.name as company_name 
        FROM user_companies uc
        JOIN users u ON uc.user_id = u.id
        JOIN companies c ON uc.company_id = c.id
        WHERE 1=1
    `;
    const params = [];

    // Simulate the logic
    if (user_id) {
        query += " AND uc.user_id = ?";
        params.push(user_id);
    }

    if (company_id) {
        query += " AND uc.company_id = ?";
        params.push(company_id);
    }

    console.log("Executing Query:", query);
    console.log("Params:", params);

    try {
        const [rows] = await pool.query(query, params);
        console.log("Success! Rows:", rows);
    } catch (error) {
        console.error("QUERY FAILED:", error);
    } finally {
        process.exit();
    }
}

testQuery();
