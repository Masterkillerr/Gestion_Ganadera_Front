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
 </div>

 {/* Right: Search + Notifications + Profile */}
 <div className="flex items-center gap-2 md:gap-4">
 {/* Search */}
 <div className="hidden sm:block">
 <div className="relative group">
 <svg
 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-brand-400"
 fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
 </svg>
 <input
 type="search"
 placeholder="Buscar animales, lotes..."
 className="w-40 rounded-full border border-dark-400/30 bg-dark-800/50 py-1.5 pl-9 pr-4 text-sm text-gray-200 outline-none transition-all placeholder:text-gray-600 focus:w-56 focus:border-brand-600/40 focus:bg-dark-800 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.06)] md:w-48"
 aria-label="Buscar"
 />
 <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-[10px] font-medium text-dark-300 md:block group-focus-within:hidden">⌘K</span>
 </div>
 </div>

 {/* Notifications */}
 <button
 className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-dark-600/50 hover:text-gray-100"
 aria-label="Notificaciones"
 >
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
 </svg>
 <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-dark-950" aria-hidden="true" />
 </button>

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
