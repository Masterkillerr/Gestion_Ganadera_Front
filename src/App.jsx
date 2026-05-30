import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { LoadingProvider } from './context/LoadingContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import Layout from './components/Layout';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Home = React.lazy(() => import('./pages/Home'));

// Ganado Module
const GanadoList = React.lazy(() => import('./pages/Ganado/GanadoList'));
const GanadoForm = React.lazy(() => import('./pages/Ganado/GanadoForm'));
const GanadoDetail = React.lazy(() => import('./pages/Ganado/GanadoDetail'));

// Movimientos Module
const MovimientosList = React.lazy(() => import('./pages/Movimientos/MovimientosList'));
const MovimientoForm = React.lazy(() => import('./pages/Movimientos/MovimientoForm'));

// Reproducción Module
const ReproduccionList = React.lazy(() => import('./pages/Reproduccion/ReproduccionList'));
const ReproduccionForm = React.lazy(() => import('./pages/Reproduccion/ReproduccionForm'));

// Producción Module
const ProduccionList = React.lazy(() => import('./pages/Produccion/ProduccionList'));
const ProduccionForm = React.lazy(() => import('./pages/Produccion/ProduccionForm'));

// Other Modules
const SanidadPage = React.lazy(() => import('./pages/SanidadPage'));
const OperacionesPage = React.lazy(() => import('./pages/OperacionesPage'));
const InfraestructuraPage = React.lazy(() => import('./pages/InfraestructuraPage'));
const AlimentacionForm = React.lazy(() => import('./pages/Alimentacion/AlimentacionForm'));

function App() {
  return (
    <Router>
      <ToastProvider>
        <LoadingProvider>
        <Suspense fallback={<LoadingSpinner fullPage message="Cargando..." />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Ganado Module */}
          <Route path="ganado" element={<GanadoList />} />
          <Route path="ganado/nuevo" element={<GanadoForm />} />
          <Route path="ganado/editar/:id" element={<GanadoForm />} />
          <Route path="ganado/:id" element={<GanadoDetail />} />

          <Route path="fincas" element={<div className="p-8"><h1 className="text-2xl font-bold">Fincas y Lotes</h1></div>} />
          <Route path="reproduccion" element={<ReproduccionList />} />
          <Route path="reproduccion/nuevo" element={<ReproduccionForm />} />
          <Route path="reproduccion/editar/:id" element={<ReproduccionForm />} />
          <Route path="sanidad" element={<SanidadPage />} />
          <Route path="operaciones" element={<OperacionesPage />} />
          <Route path="operaciones/alimentacion/nuevo" element={<AlimentacionForm />} />
          <Route path="infraestructura" element={<InfraestructuraPage />} />
          <Route path="produccion" element={<ProduccionList />} />
          <Route path="produccion/nuevo" element={<ProduccionForm />} />
          <Route path="produccion/editar/:id" element={<ProduccionForm />} />
          {/* Movimientos Module */}
          <Route path="movimientos" element={<MovimientosList />} />
          <Route path="movimientos/nuevo" element={<MovimientoForm />} />
          <Route path="reportes" element={<div className="p-8"><h1 className="text-2xl font-bold">Reportes</h1></div>} />
          <Route path="alertas" element={<div className="p-8"><h1 className="text-2xl font-bold">Alertas</h1></div>} />
          <Route path="administracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Administración</h1></div>} />
          <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
        </Route>        </Routes>
        </Suspense>
        </LoadingProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
