const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Listar todas as empresas
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM companies");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar empresas." });
    }
});

// Obter uma empresa pelo ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query("SELECT * FROM companies WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar empresa." });
    }
});

// Criar nova empresa
router.post("/", async (req, res) => {
    const { name, description, active } = req.body;

    if (!name) {
        return res.status(400).json({ error: "O nome da empresa é obrigatório." });
    }

    // Se active não for enviado, assume 1 (padrão do banco)
    // Mas se for enviado, usamos o valor.
    const activeValue = active !== undefined ? active : 1;

    try {
        const [result] = await pool.query(
            "INSERT INTO companies (name, description, active) VALUES (?, ?, ?)",
            [name, description, activeValue]
        );

        res.status(201).json({
            message: "Empresa criada com sucesso!",
            id: result.insertId,
            name,
            description,
            active: activeValue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar empresa." });
    }
});

// Atualizar empresa
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, active } = req.body;

    try {
        // Verifica se existe
        const [existing] = await pool.query("SELECT * FROM companies WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        // Prepara campos para update dinâmico (opcional, ou podemos obrigar enviar tudo)
        // Aqui vou fazer update dos campos enviados, mantendo os antigos se não enviados
        const current = existing[0];
        const newName = name !== undefined ? name : current.name;
        const newDescription = description !== undefined ? description : current.description;
        const newActive = active !== undefined ? active : current.active;

        await pool.query(
            "UPDATE companies SET name = ?, description = ?, active = ? WHERE id = ?",
            [newName, newDescription, newActive, id]
        );

        res.json({
            message: "Empresa atualizada com sucesso!",
            id,
            name: newName,
            description: newDescription,
            active: newActive
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar empresa." });
    }
});

// Deletar empresa
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query("DELETE FROM companies WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Empresa não encontrada." });
        }

        res.json({ message: "Empresa removida com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao remover empresa." });
    }
});

module.exports = router;
