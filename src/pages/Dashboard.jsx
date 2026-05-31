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
import { getResumenProduccion, getMovimientosRecientes, getProximosPartos, getEventosRecientes, getPromedioLeche, getVacasLactancia } from '../services/ganadoService';
import { LoadingSpinner, Skeleton } from '../components/LoadingSpinner';

export default function Dashboard() {
 const [loading, setLoading] = useState(true);
 const [dataLoaded, setDataLoaded] = useState(false);
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
 setDataLoaded(true);
 } catch (err) {
 console.error('Error loading dashboard', err);
 } finally {
 setLoading(false);
 }
 };

 const { total, enTratamiento, activos } = useAnimalStats(animales);
 const ageDist = useAgeDistribution(animales);

 const distributionData = [
 { name: 'Adultos (>24m)', value: ageDist.adultos, color: '#059669' },
 { name: 'Novillos (12-24m)', value: ageDist.novillos, color: '#34d399' },
 { name: 'Terneros (0-12m)', value: ageDist.terneros, color: '#6ee7b7' },
 ];

 const pieData = distributionData.filter(d => d.value > 0);
 const pieHasData = pieData.length > 0;
 const productionByMonth = useProductionChartData(rawResumen);
 const todayProdTotal = useProductionAverage(productionByMonth);

 const hasMovimientos = movimientos.length > 0;
 const hasPartos = proximosPartos.length > 0;
 const hasEventos = eventos.length > 0;
 const hasProductionData = productionByMonth.some(d => d.leche > 0);

 const renderKPISkeleton = () => (
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
 {Array.from({ length: 4 }).map((_, i) => (
 <div key={i} className="stat-card">
 <Skeleton className="h-4 w-24" />
 <Skeleton className="mt-3 h-8 w-32" />
 </div>
 ))}
 </div>
 );

 const renderSectionSkeleton = (count = 1) => (
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 {Array.from({ length: count }).map((_, i) => (
 <div key={i} className="glass-card overflow-hidden">
 <div className="border-b border-dark-400 px-6 py-4">
 <Skeleton className="h-4 w-40" />
 </div>
 <div className="space-y-3 p-4">
 {Array.from({ length: 3 }).map((_, k) => (
 <Skeleton key={k} className="h-14 w-full" />
 ))}
 </div>
 </div>
 ))}
 </div>
 );

 if (loading) {
 return (
 <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
 <div className="flex items-end justify-between gap-4">
 <div>
 <Skeleton className="h-8 w-48" />
 <Skeleton className="mt-3 h-4 w-72" />
 </div>
 <Skeleton className="h-9 w-48" />
 </div>
 {renderKPISkeleton()}
 {renderSectionSkeleton(2)}
 <Skeleton className="h-64 w-full" />
 </div>
 );
 }

 return (
 <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto animate-fade-up">
 <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
 <div>
 <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Visión General</h1>
 <p className="mt-1 text-sm text-gray-400">Resumen del estado actual de la hacienda</p>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs text-gray-500">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
 <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
 <span className="text-xs text-gray-400">Actualizado</span>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
 <div className="stat-card animate-fade-up-d1">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Animales</p>
 <h3 className="mt-1 text-3xl font-bold text-gray-100">{total}<span className="ml-1 text-base font-normal text-gray-500">cabezas</span></h3>
 </div>
 <div className="rounded-lg border border-brand-800 bg-brand-900/50 p-2.5">
 <svg className="h-6 w-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10l8 4 8-4V7l-8-4-8 4z" />
 </svg>
 </div>
 </div>
 {total > 0 && (
 <div className="mt-4 flex items-center gap-2 text-sm">
 <span className="inline-flex items-center gap-1 rounded-md bg-brand-900/60 px-2 py-1 text-brand-300">
 <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
 {ageDist.terneros}
 </span>
 <span className="text-gray-500">terneros</span>
 </div>
 )}
 </div>

 <div className="stat-card animate-fade-up-d2">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Promedio Leche / Día</p>
 <h3 className="mt-1 text-3xl font-bold text-gray-100">{promedioLeche || '0'}<span className="ml-1 text-base font-normal text-gray-500">L</span></h3>
 </div>
 <div className="rounded-lg border border-blue-800 bg-blue-900/40 p-2.5">
 <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
 </svg>
 </div>
 </div>
 </div>

 <div className="stat-card animate-fade-up-d3">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">En Tratamiento</p>
 <h3 className="mt-1 text-3xl font-bold text-gray-100">{enTratamiento}</h3>
 </div>
 <div className="rounded-lg border border-amber-800 bg-amber-900/40 p-2.5">
 <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </div>
 </div>
 <p className="mt-4 text-sm text-gray-300">{total > 0 ? `${enTratamiento} de ${total} animales` : 'Sin datos'}</p>
 </div>

 <div className="stat-card animate-fade-up-d4">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vacas en Lactancia</p>
 <h3 className="mt-1 text-3xl font-bold text-gray-100">{vacasLactancia}</h3>
 </div>
 <div className="rounded-lg border border-red-800 bg-red-900/30 p-2.5">
 <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
 </svg>
 </div>
 </div>
 </div>
 </div>

 {/* Main Charts */}
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <div className="glass-card p-6 lg:col-span-2">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-base font-bold text-gray-100">Producción de Leche Mensual</h2>
 <p className="mt-1 text-sm text-gray-400">{hasProductionData ? 'Total en litros (agregado de registros)' : 'Agrega registros de producción para ver el gráfico'}</p>
 </div>
 <select className="input-field w-auto" aria-label="Año de producción">
 <option>{new Date().getFullYear()}</option>
 </select>
 </div>             <div className="mt-4" style={{ width: '100%' }}>
             <ResponsiveContainer width="100%" aspect={3}>
             <AreaChart data={hasProductionData ? productionByMonth : []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorLeche" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#059669" stopOpacity={0.35}/>
 <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorMeta" x1="0" y1="0" x2="1" y2="0">
 <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15}/>
 <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="rgba(54,59,72,0.35)" vertical={false} />
 <XAxis dataKey="name" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
 <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
 <RechartsTooltip
 contentStyle={{ backgroundColor: '#13161b', borderColor: 'rgba(54,59,72,0.5)', borderRadius: '12px', color: '#f3f4f6', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
 itemStyle={{ color: '#34d399' }}
 cursor={{ stroke: 'rgba(5,150,105,0.35)', strokeWidth: 1 }}
 />
 <Area type="monotone" dataKey="leche" name="Producción Real" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeche)" />
 {hasProductionData && (
 <Line type="monotone" dataKey="meta" name="Meta Esperada" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={false} connectNulls />
 )}
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="glass-card p-6">
 <h2 className="text-base font-bold text-gray-100">Distribución por Edad</h2>
 <p className="mt-1 text-sm text-gray-400">Clasificación de animales por rango etario</p>             <div className="mt-4" style={{ width: '100%', position: 'relative' }}>
             {pieHasData ? (
             <>
             <ResponsiveContainer width="100%" aspect={1}>
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
 contentStyle={{ backgroundColor: '#13161b', borderColor: 'rgba(54,59,72,0.5)', borderRadius: '12px', color: '#f3f4f6', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
 itemStyle={{ color: '#fff' }}
 />
 </PieChart>
 </ResponsiveContainer>
 <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-3xl font-bold text-gray-100">{total - ageDist.sinDatos}</span>
 <span className="text-xs text-gray-400">Con edad</span>
 </div>
 </>
 ) : (
 <div className="flex h-full flex-col items-center justify-center text-gray-500 text-sm">
 {total === 0 ? 'Sin animales registrados' : 'Sin fechas de nacimiento'}
 </div>
 )}
 </div>
 {pieHasData && (
 <div className="mt-5 space-y-3">
 {distributionData.filter(d => d.value > 0).map((item, idx) => (
 <div key={idx} className="flex items-center justify-between text-sm">
 <div className="flex items-center gap-2">
 <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
 <span className="text-gray-300">{item.name}</span>
 </div>
 <span className="font-medium text-gray-100">{item.value}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Bottom panels */}
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
 <section className="glass-card flex flex-col overflow-hidden" aria-labelledby="proximos-partos-title">
 <div className="flex items-center justify-between border-b border-dark-400 px-6 py-4">
 <div>
 <h2 id="proximos-partos-title" className="text-base font-bold text-gray-100">Próximos Partos</h2>
 <p className="text-sm text-gray-400">Seguimiento reproductivo</p>
 </div>
 </div>
 {hasPartos ? (
 <div className="space-y-3 p-4">
 {proximosPartos.map(p => (
 <div key={p.reproduccionId} className="flex items-start gap-3 rounded-xl border border-dark-400 bg-dark-600/40 p-3">
 <div className="rounded-lg border border-purple-800 bg-purple-900/30 p-2 text-purple-400">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="truncate text-sm font-semibold text-gray-200">{p.vacaNombre || p.vacaArete || 'Vaca #' + p.reproduccionId}</h4>
 {p.toroNombre && <p className="mt-0.5 text-xs text-gray-400">Toro: {p.toroNombre}</p>}
 <div className="mt-2 flex items-center gap-2">
 <span className={`text-xs rounded-md px-2 py-0.5 font-medium ${p.diasRestantes <= 7 ? 'bg-red-900/40 text-red-400' : p.diasRestantes <= 30 ? 'bg-amber-900/40 text-amber-400' : 'bg-green-900/40 text-green-400'}`}>
 {p.diasRestantes > 0 ? `${p.diasRestantes} días` : '¡Hoy!'}
 </span>
 <span className="text-xs text-gray-500">{p.fechaPartoEstimada}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-10 text-gray-500">
 <svg className="mb-2 h-12 w-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
 </svg>
 <p className="text-sm">No hay partos próximos</p>
 <p className="mt-1 text-xs text-dark-400">Registra montas con fecha de parto estimada para verlos aquí.</p>
 </div>
 )}
 </section>

 <section className="glass-card flex flex-col overflow-hidden" aria-labelledby="movimientos-title">
 <div className="flex items-center justify-between border-b border-dark-400 px-6 py-4">
 <div>
 <h2 id="movimientos-title" className="text-base font-bold text-gray-100">Últimos Movimientos</h2>
 <p className="text-sm text-gray-400">Traslados recientes</p>
 </div>
 </div>
 {hasMovimientos ? (
 <div className="overflow-x-auto">
 <div className="inline-block min-w-full px-4">
 <table className="w-full min-w-[520px] data-table">
 <thead>
 <tr className="bg-dark-800/60">
 <th className="text-left">Fecha</th>
 <th className="text-left">Animal</th>
 <th className="text-left">Origen</th>
 <th className="text-left">Destino</th>
 <th className="text-left">Tipo</th>
 </tr>
 </thead>
 <tbody>
 {movimientos.map(mov => (
 <tr key={mov.id} className="transition-colors hover:bg-dark-600/50">
 <td className="text-gray-300">{mov.fecha}</td>
 <td className="font-medium text-gray-200">{mov.animalNombre || mov.animalArete || '—'}</td>
 <td className="text-gray-300">{mov.origen || '—'}</td>
 <td className="text-gray-300">{mov.destino || '—'}</td>
 <td>
 <span className={`badge-${mov.tipoMovimiento?.toLowerCase() === 'ingreso' ? 'green' : mov.tipoMovimiento?.toLowerCase() === 'egreso' ? 'red' : 'gray'}`}>
 {mov.tipoMovimiento || 'Traslado'}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-10 text-gray-500">
 <svg className="mb-3 h-12 w-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
 </svg>
 <p className="text-sm">No hay movimientos registrados aún.</p>
 <p className="mt-1 text-xs text-dark-400">Registra movimientos de animales entre lotes para verlos aquí.</p>
 </div>
 )}
 </section>
 </div>

 {/* Eventos */}
 <section className="glass-card" aria-labelledby="eventos-title">
 <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-dark-400 px-6 py-4">
 <div>
 <h2 id="eventos-title" className="text-base font-bold text-gray-100">Eventos Recientes</h2>
 <p className="text-sm text-gray-400">{hasEventos ? 'Últimos eventos registrados en el sistema' : 'Aún no hay eventos registrados'}</p>
 </div>
 <span className="text-xs text-gray-500 bg-dark-600 px-2 py-1 rounded-md">{eventos.length} eventos</span>
 </div>
 {hasEventos ? (
 <div className="p-4">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
 {eventos.map(ev => (
 <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-dark-400 bg-dark-600/30 p-4 transition-all hover:border-brand-800/50 hover:bg-dark-600/50">
 <div className="rounded-lg border border-brand-800 bg-brand-900/30 p-2 text-brand-400">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <h4 className="truncate text-sm font-semibold text-gray-200">{ev.animalNombre || ev.animalArete || 'Animal #' + ev.id}</h4>
 {ev.tipo && (
 <span className="rounded-md border border-brand-700 bg-brand-900/40 px-2 py-0.5 text-xs font-medium text-brand-300">{ev.tipo}</span>
 )}
 </div>
 {ev.descripcion && <p className="mt-1 line-clamp-2 text-xs text-gray-400">{ev.descripcion}</p>}
 <span className="mt-2 block text-xs text-gray-500">
 {ev.fecha ? new Date(ev.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-10 text-gray-500">
 <svg className="mb-3 h-14 w-14 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <p className="text-sm">No hay eventos recientes</p>
 <p className="mt-1 text-xs text-dark-400">Los eventos se registrarán automáticamente al añadir eventos desde la ficha de cada animal.</p>
 </div>
 )}
 </section>
 </div>
 );
}
