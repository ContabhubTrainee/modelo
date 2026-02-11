const pool = require("../src/config/database");

async function checkSchema() {
    try {
        console.log("Checking tables...");
        const [users] = await pool.query("DESCRIBE users");
        console.log("\nUsers Table:");
        console.table(users);

        const [companies] = await pool.query("DESCRIBE companies");
        console.log("\nCompanies Table:");
        console.table(companies);

        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
}

checkSchema();
