import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimales, deleteAnimal, getRazas, getLotes } from '../../services/ganadoService';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner, Skeleton } from '../../components/LoadingSpinner';

const GanadoList = () => {
 const [animales, setAnimales] = useState([]);
 const [page, setPage] = useState(0);
 const [totalPages, setTotalPages] = useState(0);
 const [loading, setLoading] = useState(true);
 const [pageReady, setPageReady] = useState(false);
 const [deleteTarget, setDeleteTarget] = useState(null);
 const toast = useToast();
 const [filtros, setFiltros] = useState({ search: '', estado: '', sexo: '' });

 const loadData = async () => {
 try {
 setLoading(true);
 const data = await getAnimales(page, 20, filtros);
 setAnimales(data?.content || []);
 setTotalPages(data?.totalPages || 0);
 setPageReady(true);
 } catch (e) {
 console.error('API Error:', e);
 toast.error('No se pudo cargar el listado de animales');
 setAnimales([]); 
 } finally {
 setLoading(false);
 }
 };

 // Reset to page 0 when filters change
 useEffect(() => { setPage(0); }, [filtros.search, filtros.estado, filtros.sexo]);

 useEffect(() => { loadData(); }, [page, filtros.search, filtros.estado, filtros.sexo]);


 const confirmDelete = async () => {
 if (!deleteTarget) return;
 try {
 await deleteAnimal(deleteTarget.id);
 toast.success('Animal eliminado');
 loadData();
 } catch (err) {
 toast.error('No se pudo eliminar el animal');
 } finally { setDeleteTarget(null); }
 };

 const updateFilter = (patch) => setFiltros(prev => ({ ...prev, ...patch }));

 if (loading) {
 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
 <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
 <div>
 <Skeleton className="h-8 w-56" />
 <Skeleton className="mt-3 h-4 w-72" />
 </div>
 <Skeleton className="h-10 w-44" />
 </div>
 <div className="glass-card space-y-4 p-4">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 <Skeleton className="h-11 w-full" />
 <Skeleton className="h-11 w-full" />
 <Skeleton className="h-11 w-full" />
 </div>
 </div>
 <div className="glass-card overflow-hidden p-4">
 <div className="space-y-3">
 {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
 </div>
 </div>
 </div>
 );
 }

 return (
 <>
 <ConfirmModal
 isOpen={deleteTarget !== null}
 onClose={() => setDeleteTarget(null)}
 onConfirm={confirmDelete}
 title="Eliminar animal"
 message="¿Está seguro de eliminar este animal? Esta acción no se puede deshacer."
 confirmText="Eliminar"
 cancelText="Cancelar"
 variant="danger"
 />

 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
 <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-100">Gestión de Ganado</h1>
 <p className="mt-1 text-sm text-gray-400">Inventario, filtrado y acciones por animal</p>
 </div>
 <Link to="/dashboard/ganado/nuevo" className="btn-primary w-full md:w-auto justify-center">
 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
 Nuevo Animal
 </Link>
 </div>

 <div className="glass-card p-4">
 <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
 <div>
 <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Buscar</label>
 <input
 type="search"
 className="input-field"
 placeholder="Buscar por arete o nombre..."                    value={filtros.search}
                    onChange={(e) => updateFilter({ search: e.target.value })}
                  />
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</label>
 <select className="input-field" value={filtros.estado} onChange={(e) => updateFilter({ estado: e.target.value })}>
 <option value="">Todos</option>
 <option value="Sano">Sano</option>
 <option value="En Tratamiento">En Tratamiento</option>
 <option value="Gestante">Gestante</option>
 <option value="Lactancia">Lactancia</option>
 <option value="Seca">Seca</option>
 <option value="Vendido/Baja">Vendido/Baja</option>
 </select>
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Sexo</label>
 <select className="input-field" value={filtros.sexo} onChange={(e) => updateFilter({ sexo: e.target.value })}>
 <option value="">Todos</option>
 <option value="Macho">Macho</option>
 <option value="Hembra">Hembra</option>
 </select>
 </div>
 </div>
 </div>

 <div className="glass-card overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full min-w-[640px] data-table">
 <thead>
 <tr className="bg-dark-800/60">
 <th className="text-left">Arete / ID</th>
 <th className="text-left">Nombre</th>
 <th className="text-left">Sexo</th>
 <th className="text-left">Raza</th>
 <th className="text-left">Estado</th>
 <th className="text-right">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {animales.map(animal => (
 <tr key={animal.id} className="transition-colors hover:bg-dark-600/50">
 <td>
 <div className="font-medium text-brand-300">{animal.identificadorArete || `ID:${animal.id}`}</div>
 </td>
 <td className="text-gray-300">{animal.nombre || '-'}</td>
 <td>
 {animal.sexo === 'Hembra' ? (
   <span className="badge-pink flex items-center gap-1">
     <span className="text-lg">♀</span> Hembra
   </span>
 ) : animal.sexo === 'Macho' ? (
   <span className="badge-blue flex items-center gap-1">
     <span className="text-lg">♂</span> Macho
   </span>
 ) : '-'}
 </td>
 <td className="text-gray-300">{animal.razaNombre || '-'}</td>
 <td>
 {animal.estadoAnimal === 'Sano' ? <span className="badge-green">{animal.estadoAnimal}</span> : <span className="badge-gray">{animal.estadoAnimal || 'N/A'}</span>}
 </td>
 <td className="space-x-3 text-right">
 <Link to={`/dashboard/ganado/${animal.id}`} className="text-sm text-brand-400 hover:text-brand-300">Ver Ficha</Link>
 <Link to={`/dashboard/ganado/editar/${animal.id}`} className="text-sm text-blue-400 hover:text-blue-300">Editar</Link>
 <button onClick={() => setDeleteTarget({ id: animal.id })} className="text-sm text-red-400 hover:text-red-300">Eliminar</button>
 </td>
 </tr>
 ))}
 {animales.length === 0 && (
 <tr>
 <td colSpan="6" className="py-10 text-center text-gray-500">
 {pageReady ? 'No se encontraron animales.' : 'Cargando listado...'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>      <div className="flex justify-between items-center mt-4 gap-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="btn-secondary"
        >
          Anterior
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Página</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={page + 1}
            onChange={(e) => {
              const p = parseInt(e.target.value);
              if (p >= 1 && p <= totalPages) setPage(p - 1);
            }}
            className="input-field w-16 text-center py-1.5"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const p = parseInt(e.target.value);
                if (p >= 1 && p <= totalPages) setPage(p - 1);
              }
            }}
          />
          <span>de {totalPages}</span>
        </div>

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
          className="btn-secondary"
        >
          Siguiente
        </button>
      </div>
 </div>
 </>
 );
};

export default GanadoList;
