import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Ganado Module
import GanadoList from './pages/Ganado/GanadoList';
import GanadoForm from './pages/Ganado/GanadoForm';
import GanadoDetail from './pages/Ganado/GanadoDetail';

// Movimientos Module
import MovimientosList from './pages/Movimientos/MovimientosList';
import MovimientoForm from './pages/Movimientos/MovimientoForm';

// Reproducción Module
import ReproduccionList from './pages/Reproduccion/ReproduccionList';
import ReproduccionForm from './pages/Reproduccion/ReproduccionForm';

// Producción Module
import ProduccionList from './pages/Produccion/ProduccionList';
import ProduccionForm from './pages/Produccion/ProduccionForm';

function App() {
  return (
    <Router>
      <ToastProvider>
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
          <Route path="sanidad" element={<div className="p-8"><h1 className="text-2xl font-bold">Sanidad</h1></div>} />
          <Route path="produccion" element={<ProduccionList />} />
          <Route path="produccion/nuevo" element={<ProduccionForm />} />
          <Route path="produccion/editar/:id" element={<ProduccionForm />} />
          {/* Movimientos Module */}
          <Route path="movimientos" element={<MovimientosList />} />
          <Route path="movimientos/nuevo" element={<MovimientoForm />} />
          <Route path="reportes" element={<div className="p-8"><h1 className="text-2xl font-bold">Reportes</h1></div>} />
          <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
        </Route>        </Routes>
      </ToastProvider>
    </Router>
  );
}

export default App;
