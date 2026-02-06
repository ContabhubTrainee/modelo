const axios = require('axios');

const API_URL = 'http://localhost:5000/user-companies'; // Port 5000 from .env

// Helper to log steps
const step = (msg) => console.log(`\n[STEP] ${msg}`);

async function runTests() {
    let createdId = null;

    try {
        // 1. List existing (should be empty or existing data)
        step("Listar vínculos iniciais");
        let res = await axios.get(API_URL);
        console.log("Status:", res.status);
        console.log("Data:", res.data);

        // 2. Create a new link
        // We need valid user_id and company_id. 
        // Based on screenshots: users id 1 exists, companies id 1 exists.
        step("Criar novo vínculo");
        res = await axios.post(API_URL, {
            user_id: 1,
            company_id: 1,
            role: 'visitante'
        });
        console.log("Status:", res.status);
        console.log("Data:", res.data);
        createdId = res.data.id;

        // 3. Update the link
        if (createdId) {
            step(`Atualizar vínculo ID ${createdId}`);
            res = await axios.put(`${API_URL}/${createdId}`, {
                role: 'admin'
            });
            console.log("Status:", res.status);
            console.log("Data:", res.data);
        }

        // 4. List again to see update
        step("Listar novamente");
        res = await axios.get(API_URL);
        console.log("List size:", res.data.length);
        const updated = res.data.find(r => r.id === createdId);
        if (updated) console.log("Updated record:", updated);

        // 5. Delete the link
        if (createdId) {
            step(`Deletar vínculo ID ${createdId}`);
            res = await axios.delete(`${API_URL}/${createdId}`);
            console.log("Status:", res.status);
            console.log("Data:", res.data);
        }

        step("Teste finalizado com sucesso!");

    } catch (error) {
        console.error("ERRO NO TESTE:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
