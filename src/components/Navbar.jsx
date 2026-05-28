import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };
  return (
    <header className="h-16 border-b border-dark-600 bg-dark-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      {/* Title Breadcrumbs area */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Sistema</span>
        <span className="text-gray-600">/</span>
        <span className="text-gray-100 font-medium">Dashboard Overview</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative group">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar animales, lote..." 
            className="bg-dark-800 border border-dark-600 rounded-full pl-9 pr-4 py-1.5 text-sm text-gray-200 focus:border-brand-600 focus:ring-1 focus:ring-brand-600/50 outline-none w-64 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-dark-900 rounded-full animate-pulse"></span>
        </button>

        {/* Profile / Auth actions */}
        <div className="flex items-center gap-4 border-l border-dark-600 pl-6">
          {user ? (
            <>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-100 leading-tight">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-900 border border-brand-600 flex items-center justify-center text-brand-300 font-bold overflow-hidden shadow-lg shadow-brand-500/20 uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center"
                title="Cerrar Sesión"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn-primary py-1.5 px-3 text-xs">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
