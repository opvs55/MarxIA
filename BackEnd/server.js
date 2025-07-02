// backend/server.js

// 1. Importando os pacotes que instalamos
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 2. Configuração inicial
dotenv.config(); // Carrega as variáveis do arquivo .env (nossa API key)
const app = express(); // Cria o nosso aplicativo servidor
const PORT = process.env.PORT || 3001; // Define a porta onde o servidor vai rodar

// 3. Middlewares: "Plugins" que preparam nosso servidor
app.use(cors()); // Habilita o CORS para que o frontend possa nos acessar
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// 4. Configurando a IA (mesma lógica de antes, mas agora no lugar certo)
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  throw new Error("A variável GOOGLE_API_KEY não foi encontrada no arquivo .env");
}
const genAI = new GoogleGenerativeAI(API_KEY);

// 5. Definindo nossa rota de API
//    Quando o frontend chamar 'http://.../api/chat', este código será executado
app.post('/api/chat', async (req, res) => {
  try {
    console.log("Backend recebeu uma requisição:", req.body); // Ótimo para debug
    const { history, newQuestion, systemInstruction } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemInstruction,
    });

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(newQuestion);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("Erro no endpoint /api/chat:", error);
    res.status(500).json({ error: 'Falha ao obter resposta da IA.' });
  }
});

// 6. "Ligando" o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});