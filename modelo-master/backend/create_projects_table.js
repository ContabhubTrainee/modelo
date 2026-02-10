const pool = require('./src/config/database');

async function createProjectsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id BIGINT UNSIGNED NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                status ENUM('active', 'completed', 'on_hold') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `;

        await pool.query(query);
        console.log("Tabela 'projects' criada ou já existente.");
    } catch (error) {
        console.error("Erro ao criar tabela 'projects':", error);
    } finally {
        process.exit();
    }
}

createProjectsTable();
