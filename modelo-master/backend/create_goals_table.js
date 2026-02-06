const pool = require('./src/config/database');

async function createTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS goals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_id BIGINT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                target_value DECIMAL(10, 2) NOT NULL,
                current_value DECIMAL(10, 2) DEFAULT 0.00,
                deadline DATE,
                status ENUM('active', 'completed', 'expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
            )
        `;

        await pool.query(query);
        console.log("Tabela 'goals' criada (ou já existia) com sucesso!");
    } catch (error) {
        console.error("Erro ao criar tabela:", error);
    } finally {
        process.exit();
    }
}

createTable();
