import React from 'react';

const AuthCard = ({ children }) => (
  <div className="d-flex justify-content-center">
    <div className="card shadow-sm rounded-3 p-4" style={{ maxWidth: 420, width: '100%' }}>
      {children}
    </div>
  </div>
);

export default AuthCard;
