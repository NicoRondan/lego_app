import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginCallback = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { fetchMe } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const ok = params.get('ok');
    if (ok) {
      const redirectTo = sessionStorage.getItem('redirectTo');
      sessionStorage.removeItem('redirectTo');
      fetchMe().finally(() => navigate(redirectTo || -1));
    } else {
      navigate('/login');
    }
  }, [search, navigate, fetchMe]);

  return <p>Procesando autenticación…</p>;
};

export default LoginCallback;
