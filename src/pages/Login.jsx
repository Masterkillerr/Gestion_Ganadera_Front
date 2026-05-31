import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { useLoading } from '../context/LoadingContext';

const Login = () => {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const navigate = useNavigate();
 const location = useLocation();
 const registered = location.state?.registered;
 const [error, setError] = useState('');
 const loading = useLoading();
 const recaptchaRendered = useRef(false);
 const skipRecaptcha = import.meta.env.DEV;

 useEffect(() => {
 if (skipRecaptcha) return;

 const loadAndRender = () => {
 const container = document.getElementById('recaptcha-container');
 if (!container) return;

 if (!window.grecaptcha || !window.grecaptcha.render) {
 const existing = document.querySelector('script[src*="recaptcha/api.js"]');
 if (!existing) {
 const script = document.createElement('script');
 script.src = 'https://www.google.com/recaptcha/api.js';
 script.async = true;
 script.defer = true;
 script.onload = loadAndRender;
 document.head.appendChild(script);
 } else {
 setTimeout(loadAndRender, 500);
 }
 return;
 }

 if (!recaptchaRendered.current) {
 try {
 window.grecaptcha.render('recaptcha-container', {
 sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY
 });
 recaptchaRendered.current = true;
 } catch (e) {
 console.warn('reCAPTCHA render warning:', e?.message);
 }
 }
 };

 loadAndRender();
 }, [registered, skipRecaptcha]);

 const handleLogin = async (e) => {
 e.preventDefault();
 setError('');
 loading.showLoading('Iniciando sesión...');

 if (skipRecaptcha) {
 try {
 await authService.login({ email, password, recaptchaToken: 'localhost-bypass' });
 navigate('/dashboard');
 } catch (err) {
 setError(err.response?.data?.message || 'Credenciales no coinciden o hubo un problema al conectar');
 } finally {
 loading.hideLoading();
 }
 return;
 }

 if (!window.grecaptcha || !window.grecaptcha.getResponse) {
 setError('reCAPTCHA no disponible');
 loading.hideLoading();
 return;
 }

 const recaptchaToken = window.grecaptcha.getResponse();
 if (!recaptchaToken) {
 setError('Por favor completa el reCAPTCHA');
 loading.hideLoading();
 return;
 }

 try {
 await authService.login({ email, password, recaptchaToken });
 navigate('/dashboard');
 } catch (err) {
 setError(err.response?.data?.message || 'Credenciales no coinciden o hubo un problema al conectar');
 } finally {
 loading.hideLoading();
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-dark-950 relative overflow-hidden p-4">
 {/* Background decoration */}
 <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
 <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] rounded-full bg-brand-600/10 blur-[140px]" />
 <div className="absolute bottom-[-15%] right-[-8%] w-[45%] h-[45%] rounded-full bg-earth-600/8 blur-[140px]" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-dark-800/50 blur-[100px]" />
 </div>

 <div className="w-full max-w-sm relative z-10 animate-fade-up">
 {/* Logo */}
 <div className="text-center mb-8">        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-dark-400/40 shadow-lg shadow-black/20 mb-3 ring-1 ring-brand-500/20">
 <img src="/logo.png" alt="GreenField" className="w-10 h-10 object-contain" />
 </div>
 <h1 className="text-xl font-bold text-white tracking-tight">Bienvenido de vuelta</h1>
 <p className="mt-1.5 text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
 </div>

 {/* Card */}
 <div className="rounded-2xl border border-dark-400/40 bg-dark-800/60 backdrop-blur-xl p-6 shadow-xl">
 {/* Success message */}
 {registered && (
 <div className="flex items-center gap-3 rounded-xl border border-brand-700/30 bg-brand-950/40 px-4 py-3 mb-5 text-sm text-brand-300 animate-slide-up">
 <svg className="h-5 w-5 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span>Cuenta creada con éxito. Inicia sesión con tus credenciales.</span>
 </div>
 )}

 {/* Error message */}
 {error && (
 <div className="flex items-center gap-3 rounded-xl border border-red-700/30 bg-red-950/40 px-4 py-3 mb-5 text-sm text-red-300 animate-slide-up">
 <svg className="h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
 </svg>
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleLogin} className="space-y-4">
 {/* Email */}
 <div>
 <label htmlFor="login-email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
 Correo Electrónico
 </label>
 <input
 id="login-email"
 type="email"
 className="input-field"
 placeholder="tu@correo.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 autoComplete="email"
 />
 </div>

 {/* Password */}
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label htmlFor="login-password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
 Contraseña
 </label>
 <a href="#" className="text-xs text-brand-500 hover:text-brand-400 transition-colors font-medium">
 ¿Olvidaste tu contraseña?
 </a>
 </div>
 <div className="relative">
 <input
 id="login-password"
 type={showPassword ? 'text' : 'password'}
 className="input-field pr-10"
 placeholder="••••••••"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 autoComplete="current-password"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
 aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
 >
 {showPassword ? (
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
 </svg>
 ) : (
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 )}
 </button>
 </div>
 </div>

 {!skipRecaptcha && (
 <div className="flex justify-center py-2">
 <div id="recaptcha-container" />
 </div>
 )}

 <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm mt-2">
 Iniciar Sesión
 </button>
 </form>
 </div>

 {/* Register link */}
 <p className="mt-6 text-center text-sm text-gray-500">
 ¿No tienes una cuenta?{' '}
 <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
 Regístrate aquí
 </Link>
 </p>
 </div>
 </div>
 );
};

export default Login;
