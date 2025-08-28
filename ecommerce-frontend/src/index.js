import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext.jsx';
import { ConfirmProvider } from './components/ConfirmProvider.jsx';
import applyTokens from './theme/applyTokens';
import './theme/bootstrap.scss';
import './theme/variables.css';
import './theme/lego.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

applyTokens();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ConfirmProvider>
              <App />
            </ConfirmProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
