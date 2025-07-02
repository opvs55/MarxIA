import { useState, useEffect, useRef } from 'react';
import { getAIResponse } from '../../services/geminiService';
import './ChatWindow.css';

function ChatWindow({ character }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [pergunta, setPergunta] = useState('');
  const [respostaParcial, setRespostaParcial] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentAvatar, setCurrentAvatar] = useState(character.avatars.neutral);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, respostaParcial]);

  const parseResponse = (responseText) => {
    const toneRegex = /\[TONE:(\w+)\]/;
    const match = responseText.match(toneRegex);
    const textForDisplay = responseText.replace(toneRegex, '').trim();

    if (match) {
      const tone = match[1].toLowerCase();
      if (character.avatars[tone]) {
        setCurrentAvatar(character.avatars[tone]);
      }
    }
    return textForDisplay;
  };

  const fazerPergunta = async () => {
    if (!pergunta.trim() || loading) return;

    const currentQuestion = pergunta;
    const userMessage = { role: 'user', parts: [{ text: currentQuestion }] };

    setLoading(true);
    setError('');
    setPergunta('');

    const currentHistory = [...chatHistory, userMessage];
    setChatHistory(currentHistory);

    try {
      const historyForAPI = currentHistory.slice(0, -1);
      
      const fullResponseText = await getAIResponse(currentQuestion, historyForAPI, character.systemInstruction);
      const text = parseResponse(fullResponseText);
      const modelMessage = { role: 'model', parts: [{ text }] };

      setRespostaParcial(' ');

      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setRespostaParcial(prev => text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
          setChatHistory(prev => [...prev, modelMessage]);
          setRespostaParcial('');
          setLoading(false);
        }
      }, 35);

    } catch (err) {
      setChatHistory(prevHistory => prevHistory.slice(0, -1));
      setError(err.message);
      setLoading(false);
    }
  };

  const limparChat = () => {
    setChatHistory([]);
    setRespostaParcial('');
    setError('');
    setCurrentAvatar(character.avatars.neutral);
  };

  // O JSX aqui é o mesmo que já tínhamos, totalmente funcional.
  return (
    <div className="chat-window">
        <header className="chat-header">
            <img src={currentAvatar} alt={`${character.name} - tom atual`} className="avatar-dynamic" />
            <div>
                <h1>{character.name}</h1>
                <p>{character.tagline}</p>
            </div>
        </header>
        <div className="chat-history" ref={chatContainerRef}>
            {chatHistory.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user' : 'model'}`}>
                <p><strong>{msg.role === 'user' ? 'Você' : character.name}:</strong> {msg.parts[0].text}</p>
            </div>
            ))}
            {loading && (
                <div className="message-bubble model">
                <p><strong>{character.name}:</strong> {respostaParcial}<span className="typing-cursor"></span></p>
                </div>
            )}
        </div>
        {error && <p className="error-message">{error}</p>}
        <footer className="chat-footer">
            <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Questione as estruturas..."
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && fazerPergunta()}
            />
            <button onClick={fazerPergunta} disabled={loading}>
            {loading ? 'Analisando...' : 'Enviar'}
            </button>
        </footer>
        {chatHistory.length > 0 && !loading && (
            <button onClick={limparChat} className="reset-button">
                Apagar a História
            </button>
        )}
    </div>
  );
}

export default ChatWindow;