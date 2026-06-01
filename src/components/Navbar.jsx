import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = ({ onMenuToggle }) => {
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
 <header className="sticky top-0 z-20 h-16 border-b border-dark-400/30 bg-dark-950/80 backdrop-blur-xl">
 <div className="flex h-full items-center justify-between px-4 md:px-6">
 {/* Left: Menu Toggle + Breadcrumb */}
 <div className="flex items-center gap-3">
 <button
 onClick={onMenuToggle}
 className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-dark-600/50 hover:text-gray-100 lg:hidden"
 aria-label="Abrir menú"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
 </svg>
 </button>

 <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
 <span className="text-gray-500">Sistema</span>
 <svg className="h-3.5 w-3.5 text-dark-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
 </svg>
 <span className="font-medium text-gray-200">Panel</span>
 </nav>
 </div>      {/* Right: Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Profile */}
 {user ? (
 <div className="flex items-center gap-3 border-l border-dark-400/30 pl-3 md:pl-4">
 <div className="hidden text-right sm:block">
 <p className="text-sm font-medium leading-tight text-gray-100">{user.name}</p>
 <p className="text-[11px] text-gray-500">{user.email}</p>
 </div>
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-sm font-bold uppercase text-white shadow-lg shadow-brand-600/20 ring-2 ring-brand-500/20">
 {user.name ? user.name.charAt(0) : 'U'}
 </div>
 <button
 onClick={handleLogout}
 className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-950/20 hover:text-red-400"
 title="Cerrar Sesión"
 aria-label="Cerrar Sesión"
 >
 <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
 </svg>
 </button>
 </div>
 ) : (
 <div className="flex items-center gap-2">
 <Link
 to="/login"
 className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
 >
 Iniciar Sesión
 </Link>
 <Link
 to="/register"
 className="btn-primary py-1.5 px-4 text-xs"
 >
 Registrarse
 </Link>
 </div>
 )}
 </div>
 </div>
 </header>
 );
};

export default Navbar;
