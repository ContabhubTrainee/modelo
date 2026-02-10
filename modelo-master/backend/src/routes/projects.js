const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Listar projetos por empresa com seus membros
router.get("/", async (req, res) => {
    const { company_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ error: "Company ID is required" });
    }

    try {
        // Buscar projetos
        const [projects] = await pool.query(
            "SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC",
            [company_id]
        );

        // Buscar membros para cada projeto
        const projectsWithMembers = await Promise.all(projects.map(async (project) => {
            const [members] = await pool.query(
                `SELECT u.id, u.full_name, u.avatar_url 
                 FROM project_users pu 
                 JOIN users u ON pu.user_id = u.id 
                 WHERE pu.project_id = ?`,
                [project.id]
            );
            return { ...project, members };
        }));

        res.json(projectsWithMembers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar projetos." });
    }
});

// Criar projeto com membros
router.post("/", async (req, res) => {
    const { company_id, name, description, user_ids } = req.body;

    if (!company_id || !name) {
        return res.status(400).json({ error: "Nome e Empresa são obrigatórios." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Criar projeto
        const [result] = await connection.query(
            "INSERT INTO projects (company_id, name, description, status) VALUES (?, ?, ?, 'active')",
            [company_id, name, description]
        );
        const projectId = result.insertId;

        // 2. Vincular usuários se houver
        if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
            const values = user_ids.map(userId => [projectId, userId]);
            await connection.query(
                "INSERT INTO project_users (project_id, user_id) VALUES ?",
                [values]
            );
        }

        await connection.commit();

        res.status(201).json({
            message: "Projeto criado com sucesso!",
            id: projectId,
            ...req.body,
            status: 'active'
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: "Erro ao criar projeto." });
    } finally {
        connection.release();
    }
});

// Atualizar projeto e membros
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, status, user_ids } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Atualizar dados básicos
        await connection.query(
            "UPDATE projects SET name = ?, description = ?, status = ? WHERE id = ?",
            [name, description, status, id]
        );

        // 2. Sincronizar membros
        if (user_ids && Array.isArray(user_ids)) {
            // Remover membros antigos
            await connection.query("DELETE FROM project_users WHERE project_id = ?", [id]);

            // Adicionar novos membros
            if (user_ids.length > 0) {
                const values = user_ids.map(userId => [id, userId]);
                await connection.query(
                    "INSERT INTO project_users (project_id, user_id) VALUES ?",
                    [values]
                );
            }
        }

        await connection.commit();
        res.json({ message: "Projeto atualizado com sucesso!", id, ...req.body });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar projeto." });
    } finally {
        connection.release();
    }
});

// Deletar projeto
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Cascade delete em project_users deve ser lidado pelo DB se configurado corretamente
        // Mas o pool.query lida com isso se definirmos ON DELETE CASCADE no SQL
        await pool.query("DELETE FROM projects WHERE id = ?", [id]);
        res.json({ message: "Projeto deletado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar projeto." });
    }
});

module.exports = router;
