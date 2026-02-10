const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Listar metas por empresa
router.get("/", async (req, res) => {
    const { company_id } = req.query;

    if (!company_id) {
        return res.status(400).json({ error: "Company ID is required" });
    }

    try {
        const query = `
            SELECT g.*, u.full_name as responsible_name, u.avatar_url as responsible_avatar, p.name as project_name
            FROM goals g
            LEFT JOIN users u ON g.responsible_id = u.id
            LEFT JOIN projects p ON g.project_id = p.id
            WHERE g.company_id = ?
            ORDER BY g.deadline ASC
        `;
        const [rows] = await pool.query(query, [company_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar metas.", details: error.message, sqlMessage: error.sqlMessage });
    }
});

// Criar nova meta
router.post("/", async (req, res) => {
    const { company_id, title, description, target_value, current_value, deadline, responsible_id, project_id } = req.body;

    if (!company_id || !title || !target_value) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO goals (company_id, title, description, target_value, current_value, deadline, status, responsible_id, project_id) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)",
            [company_id, title, description, target_value, current_value || 0, deadline, responsible_id || null, project_id || null]
        );

        res.status(201).json({
            message: "Meta criada com sucesso!",
            id: result.insertId,
            ...req.body,
            current_value: current_value || 0,
            status: 'active'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar meta." });
    }
});

// Atualizar meta completa
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, target_value, current_value, deadline, status, responsible_id, project_id } = req.body;

    try {
        await pool.query(
            `UPDATE goals SET 
                title = ?, 
                description = ?, 
                target_value = ?, 
                current_value = ?, 
                deadline = ?, 
                status = ?, 
                responsible_id = ?,
                project_id = ? 
            WHERE id = ?`,
            [title, description, target_value, current_value, deadline, status, responsible_id || null, project_id || null, id]
        );

        res.json({ message: "Meta atualizada com sucesso!", id, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar meta." });
    }
});

// Atualizar valor atual (progresso)
router.put("/:id/progress", async (req, res) => {
    const { id } = req.params;
    const { current_value } = req.body;

    if (current_value === undefined) {
        return res.status(400).json({ error: "Novo valor é obrigatório." });
    }

    try {
        await pool.query(
            "UPDATE goals SET current_value = ? WHERE id = ?",
            [current_value, id]
        );

        res.json({ message: "Progresso atualizado!", id, current_value });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar progresso." });
    }
});

// Deletar meta
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query("DELETE FROM goals WHERE id = ?", [id]);
        res.json({ message: "Meta removida com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao remover meta." });
    }
});

module.exports = router;
