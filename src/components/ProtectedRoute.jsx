import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';
import RestrictedAccess from './RestrictedAccess';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMINISTRADOR') {
    return <Outlet />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <RestrictedAccess requiredRoles={allowedRoles} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
