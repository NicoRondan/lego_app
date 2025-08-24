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
      <div className="text-center mb-3">
        <img
          src="/assets/logo.png"
          alt="Brick Market"
          width="100"
          height="100"
          className="mb-3"
          loading="lazy"
        />
        <h2 className="mb-0">Iniciar sesión</h2>
      </div>
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
            aria-label="Email"
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
            aria-label="Contraseña"
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
          disabled={loading}
          type="submit"
          aria-label="Ingresar"
        >
          <i className="fa-solid fa-right-to-bracket me-2" aria-hidden="true"></i>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
      <hr />
      <button
        className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
        onClick={loginWithGoogle}
        aria-label="Continuar con Google"
      >
        <i className="fa-brands fa-google me-2" aria-hidden="true"></i>
        Continuar con Google
      </button>
    </AuthCard>
  );
};

export default LoginPage;
