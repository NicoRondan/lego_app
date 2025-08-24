import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthCard from '../components/AuthCard';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs = {};
    if (!form.name) errs.name = 'Requerido';
    if (!form.email) errs.email = 'Requerido';
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (form.password !== form.confirm) errs.confirm = 'No coincide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <h2 className="mb-3">Crear cuenta</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={form.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            name="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={form.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            name="password"
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            name="confirm"
            type="password"
            className={`form-control ${errors.confirm ? 'is-invalid' : ''}`}
            value={form.confirm}
            onChange={handleChange}
            required
          />
          {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
        </div>
        <button className="btn btn-primary w-100" disabled={loading} type="submit">
          {loading ? 'Registrando…' : 'Registrarse'}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
