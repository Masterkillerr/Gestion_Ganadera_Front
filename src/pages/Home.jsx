import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
 return (
 <div className="min-h-screen bg-dark-900 relative overflow-hidden font-sans">
 {/* Background */}
 <div className="pointer-events-none absolute inset-0" aria-hidden="true">
 <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-brand-900/30 blur-[160px]" />
 <div className="absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full bg-earth-900/20 blur-[160px]" />
 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-900/40 to-dark-900" />
 </div>

 {/* Header */}
 <header className="relative z-10">
 <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">        <Link to="/" className="flex items-center gap-3" aria-label="GreenField inicio">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-dark-400 shadow-[0_0_18px_rgba(45,156,45,0.18)]">
 <img src="/logo.png" alt="GreenField" className="h-7 w-7 object-contain" />
 </div>
 <span className="text-xl font-bold text-white tracking-tight">GreenField</span>
 </Link>
 <div className="flex items-center gap-3">
 <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link>
 <Link to="/register" className="btn-primary py-2 px-5 text-sm font-semibold">Registrarse</Link>
 </div>
 </div>
 </header>

 {/* Hero */}
 <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-28">
 <div className="mx-auto max-w-3xl text-center">
 <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-400 animate-fade-up">
 <span className="relative flex h-2 w-2" aria-hidden="true">
 <span className="absolute inset-0 rounded-full bg-brand-400 opacity-75 animate-ping" />
 <span className="relative rounded-full h-2 w-2 bg-brand-500" />
 </span>
 La nueva forma de gestionar tu ganado
 </span>

 <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl animate-fade-up" style={{ animationDelay: '100ms' }}>
 Gestión Ganadera <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Inteligente</span>
 </h1>

 <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 md:text-xl animate-fade-up" style={{ animationDelay: '200ms' }}>
 Toma el control total de tu finca. Registra, analiza y optimiza la producción, sanidad y reproducción de tus animales en un solo lugar.
 </p>

 <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: '300ms' }}>
 <Link to="/register" className="btn-primary w-full sm:w-auto justify-center py-3 px-8 text-base font-semibold">Comienza Gratis</Link>
 <Link to="/login" className="w-full sm:w-auto text-center rounded-xl border border-dark-400 bg-dark-800/60 px-8 py-3 text-base font-semibold text-white hover:bg-dark-700/80 transition-colors">
 Ingresar a mi cuenta
 </Link>
 </div>
 </div>

 {/* Features */}
 <section className="mx-auto mt-24 grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-3" aria-label="Características principales">
 <article className="glass-card rounded-2xl p-8 transition-colors hover:border-brand-500/30">
 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2v6a2 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </div>
 <h3 className="text-xl font-bold text-white">Estadísticas Clave</h3>
 <p className="mt-3 text-gray-400">Visualiza el rendimiento productivo y reproductivo de tus animales con estadísticas clave.</p>
 </article>

 <article className="glass-card rounded-2xl p-8 transition-colors hover:border-brand-500/30">
 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
 </svg>
 </div>
 <h3 className="text-xl font-bold text-white">Sanidad Total</h3>
 <p className="mt-3 text-gray-400">Lleva un registro preciso de vacunas, tratamientos e historial médico del rebaño.</p>
 </article>

 <article className="glass-card rounded-2xl p-8 transition-colors hover:border-brand-500/30">
 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
 <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="text-xl font-bold text-white">Gestión Múltiple</h3>
 <p className="mt-3 text-gray-400">Administra múltiples fincas y lotes desde una única plataforma centralizada y segura.</p>
 </article>
 </section>

 <p className="mx-auto mt-10 text-center text-sm text-gray-500">Pensado para operaciones reales. Creado para simplicidad.</p>
 </main>
 </div>
 );
};

export default Home;
