import React, { useEffect, useState } from 'react';
import { useAgeDistribution } from '../hooks/useAgeDistribution';
import { useAnimalStats } from '../hooks/useAnimalStats';

import { useProductionChartData } from '../hooks/useProductionChartData';
import { useProductionAverage } from '../hooks/useProductionAverage';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { getAnimales } from '../services/animalService';
import { getResumenProduccion, getMovimientosRecientes, getProximosPartos, getEventosRecientes, getPromedioLeche, getVacasLactancia } from '../api/ganado';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [animales, setAnimales] = useState([]);
  const [rawResumen, setRawResumen] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [proximosPartos, setProximosPartos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [promedioLeche, setPromedioLeche] = useState(0);
  const [vacasLactancia, setVacasLactancia] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const animalesData = await getAnimales().catch(() => []);

      setAnimales(animalesData);

      // Load production summary from aggregate endpoint (single query instead of N+1)
      const year = new Date().getFullYear();
      const [resumen, movs, partos, evts, promedio, lactancia] = await Promise.all([
        getResumenProduccion(year).catch(() => []),
        getMovimientosRecientes().catch(() => []),
        getProximosPartos().catch(() => []),
        getEventosRecientes().catch(() => []),
        getPromedioLeche().catch(() => 0),
        getVacasLactancia().catch(() => 0),
      ]);

      setRawResumen(resumen);
      setMovimientos(movs);
      setProximosPartos(partos);
      setEventos(evts);
      setPromedioLeche(promedio);
      setVacasLactancia(lactancia);
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  // ── KPIs (computed via shared hook) ──
  const { total, enTratamiento, activos } = useAnimalStats(animales);

  // ── Age distribution (computed via shared hook) ──
  const ageDist = useAgeDistribution(animales);

  const distributionData = [
    { name: 'Adultos (>24m)', value: ageDist.adultos, color: '#2d9c2d' },
    { name: 'Novillos (12-24m)', value: ageDist.novillos, color: '#4eba4e' },
    { name: 'Terneros (0-12m)', value: ageDist.terneros, color: '#82d682' },
  ];

  // Remove empty entries so the pie chart doesn't break
  const pieData = distributionData.filter(d => d.value > 0);
  const pieHasData = pieData.length > 0;

  // ── Production chart data (computed via shared hook) ──
  const productionByMonth = useProductionChartData(rawResumen);



  // ── Production avg (computed via shared hook) ──
  const todayProdTotal = useProductionAverage(productionByMonth);

  // ── Movements from API ──
  const hasMovimientos = movimientos.length > 0;
  const hasPartos = proximosPartos.length > 0;
  const hasEventos = eventos.length > 0;
  const hasProductionData = productionByMonth.some(d => d.leche > 0);

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-up">

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Visión General</h1>
          <p className="text-gray-400 mt-1">Resumen del estado actual de la hacienda</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/movimientos/nuevo" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Registrar Movimiento
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Animales */}
        <div className="stat-card animate-fade-up-d1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Animales</p>
              <h3 className="text-3xl font-bold text-gray-100">{total}<span className="text-lg font-normal text-gray-500 ml-1">cabezas</span></h3>
            </div>
            <div className="p-2.5 bg-brand-900/50 rounded-lg border border-brand-800">
              <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4 8-4V7l-8-4-8 4z" /></svg>
            </div>
          </div>
          {total > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                {ageDist.terneros}
              </span>
              <span className="text-gray-500">terneros</span>
            </div>
          )}
        </div>

        {/* Card 2: Producción */}
        <div className="stat-card animate-fade-up-d2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Promedio Leche / Día</p>
              <h3 className="text-3xl font-bold text-gray-100">
                {promedioLeche || '0'}
                <span className="text-lg font-normal text-gray-500 ml-1">L</span>
              </h3>
            </div>
            <div className="p-2.5 bg-blue-900/40 rounded-lg border border-blue-800">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            </div>
          </div>
        </div>

        {/* Card 3: Distribución */}
        <div className="stat-card animate-fade-up-d3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">En Tratamiento</p>
              <h3 className="text-3xl font-bold text-gray-100">{enTratamiento}</h3>
            </div>
            <div className="p-2.5 bg-amber-900/40 rounded-lg border border-amber-800">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
            <span className="text-gray-300">{total > 0 ? `${enTratamiento} de ${total} animales` : 'Sin datos'}</span>
          </div>
        </div>

        {/* Card 4: Lactancia */}
        <div className="stat-card animate-fade-up-d4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">Vacas en Lactancia</p>
              <h3 className="text-3xl font-bold text-gray-100">{vacasLactancia}</h3>
            </div>
            <div className="p-2.5 bg-red-900/30 rounded-lg border border-red-800">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10\"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up-d2">
        {/* Production Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-100">Producción de Leche Mensual</h2>
              <p className="text-sm text-gray-400">
                {hasProductionData ? 'Total en litros (agregado de registros)' : 'Agrega registros de producción para ver el gráfico'}
              </p>
            </div>
            <select className="bg-dark-600 border border-dark-400 rounded-lg px-3 py-1.5 text-sm text-gray-200 outline-none focus:border-brand-500">
              <option>Año {new Date().getFullYear()}</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hasProductionData ? productionByMonth : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeche" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d9c2d" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2d9c2d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3d2e" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#182118', borderColor: '#2e3d2e', borderRadius: '8px', color: '#f3f4f6' }}
                  itemStyle={{ color: '#82d682' }}
                />
                <Area type="monotone" dataKey="leche" name="Producción Real" stroke="#4eba4e" strokeWidth={3} fillOpacity={1} fill="url(#colorLeche)" />
                {hasProductionData && (
                  <Line type="monotone" dataKey="meta" name="Meta Esperada" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution Pie */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-gray-100 mb-6">Distribución por Edad</h2>
          <div className="h-56 w-full relative">
            {pieHasData ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#182118', borderColor: '#2e3d2e', borderRadius: '8px', color: '#f3f4f6' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-gray-100">{total - ageDist.sinDatos}</span>
                  <span className="text-xs text-gray-400">Con edad</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                {total === 0 ? 'Sin animales registrados' : 'Sin fechas de nacimiento'}
              </div>
            )}
          </div>
          {pieHasData && (
            <div className="mt-4 space-y-3">
              {distributionData.filter(d => d.value > 0).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-100">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up-d3">
        {/* Próximos Partos */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-100">Próximos Partos</h2>
          </div>
          {hasPartos ? (
            <div className="space-y-3">
              {proximosPartos.map(p => (
                <div key={p.reproduccionId} className="flex items-start gap-3 p-3 rounded-xl bg-dark-600/50 border border-dark-400">
                  <div className="p-2 rounded-lg shrink-0 bg-purple-900/30 text-purple-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-200 truncate">
                      {p.vacaNombre || p.vacaArete || 'Vaca #' + p.reproduccionId}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.toroNombre ? `Toro: ${p.toroNombre}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        p.diasRestantes <= 7 ? 'bg-red-900/30 text-red-400' :
                        p.diasRestantes <= 30 ? 'bg-amber-900/30 text-amber-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {p.diasRestantes > 0 ? `${p.diasRestantes} días` : '¡Hoy!'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {p.fechaPartoEstimada}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <svg className="w-12 h-12 mb-2 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <p className="text-sm">No hay partos próximos</p>
              <p className="text-xs text-dark-400 mt-1">Registra montas con fecha de parto estimada para verlos aquí.</p>
            </div>
          )}
        </div>

        {/* Movements — real data from API */}
        <div className="glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-dark-400 flex justify-between items-center bg-dark-700/50">
            <h2 className="text-lg font-bold text-gray-100">Últimos Movimientos</h2>
          </div>
          {hasMovimientos ? (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead className="bg-dark-800/80">
                  <tr>
                    <th>Fecha</th>
                    <th>Animal</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {movimientos.map((mov) => (
                    <tr key={mov.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-300">{mov.fecha}</td>
                      <td className="font-medium text-gray-200">
                        {mov.animalNombre || mov.animalArete || '—'}
                      </td>
                      <td className="text-gray-300">{mov.origen || '—'}</td>
                      <td className="text-gray-300">{mov.destino || '—'}</td>
                      <td>
                        <span className={`badge-${
                          mov.tipoMovimiento?.toLowerCase() === 'ingreso' ? 'green' :
                          mov.tipoMovimiento?.toLowerCase() === 'egreso' ? 'red' :
                          'gray'
                        }`}>
                          {mov.tipoMovimiento || 'Traslado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
              <p className="text-sm">No hay movimientos registrados aún.</p>
              <p className="text-xs text-dark-400 mt-1">Registra movimientos de animales entre lotes para verlos aquí.</p>
            </div>
          )}
        </div>
      </div>

      {/* Eventos Recientes — full width row */}
      <div className="grid grid-cols-1 gap-6 animate-fade-up">
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-100">Eventos Recientes</h2>
              <p className="text-sm text-gray-400">
                {hasEventos ? 'Últimos eventos registrados en el sistema' : 'Aún no hay eventos registrados'}
              </p>
            </div>
            <span className="text-xs text-gray-500 bg-dark-600 px-2 py-1 rounded">{eventos.length} eventos</span>
          </div>
          {hasEventos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventos.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 p-4 rounded-xl bg-dark-600/30 border border-dark-400 hover:border-brand-800/50 hover:bg-dark-600/50 transition-all">
                  <div className="p-2 rounded-lg shrink-0 bg-brand-900/30 text-brand-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-gray-200 truncate">
                        {ev.animalNombre || ev.animalArete || 'Animal #' + ev.id}
                      </h4>
                      {ev.tipo && (
                        <span className="text-xs px-2 py-0.5 rounded bg-brand-900/40 text-brand-300 font-medium">
                          {ev.tipo}
                        </span>
                      )}
                    </div>
                    {ev.descripcion && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ev.descripcion}</p>
                    )}
                    <span className="text-xs text-gray-500 mt-2 block">
                      {ev.fecha ? new Date(ev.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <svg className="w-14 h-14 mb-3 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-sm">No hay eventos recientes</p>
              <p className="text-xs text-dark-400 mt-1">Los eventos se registrarán automáticamente al añadir eventos desde la ficha de cada animal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
