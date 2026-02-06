const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Listar todos os vínculos (opcionalmente filtrar por user_id ou company_id)
router.get("/", async (req, res) => {
    const { user_id, company_id } = req.query;
    let query = "SELECT * FROM user_companies WHERE 1=1";
    const params = [];

    if (user_id) {
        query += " AND user_id = ?";
        params.push(user_id);
    }
    if (company_id) {
        query += " AND company_id = ?";
        params.push(company_id);
    }

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar vínculos." });
    }
});

// Vincular usuário a empresa
router.post("/", async (req, res) => {
    const { user_id, company_id, role } = req.body;

    if (!user_id || !company_id || !role) {
        return res.status(400).json({ error: "user_id, company_id e role são obrigatórios." });
    }

    try {
        // Verificar se usuário existe (opcional, mas boa prática)
        // Verificar se empresa existe (opcional, mas boa prática)
        // O banco de dados provavelmente dará erro de FK se não existirem, então vamos confiar no catch por enquanto para simplificar, 
        // ou podemos adicionar verificações extras se o usuário pedir.

        const [result] = await pool.query(
            "INSERT INTO user_companies (user_id, company_id, role) VALUES (?, ?, ?)",
            [user_id, company_id, role]
        );

        res.status(201).json({
            message: "Vínculo criado com sucesso!",
            id: result.insertId,
            user_id,
            company_id,
            role
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "Este usuário já está vinculado a esta empresa." });
        }
        res.status(500).json({ error: "Erro ao criar vínculo." });
    }
});

// Atualizar função/role de um vínculo
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ error: "Role é obrigatório." });
    }

    try {
        const [result] = await pool.query(
            "UPDATE user_companies SET role = ? WHERE id = ?",
            [role, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vínculo não encontrado." });
        }

        res.json({ message: "Vínculo atualizado com sucesso!", id, role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar vínculo." });
    }
});

// Remover vínculo
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query("DELETE FROM user_companies WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vínculo não encontrado." });
        }

        res.json({ message: "Vínculo removido com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao remover vínculo." });
    }
});

module.exports = router;
