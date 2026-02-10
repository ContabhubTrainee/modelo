const pool = require('./src/config/database');

async function updateGoalsTable() {
    try {
        // First check if column exists to avoid errors
        const [columns] = await pool.query("SHOW COLUMNS FROM goals LIKE 'project_id'");

        if (columns.length === 0) {
            console.log("Adicionando coluna 'project_id' à tabela 'goals'...");
            const query = `
                ALTER TABLE goals
                ADD COLUMN project_id INT DEFAULT NULL,
                ADD CONSTRAINT fk_goals_project
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
            `;
            await pool.query(query);
            console.log("Coluna 'project_id' adicionada com sucesso!");
        } else {
            console.log("Coluna 'project_id' já existe na tabela 'goals'.");
        }
    } catch (error) {
        console.error("Erro ao atualizar tabela 'goals':", error);
    } finally {
        process.exit();
    }
}

updateGoalsTable();
