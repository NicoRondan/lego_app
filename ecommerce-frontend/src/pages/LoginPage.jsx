import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthCard from '../components/AuthCard';

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(form);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h2 className="mb-3">Iniciar sesión</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className="form-control"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            name="password"
            type="password"
            className="form-control"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button className="btn btn-primary w-100" disabled={loading} type="submit">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <hr />
      <button className="btn btn-outline-dark w-100" onClick={loginWithGoogle}>
        <span className="me-2" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.56-2.56C13.55.8 11.48 0 9 0 5.48 0 2.44 2.02.96 5l2.9 2.26C4.45 5.09 6.55 3.48 9 3.48z"/>
            <path fill="#FBBC05" d="M17.64 9.2c0-.74-.06-1.29-.2-1.86H9v3.38h4.9c-.1.84-.64 2.1-1.84 2.94l2.84 2.2c1.7-1.57 2.74-3.88 2.74-6.66z"/>
            <path fill="#34A853" d="M3.86 10.74c-.44-1.31-.44-2.72 0-4.03L.96 4.45C-.32 6.9-.32 9.94.96 12.4l2.9-2.26z"/>
            <path fill="#4285F4" d="M9 18c2.48 0 4.55-.8 6.06-2.18l-2.84-2.2c-.73.5-1.7.85-3.22.85-2.45 0-4.55-1.61-5.14-3.74l-2.9 2.26C2.44 15.98 5.48 18 9 18z"/>
          </svg>
        </span>
        Continuar con Google
      </button>
    </AuthCard>
  );
};

export default LoginPage;
