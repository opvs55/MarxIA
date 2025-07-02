// frontend/src/services/geminiService.js

// 1. Lemos a URL do nosso backend a partir da variável de ambiente que criamos.
//    'import.meta.env' é a forma como o Vite nos dá acesso a essas variáveis.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Envia a pergunta para o nosso backend isolado.
 * @param {string} newQuestion A nova pergunta do usuário.
 * @param {Array} history O histórico da conversa atual.
 * @param {string} systemInstruction A instrução de sistema para o personagem.
 * @returns {Promise<string>} O texto da resposta da IA, vindo do nosso backend.
 */
export const getAIResponse = async (newQuestion, history, systemInstruction) => {
  try {
    // 2. A chamada 'fetch' agora usa a URL completa do nosso backend.
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 3. O corpo da requisição é o mesmo, enviando os dados para o backend.
      body: JSON.stringify({
        newQuestion,
        history,
        systemInstruction,
      }),
    });

    // 4. Tratamento de erro, caso nosso backend responda com um erro.
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'A requisição para o backend falhou');
    }

    const data = await response.json();
    return data.text;

  } catch (err) {
    console.error("Erro ao chamar o backend:", err);
    throw new Error('Não foi possível se comunicar com o servidor. Tente novamente.');
  }
};