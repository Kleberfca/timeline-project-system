// src/main.tsx
/**
 * Ponto de entrada da aplicação React
 * Temporariamente removido StrictMode para teste
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Removido temporariamente para teste - adicionar novamente após correção
  <React.StrictMode>
    <App />
  </React.StrictMode>
);