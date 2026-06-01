import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getProducciones, apiProduccion, getAnimales } from '../../services/ganadoService';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getTodayLocal } from '../../utils/date';

const TURNO_COLORS = {
  Mañana: '#4eba4e',
  Tarde: '#2d9c2d',
};

const TurnoBadge = ({ turno }) => (
  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
    turno === 'Mañana' ? 'bg-amber-900/30 text-amber-400' :
    turno === 'Tarde' ? 'bg-blue-900/30 text-blue-400' :
    'bg-dark-600 text-gray-400'
  }`}>
    {turno || '—'}
  </span>
);

const ProduccionList = () => {
  const [produccion, setProduccion] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const loadData = async () => {
    try {
      const rawAnimales = await getAnimales().catch(() => ({ content: [] }));
      const aniData = Array.isArray(rawAnimales) ? rawAnimales : (rawAnimales?.content || []);
      const [prodData] = await Promise.all([
        getProducciones().catch(() => []),
      ]);
      setProduccion(prodData);
      setFiltered(prodData);
      setAnimales(aniData);
    } catch (error) {
      const msg = apiError(error, 'Error al cargar producción');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = produccion;
    const q = busqueda.toLowerCase();
    if (q) {
      result = result.filter(p =>
        (p.animalNombre && p.animalNombre.toLowerCase().includes(q)) ||
        (p.animalArete && p.animalArete.toLowerCase().includes(q))
      );
    }
    if (filtroTurno) {
      result = result.filter(p => p.turno === filtroTurno);
    }
    setFiltered(result);
  }, [busqueda, filtroTurno, produccion]);

  const handleDelete = (id) => {
    setDeleteTarget({ id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiProduccion.delete(deleteTarget.id);
      loadData();
    } catch (error) {
      const msg = apiError(error, 'Error al eliminar registro de producción');
      toast.error(msg);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── KPIs ──
  const { totalLitros, totalRecords, avgPorRegistro, todayTotal } = useMemo(() => {
    if (produccion.length === 0) return { totalLitros: 0, totalRecords: 0, avgPorRegistro: 0, todayTotal: 0 };

    const total = produccion.reduce((sum, p) => sum + parseFloat(p.litros || 0), 0);
    const today = getTodayLocal();
    const todaySum = produccion
      .filter(p => p.fecha === today)
      .reduce((sum, p) => sum + parseFloat(p.litros || 0), 0);

    return {
      totalLitros: total,
      totalRecords: produccion.length,
      avgPorRegistro: total / produccion.length,
      todayTotal: todaySum,
    };
  }, [produccion]);

  // ── Daily chart data ──
  const dailyChartData = useMemo(() => {
    const dailyMap = {};
    produccion.forEach(p => {
      if (!p.fecha || !p.litros) return;
      const litros = parseFloat(p.litros);
      if (!dailyMap[p.fecha]) {
        dailyMap[p.fecha] = { fecha: p.fecha, total: 0, Mañana: 0, Tarde: 0 };
      }
      dailyMap[p.fecha].total += litros;
      if (p.turno === 'Mañana') dailyMap[p.fecha].Mañana += litros;
      else if (p.turno === 'Tarde') dailyMap[p.fecha].Tarde += litros;
    });

    return Object.values(dailyMap)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-14); // last 14 days
  }, [produccion]);

  const hasData = produccion.length > 0;
  const hasChartData = dailyChartData.length > 0;

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar registro de producción"
        message="¿Está seguro de eliminar este registro de producción?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Producción de Leche</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registro diario de ordeño por animal
          </p>
        </div>
        <Link to="/dashboard/produccion/nuevo" className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <p className="text-gray-400 text-sm font-medium mb-1">Total Producción</p>
          <h3 className="text-3xl font-bold text-gray-100">
            {totalLitros.toFixed(1)}<span className="text-lg font-normal text-gray-500 ml-1">L</span>
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded font-medium">
              {totalRecords} registros
            </span>
          </div>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm font-medium mb-1">Producción Hoy</p>
          <h3 className="text-3xl font-bold text-gray-100">
            {todayTotal.toFixed(1)}<span className="text-lg font-normal text-gray-500 ml-1">L</span>
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded font-medium ${
              todayTotal > 0 ? 'text-green-400 bg-green-900/30' : 'text-gray-500 bg-dark-600'
            }`}>
              {todayTotal > 0 ? 'Con datos hoy' : 'Sin datos hoy'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm font-medium mb-1">Promedio por Registro</p>
          <h3 className="text-3xl font-bold text-gray-100">
            {avgPorRegistro > 0 ? avgPorRegistro.toFixed(1) : '—'}
            <span className="text-lg font-normal text-gray-500 ml-1">L</span>
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded font-medium">
              {avgPorRegistro > 0 ? 'Rendimiento general' : 'Sin registros'}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <p className="text-gray-400 text-sm font-medium mb-1">Animales en Ordeño</p>
          <h3 className="text-3xl font-bold text-gray-100">
            {new Set(produccion.map(p => p.animalId)).size}
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded font-medium">
              de {animales.filter(a => a.sexo === 'Hembra').length} hembras
            </span>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Producción Diaria (últimos 14 días)</h2>
            <p className="text-sm text-gray-400">
              {hasChartData ? 'Litros por día, desglosado por turno' : 'Agrega registros para ver el gráfico'}
            </p>
          </div>
        </div>
        <div style={{ width: '100%' }}>
          {hasChartData ? (
            <ResponsiveContainer width="100%" aspect={3}>
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3d2e" vertical={false} />
                <XAxis
                  dataKey="fecha"
                  stroke="#6b7280"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => {
                    const d = new Date(val + 'T12:00:00');
                    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                  }}
                />
                <YAxis stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#182118', borderColor: '#2e3d2e', borderRadius: '8px', color: '#f3f4f6' }}
                  itemStyle={{ color: '#82d682' }}
                  labelFormatter={(val) => new Date(val + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}
                  formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                />
                <Bar dataKey="Mañana" name="Turno Mañana" fill="#4eba4e" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="Tarde" name="Turno Tarde" fill="#2d9c2d" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              {produccion.length === 0
                ? 'Aún no hay registros de producción'
                : 'No hay suficientes datos para mostrar el gráfico'}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Buscar por animal</label>
          <input
            type="text"
            className="input-field"
            placeholder="Nombre o arete..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="block text-xs text-gray-400 mb-1">Turno</label>
          <select
            className="input-field"
            value={filtroTurno}
            onChange={(e) => setFiltroTurno(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div className="text-sm text-gray-500 pb-2">
          {filtered.length} de {produccion.length} registros
        </div>
      </div>

      {/* Records Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-dark-800/50">
                <th className="text-left">Fecha</th>
                <th className="text-left">Animal</th>
                <th className="text-right">Litros</th>
                <th className="text-left">Turno</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                  <td className="text-gray-300 whitespace-nowrap">
                    {p.fecha ? new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : '—'}
                  </td>
                  <td className="font-medium text-gray-200">
                    <div className="flex items-center gap-2">
                      <span>{p.animalNombre || p.animalArete || 'Animal #' + p.animalId}</span>
                      {p.animalArete && p.animalNombre && (
                        <span className="text-xs text-gray-500">({p.animalArete})</span>
                      )}
                    </div>
                  </td>
                  <td className="text-right font-semibold text-gray-100">
                    {p.litros ? parseFloat(p.litros).toFixed(1) : '0.0'} L
                  </td>
                  <td>
                    <TurnoBadge turno={p.turno} />
                  </td>
                  <td className="text-right space-x-3">
                    <Link
                      to={`/dashboard/produccion/editar/${p.id}`}
                      className="text-sm text-brand-400 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    {produccion.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-sm">No hay registros de producción aún.</p>
                        <Link to="/dashboard/produccion/nuevo" className="text-sm text-brand-400 hover:underline">
                          Registrar primera producción
                        </Link>
                      </div>
                    ) : (
                      'No se encontraron registros con los filtros aplicados.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProduccionList;
