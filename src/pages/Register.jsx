import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useLoading } from "../context/LoadingContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const loading = useLoading();
  const recaptchaRendered = useRef(false);
  const skipRecaptcha = import.meta.env.DEV;

  useEffect(() => {
    if (skipRecaptcha) return;

    const loadAndRender = () => {
      const container = document.getElementById("recaptcha-container");
      if (!container) return;

      if (!window.grecaptcha || !window.grecaptcha.render) {
        const existing = document.querySelector('script[src*="recaptcha/api.js"]');
        if (!existing) {
          const script = document.createElement("script");
          script.src = "https://www.google.com/recaptcha/api.js";
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
          window.grecaptcha.render("recaptcha-container", {
            sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
          });
          recaptchaRendered.current = true;
        } catch (e) {
          console.warn("reCAPTCHA render warning:", e?.message);
        }
      }
    };

    loadAndRender();
  }, [skipRecaptcha]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    loading.showLoading("Creando cuenta...");

    try {
      if (skipRecaptcha) {
        await authService.register({
          nombre: name,
          email,
          password,
          recaptchaToken: "localhost-bypass",
        });
        navigate("/login", { state: { registered: true } });
        return;
      }

      if (!window.grecaptcha || !window.grecaptcha.getResponse) {
        setError("reCAPTCHA no disponible");
        loading.hideLoading();
        return;
      }

      const recaptchaToken = window.grecaptcha.getResponse();
      if (!recaptchaToken) {
        setError("Por favor completa el reCAPTCHA");
        loading.hideLoading();
        return;
      }

      await authService.register({
        nombre: name,
        email,
        password,
        recaptchaToken,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Hubo un error al crear la cuenta. Verifica que el correo no exista.",
      );
    } finally {
      loading.hideLoading();
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute top-[-20%] right-[10%] h-[60vh] w-[55vw] rounded-full bg-brand-600/[0.03] blur-[180px]" />
        <div className="absolute bottom-[-25%] left-[5%] h-[50vh] w-[50vw] rounded-full bg-earth-600/[0.02] blur-[180px]" />
        <div className="absolute top-1/2 left-1/2 h-[75vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-dark-800/60 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 inline-flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white/95 shadow-lg shadow-black/30 ring-1 ring-brand-500/25">
            <img
              src="/logo.png"
              alt="GreenField"
              className="h-[40px] w-[40px] object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Crear una Cuenta
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-base text-gray-400">
            Únete a GreenField para administrar tu granja de forma moderna.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-dark-400/40 bg-dark-800/55 p-8 shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-700/35 bg-red-950/40 px-5 py-4 text-sm text-red-300 animate-slide-up">
              <svg
                className="h-5 w-5 shrink-0 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label
                htmlFor="reg-name"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400"
              >
                Nombre Completo
              </label>
              <input
                id="reg-name"
                type="text"
                className="input-field"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400"
              >
                Correo Electrónico
              </label>
              <input
                id="reg-email"
                type="email"
                className="input-field"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition-colors hover:text-gray-300"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-confirm"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400"
              >
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition-colors hover:text-gray-300"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-[18px] w-[18px]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!skipRecaptcha && (
              <div id="recaptcha-container" className="flex justify-center py-1"></div>
            )}

            <button
              type="submit"
              disabled={loading.isLoading}
              className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed relative"
            >
              {loading.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="mt-8 text-center text-sm text-gray-500">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-brand-400 transition-colors hover:text-brand-300"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
