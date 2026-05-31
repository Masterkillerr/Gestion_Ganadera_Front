import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden font-sans">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-900/30 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-earth-900/20 blur-[150px] pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-dark-800 border border-dark-400 shadow-[0_0_15px_rgba(45,156,45,0.2)]">
            <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">GestGan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm font-semibold rounded-lg shadow-lg shadow-brand-500/20">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          La nueva forma de gestionar tu ganado
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 max-w-4xl leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
          Gestión Ganadera <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Inteligente</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 animate-fade-up" style={{ animationDelay: '200ms' }}>
          Toma el control total de tu finca. Registra, analiza y optimiza la producción, sanidad y reproducción de tus animales en un solo lugar.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Link to="/register" className="btn-primary py-4 px-8 text-lg font-semibold rounded-xl shadow-[0_0_30px_rgba(45,156,45,0.3)] hover:shadow-[0_0_40px_rgba(45,156,45,0.4)] transition-all transform hover:-translate-y-1">
            Comienza Gratis
          </Link>
          <Link to="/login" className="glass-card py-4 px-8 text-lg font-semibold text-white rounded-xl hover:bg-white/5 transition-all">
            Ingresar a mi cuenta
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-card p-8 rounded-2xl text-left border border-white/5 hover:border-brand-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Estadísticas Clave</h3>
            <p className="text-gray-400">Visualiza el rendimiento productivo y reproductivo de tus animales con estadísticas clave.</p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl text-left border border-white/5 hover:border-brand-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Sanidad Total</h3>
            <p className="text-gray-400">Lleva un registro preciso de vacunas, tratamientos e historial médico del rebaño.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl text-left border border-white/5 hover:border-brand-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Gestión Múltiple</h3>
            <p className="text-gray-400">Administra múltiples fincas y lotes desde una única plataforma centralizada y segura.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
