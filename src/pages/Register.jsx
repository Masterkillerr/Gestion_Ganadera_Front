import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import ReCAPTCHA from 'react-google-recaptcha';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    if (!recaptchaToken) {
      setError('Por favor, completa la verificación "No soy un robot"');
      return;
    }
    
    try {
      await authService.register({ nombre: name, email, password, recaptchaToken });
      
      // Redirigir al login con mensaje de éxito (evita reutilizar token reCAPTCHA de un solo uso)
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Hubo un error al crear la cuenta. Verifica que el correo no exista.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden py-10">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-900/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-earth-900/20 blur-[120px] pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Crear una Cuenta</h1>
          <p className="text-gray-400 text-sm">Únete a GestGan para administrar tu granja</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6 flex items-center gap-3 animate-fade-up">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nombre Completo</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-center my-4 overflow-hidden rounded-lg">
            <ReCAPTCHA
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={(token) => setRecaptchaToken(token)}
              theme="dark"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 text-base mt-2">
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-400 font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
