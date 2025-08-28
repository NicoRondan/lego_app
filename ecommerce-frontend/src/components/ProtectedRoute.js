import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component to protect routes that require authentication and optionally check
// for a specific user role. Unauthenticated users are redirected to the login
// page with the intended destination preserved. When a role is provided and the
// authenticated user's role does not match, a 403 message is displayed.
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  // While the authentication status is loading (`user` is `undefined`),
  // avoid redirecting the user. This prevents flickering and unwanted
  // redirects when the user actually has an active session.
  if (user === undefined) {
    return null;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ redirectTo: location.pathname + location.search }}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    return <div>403 - Forbidden</div>;
  }

  return children;
};

export default ProtectedRoute;