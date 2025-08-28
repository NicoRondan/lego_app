import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { impersonate } from '../services/api';

function Impersonate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    (async () => {
      try {
        await impersonate(token);
      } finally {
        navigate('/');
        window.location.href = '/';
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="container my-5">Iniciando impersonación...</div>;
}

export default Impersonate;
