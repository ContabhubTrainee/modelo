const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// Enviar mensagem
router.post("/", async (req, res) => {
    const { sender_id, receiver_id, company_id, content } = req.body;

    if (!sender_id || !receiver_id || !company_id || !content) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO messages (sender_id, receiver_id, company_id, content) VALUES (?, ?, ?, ?)",
            [sender_id, receiver_id, company_id, content]
        );

        res.status(201).json({
            id: result.insertId,
            sender_id,
            receiver_id,
            company_id,
            content,
            created_at: new Date()
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar mensagem." });
    }
});

// Buscar histórico de mensagens entre dois usuários
router.get("/", async (req, res) => {
    const { user1_id, user2_id, company_id } = req.query;

    if (!user1_id || !user2_id || !company_id) {
        return res.status(400).json({ error: "Parâmetros insuficientes." });
    }

    try {
        const [messages] = await pool.query(
            `SELECT * FROM messages 
             WHERE company_id = ? 
             AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) 
             ORDER BY created_at ASC`,
            [company_id, user1_id, user2_id, user2_id, user1_id]
        );

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar mensagens." });
    }
});

// Marcar mensagens como lidas
router.put("/read", async (req, res) => {
    const { sender_id, receiver_id, company_id } = req.body;

    if (!sender_id || !receiver_id || !company_id) {
        return res.status(400).json({ error: "Parâmetros insuficientes." });
    }

    try {
        await pool.query(
            "UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND company_id = ?",
            [sender_id, receiver_id, company_id]
        );

        res.json({ message: "Mensagens marcadas como lidas." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao marcar mensagens como lidas." });
    }
});

module.exports = router;
