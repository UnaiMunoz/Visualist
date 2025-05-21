import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './css/index2.css'; // Añade esta línea
import './css/list-buttons.css'; // Import list buttons CSS


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);