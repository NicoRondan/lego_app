import React, { useState } from 'react';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subscribeNewsletter(email);
      toast.success('¡Gracias por suscribirte!');
      setEmail('');
    } catch (err) {
      toast.error('Hubo un problema. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="row g-3" onSubmit={handleSubmit} noValidate>
      <div className="col-md-6 mx-auto">
        <label htmlFor="newsletter-email" className="form-label">
          Suscríbete a nuestras novedades
        </label>
        <div className="input-group">
          <input
            type="email"
            id="newsletter-email"
            className="form-control"
            placeholder="email@ejemplo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            Enviar
          </button>
        </div>
      </div>
    </form>
  );
}

export default Newsletter;
