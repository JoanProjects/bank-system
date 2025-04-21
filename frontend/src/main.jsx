import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
// Importar el AuthProvider
import { AuthProvider } from './contexts/AuthContext.jsx';
// Importar BrowserRouter para el enrutador
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Envolver con AuthProvider para que toda la app tenga acceso */}
    <AuthProvider>
       {/* Envolver con BrowserRouter para habilitar react-router-dom */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);