const pool = require("./src/config/database");

async function migrate() {
    try {
        console.log("Checking users table...");
        const [columns] = await pool.query("SHOW COLUMNS FROM users");
        const hasRole = columns.some(col => col.Field === 'role');

        if (!hasRole) {
            console.log("Adding role column to users table...");
            await pool.query("ALTER TABLE users ADD COLUMN role ENUM('admin', 'contratante', 'visitante') DEFAULT 'visitante'");
            console.log("Role column added successfully.");
        } else {
            console.log("Role column already exists. Updating existing values to match new system...");
            await pool.query("UPDATE users SET role = 'visitante' WHERE role NOT IN ('admin', 'contratante', 'visitante') OR role IS NULL");
            console.log("Modifying role column to new ENUM...");
            await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'contratante', 'visitante') DEFAULT 'visitante'");
            console.log("Role column modified successfully.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
