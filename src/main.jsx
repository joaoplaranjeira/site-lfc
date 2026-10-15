import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './react-bridge.css';

// StrictMode executa effects duas vezes em desenvolvimento. Estas páginas
// ainda carregam scripts clássicos com efeitos globais, pelo que um único
// ciclo de montagem é intencional até esses scripts serem convertidos.
createRoot(document.getElementById('root')).render(<App />);
