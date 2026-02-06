const pool = require('./src/config/database');

async function updateTable() {
    try {
        const query = `
            ALTER TABLE goals
            ADD COLUMN responsible_id INT DEFAULT NULL,
            ADD CONSTRAINT fk_goals_responsible
            FOREIGN KEY (responsible_id) REFERENCES users(id) ON DELETE SET NULL;
        `;

        await pool.query(query);
        console.log("Coluna 'responsible_id' adicionada com sucesso!");
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log("Coluna 'responsible_id' já existe.");
        } else {
            console.error("Erro ao alterar tabela:", error);
        }
    } finally {
        process.exit();
    }
}

updateTable();
