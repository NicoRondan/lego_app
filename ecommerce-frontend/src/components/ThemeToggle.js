import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const applyTheme = (t) => {
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      className="btn btn-outline-light d-flex align-items-center"
      onClick={toggle}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    >
      <i
        className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}
        aria-hidden="true"
      ></i>
      <span className="ms-2">{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>
    </button>
  );
};

export default ThemeToggle;
