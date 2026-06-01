import React from 'react';

const RestrictedAccess = ({ requiredRoles }) => (
  <div className="flex h-full items-center justify-center p-8 bg-dark-950">
    <div className="bg-dark-800 p-8 rounded-xl text-center max-w-lg border border-red-900/50 shadow-2xl">
      <div className="text-red-500 mb-6">
        <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h2>
      <p className="text-gray-300 mb-6">
        No tienes permisos para acceder a esta sección. 
        Requiere uno de los siguientes roles: <strong className="text-red-400">{requiredRoles.join(', ')}</strong>.
      </p>
      <div className="bg-dark-900 p-4 rounded-lg text-sm text-gray-400">
        Si crees que esto es un error, por favor contacta a un <strong>Administrador</strong> para solicitar el acceso adecuado.
      </div>
    </div>
  </div>
);

export default RestrictedAccess;
