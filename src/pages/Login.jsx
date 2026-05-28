import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;
  const [error, setError] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    if (window.grecaptcha && window.grecaptcha.execute) {
      setRecaptchaLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const recaptchaToken = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: 'login' }
      );
      await authService.login({ email, password, recaptchaToken });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales no coinciden o hubo un problema al conectar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-900/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-earth-900/20 blur-[120px] pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-800 border border-dark-400 mb-4 shadow-[0_0_20px_rgba(45,156,45,0.2)]">
             <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Bienvenido a GestGan</h1>
          <p className="text-gray-400 text-sm">Inicia sesión para gestionar tu ganadería</p>
        </div>

        {registered && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-sm p-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-up">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Cuenta creada con éxito. Inicia sesión con tus credenciales.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-up">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Contraseña</label>
              <a href="#" className="text-xs text-brand-500 hover:text-brand-400 transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 text-base mt-2">
            {recaptchaLoaded ? 'Iniciar Sesión' : 'Cargando...'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-400 font-semibold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
