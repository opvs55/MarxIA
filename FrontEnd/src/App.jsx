// src/App.jsx

import './App.css';
import { characters } from './config/characters';
import ChatWindow from './components/ChatWindow/ChatWindow';

function App() {
  // Selecionamos diretamente o personagem que queremos usar
  const currentCharacter = characters.marx;

  return (
    <div className="app-container">
      <ChatWindow character={currentCharacter} />
    </div>
  );
}

export default App;