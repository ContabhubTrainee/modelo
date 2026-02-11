const pool = require("../src/config/database");

async function checkUsers() {
    try {
        const [users] = await pool.query("DESCRIBE users");
        console.log("Users Table:");
        users.forEach(col => console.log(`${col.Field}: ${col.Type}`));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUsers();
