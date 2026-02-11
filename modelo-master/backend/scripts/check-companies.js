const pool = require("../src/config/database");

async function checkCompanies() {
    try {
        const [companies] = await pool.query("DESCRIBE companies");
        console.log("Companies Table:");
        companies.forEach(col => console.log(`${col.Field}: ${col.Type}`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkCompanies();
