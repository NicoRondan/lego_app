import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import applyTokens from './theme/applyTokens';
import './theme/bootstrap.scss';
import './theme/variables.css';
import './theme/lego.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

applyTokens();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
