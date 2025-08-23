import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Page for logging in with a social provider. For this MVP, the user
// manually enters providerId, name and email; in a real app OAuth flows
// would be handled automatically.
function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState('google');
  const [providerId, setProviderId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ provider, providerId, name, email });
      navigate('/');
    } catch (err) {
      console.error(err);
      setMessage('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h2 className="mb-4">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Proveedor</label>
            <select
              className="form-select"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">ID del proveedor (sub)</label>
            <input
              type="text"
              className="form-control"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
          {message && <p className="mt-3 text-danger">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;