import React, { useEffect, useState } from 'react';
import {
 getVacunas, createVacuna, updateVacuna, deleteVacuna,
 getVacunaciones, getAnimales, getTiposEvento,
 apiVacunaciones,
} from '../services/ganadoService';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal, InlineFormModal } from '../components/Modal';
import { LoadingSpinner, Skeleton } from '../components/LoadingSpinner';

const TABS = [
 { key: 'vacunas', label: 'Vacunas (Catálogo)' },
 { key: 'vacunaciones', label: 'Vacunaciones' },
];

export default function SanidadPage() {
 const [activeTab, setActiveTab] = useState('vacunas');
 const [vacunas, setVacunas] = useState([]);
 const [vacunaciones, setVacunaciones] = useState([]);
 const [loading, setLoading] = useState(true);
 const [busqueda, setBusqueda] = useState('');
 const toast = useToast();

 const [nuevaVacuna, setNuevaVacuna] = useState('');
 const [vacunaError, setVacunaError] = useState('');

 const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });

 const [editingVacuna, setEditingVacuna] = useState(null);
 const [editVacunaNombre, setEditVacunaNombre] = useState('');

 const [showVacunacionForm, setShowVacunacionForm] = useState(false);
 const [editingVacunacion, setEditingVacunacion] = useState(null);
 const [vacunacionForm, setVacunacionForm] = useState({
 animalId: '', vacunaId: '', proximaDosis: '', observacion: '',
 });
 const [vacunacionError, setVacunacionError] = useState('');
 const [animales, setAnimales] = useState([]);
 const [tiposEvento, setTiposEvento] = useState([]);
 const [submittingVacunacion, setSubmittingVacunacion] = useState(false);

 const loadData = async () => {
 setLoading(true);
 try {
 const [v, vacs, ani, te] = await Promise.all([
 getVacunas().catch(() => []),
 getVacunaciones().catch(() => []),
 getAnimales().catch(() => []),
 getTiposEvento().catch(() => []),
 ]);
 setVacunas(v);
 setVacunaciones(vacs);
 setAnimales(ani);
 setTiposEvento(te);
 } catch (error) {
 console.error('Error cargando datos de sanidad', error);
 toast.error('Error al cargar datos de sanidad');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { loadData(); }, []);

 const resetVacunacionForm = () => {
 setVacunacionForm({ animalId: '', vacunaId: '', proximaDosis: '', observacion: '' });
 setEditingVacunacion(null);
 setShowVacunacionForm(false);
 setVacunacionError('');
 };

 const handleCreateVacuna = async (e) => {
 e.preventDefault();
 if (!nuevaVacuna.trim()) return;
 try {
 await createVacuna({ nombre: nuevaVacuna.trim() });
 setNuevaVacuna('');
 setVacunaError('');
 toast.success('Vacuna creada');
 loadData();
 } catch (error) {
 setVacunaError('Error al crear vacuna');
 }
 };

 const handleEditVacuna = async (id) => {
 if (!editVacunaNombre.trim()) return;
 try {
 await updateVacuna(id, { nombre: editVacunaNombre.trim() });
 setEditingVacuna(null);
 setEditVacunaNombre('');
 toast.success('Vacuna actualizada');
 loadData();
 } catch (error) {
 toast.error('Error al actualizar vacuna');
 }
 };  const handleDeleteVacuna = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Eliminar esta vacuna del catálogo?',
      onConfirm: async () => {
        try {
          await deleteVacuna(id);
          toast.success('Vacuna eliminada');
          loadData();
        } catch (error) {
          toast.error('Error al eliminar vacuna');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  const handleDeleteVacunacion = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Eliminar esta vacunación?',
      onConfirm: async () => {
        try {
          await apiVacunaciones.delete(id);
          toast.success('Vacunación eliminada');
          loadData();
        } catch (error) {
          toast.error('Error al eliminar vacunación');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

 const openEditVacunacion = (v) => {
 setVacunacionForm({
 animalId: v.animalId?.toString() || '',
 vacunaId: v.vacunaId?.toString() || '',
 proximaDosis: v.proximaDosis || '',
 observacion: v.observacion || '',
 });
 setEditingVacunacion(v);
 setShowVacunacionForm(true);
 };

 const handleSaveVacunacion = async (e) => {
 e.preventDefault();
 if (!vacunacionForm.animalId || !vacunacionForm.vacunaId) {
 setVacunacionError('Seleccione animal y vacuna');
 return;
 }
 setSubmittingVacunacion(true);
 try {
 if (editingVacunacion) {
 const payload = {
 eventoId: editingVacunacion.eventoId,
 vacunaId: parseInt(vacunacionForm.vacunaId),
 proximaDosis: vacunacionForm.proximaDosis || null,
 observacion: vacunacionForm.observacion || null,
 };
 await apiVacunaciones.update(editingVacunacion.id, payload);
 toast.success('Vacunación actualizada');
 } else {
 const tipoVacuna = tiposEvento.find(te =>
 te.nombre?.toLowerCase().includes('vacuna') || te.nombre?.toLowerCase().includes('vacunacion')
 );
 const eventoRes = await api.post('/api/evento', {
 animalId: parseInt(vacunacionForm.animalId),
 tipoEventoId: tipoVacuna?.id || 1,
 descripcion: 'Vacunación',
 });
 const payload = {
 eventoId: eventoRes.data.id,
 vacunaId: parseInt(vacunacionForm.vacunaId),
 proximaDosis: vacunacionForm.proximaDosis || null,
 observacion: vacunacionForm.observacion || null,
 };
 await api.post('/api/vacunacion', payload);
 toast.success('Vacunación registrada');
 }
 resetVacunacionForm();
 loadData();
 } catch (error) {
 const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
 setVacunacionError(msg);
 } finally {
 setSubmittingVacunacion(false);
 }
 };

 const filteredVacunas = vacunas.filter(v =>
 !busqueda || v.nombre?.toLowerCase().includes(busqueda.toLowerCase())
 );

 const filteredVacunaciones = [...vacunaciones]
 .sort((a, b) => {
 const fechaA = a.fecha || a.proximaDosis || 0;
 const fechaB = b.fecha || b.proximaDosis || 0;
 return new Date(fechaB) - new Date(fechaA);
 })
 .filter(v => {
 if (!busqueda) return true;
 const q = busqueda.toLowerCase();
 return (
 (v.vacunaNombre && v.vacunaNombre.toLowerCase().includes(q)) ||
 (v.animalArete?.toLowerCase().includes(q)) ||
 (v.observacion && v.observacion.toLowerCase().includes(q))
 );
 });

 const renderSkeleton = (rows = 6) => (
 <div className="glass-card overflow-hidden p-4">
 <div className="space-y-3">
 {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
 </div>
 </div>
 );

 if (loading) {
 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
 <div>
 <Skeleton className="h-8 w-40" />
 <Skeleton className="mt-3 h-4 w-72" />
 </div>
 <Skeleton className="h-10 w-full max-w-md" />
 <Skeleton className="h-24 w-full" />
 {renderSkeleton()}
 </div>
 );
 }

 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-gray-100">Sanidad</h1>
 <p className="mt-1 text-sm text-gray-400">Control de vacunas y vacunaciones del hato</p>
 </div>

 <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
 {TABS.map(tab => (
 <button key={tab.key}
 onClick={() => { setActiveTab(tab.key); setBusqueda(''); }}
 className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
 {tab.label}
 <span className="ml-2 text-xs opacity-70">
 {tab.key === 'vacunas' ? vacunas.length : vacunaciones.length}
 </span>
 </button>
 ))}
 </div>

 <div className="glass-card p-4">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
 <div className="flex-1">
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Buscar</label>
 <input type="search" className="input-field" placeholder="Buscar por nombre, arete u observación..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
 </div>
 {activeTab === 'vacunaciones' && (
 <button onClick={() => { resetVacunacionForm(); setShowVacunacionForm(true); }}
 className="btn-primary w-full sm:w-auto justify-center">
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
 </svg>
 Nueva Vacunación
 </button>
 )}
 </div>
 </div>

 {activeTab === 'vacunas' && (
 <div className="glass-card p-6">
 <form onSubmit={handleCreateVacuna} className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="flex-1">
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Nueva Vacuna</label>
 <input type="text" className="input-field" placeholder="Nombre de la vacuna" value={nuevaVacuna} onChange={e => setNuevaVacuna(e.target.value)} required />
 </div>
 <button type="submit" className="btn-primary w-full sm:w-auto justify-center">Añadir</button>
 </form>
 {vacunaError && <p role="alert" className="mt-2 text-sm text-red-400">{vacunaError}</p>}
 <div className="mt-6 overflow-x-auto">
 <table className="w-full min-w-[520px] data-table">
 <thead>
 <tr className="bg-dark-800/60">
 <th className="text-left">Nombre</th>
 <th className="text-right">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {filteredVacunas.map(v => (
 <tr key={v.id} className="transition-colors hover:bg-dark-600/50">
 <td className="text-gray-200">
 {editingVacuna === v.id ? (
 <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
 <input type="text" className="input-field py-1.5 text-sm" value={editVacunaNombre} onChange={e => setEditVacunaNombre(e.target.value)}
 onKeyDown={e => { if (e.key === 'Enter') handleEditVacuna(v.id); if (e.key === 'Escape') setEditingVacuna(null); }} autoFocus />
 <div className="flex gap-2">
 <button type="button" onClick={() => handleEditVacuna(v.id)} className="text-sm text-green-400 hover:text-green-300">Guardar</button>
 <button type="button" onClick={() => setEditingVacuna(null)} className="text-sm text-gray-400 hover:text-gray-200">Cancelar</button>
 </div>
 </div>
 ) : v.nombre}
 </td>
 <td className="space-x-3 text-right">
 <button type="button" onClick={() => { setEditingVacuna(v.id); setEditVacunaNombre(v.nombre); }} className="text-sm text-amber-400 hover:text-amber-300">Editar</button>
 <button type="button" onClick={() => handleDeleteVacuna(v.id)} className="text-sm text-red-400 hover:text-red-300">Eliminar</button>
 </td>
 </tr>
 ))}
 {filteredVacunas.length === 0 && (
 <tr><td colSpan="2" className="py-10 text-center text-gray-500">No hay vacunas registradas</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {activeTab === 'vacunaciones' && (
 <>
 <InlineFormModal isOpen={showVacunacionForm} onClose={resetVacunacionForm} title={editingVacunacion ? 'Editar Vacunación' : 'Nueva Vacunación'}>
 <form onSubmit={handleSaveVacunacion} className="space-y-4">
 {vacunacionError && <p role="alert" className="text-sm text-red-400">{vacunacionError}</p>}
 <div>
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Animal <span className="text-red-400">*</span></label>
 <select name="animalId" value={vacunacionForm.animalId} onChange={e => setVacunacionForm(prev => ({ ...prev, animalId: e.target.value }))} className="input-field" required>
 <option value="">Seleccione un animal...</option>
 {animales.map(a => <option key={a.id} value={a.id}>{a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}</option>)}
 </select>
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Vacuna <span className="text-red-400">*</span></label>
 <select name="vacunaId" value={vacunacionForm.vacunaId} onChange={e => setVacunacionForm(prev => ({ ...prev, vacunaId: e.target.value }))} className="input-field" required>
 <option value="">Seleccione una vacuna...</option>
 {vacunas.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
 </select>
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Próxima Dosis</label>
 <input type="date" name="proximaDosis" value={vacunacionForm.proximaDosis} onChange={e => setVacunacionForm(prev => ({ ...prev, proximaDosis: e.target.value }))} className="input-field" />
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Observación</label>
 <textarea name="observacion" value={vacunacionForm.observacion} onChange={e => setVacunacionForm(prev => ({ ...prev, observacion: e.target.value }))} className="input-field min-h-[72px] resize-y" placeholder="Notas adicionales..." />
 </div>
 <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 pt-4 border-t border-dark-400">
 <button type="button" onClick={resetVacunacionForm} className="btn-secondary w-full sm:w-auto justify-center">Cancelar</button>
 <button type="submit" disabled={submittingVacunacion} className="btn-primary w-full sm:w-auto justify-center">
 {submittingVacunacion ? 'Guardando...' : (editingVacunacion ? 'Guardar Cambios' : 'Registrar')}
 </button>
 </div>
 </form>
 </InlineFormModal>

 <div className="glass-card overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full min-w-[640px] data-table">
 <thead>
 <tr className="bg-dark-800/60">
 <th className="text-left">Vacuna</th>
 <th className="text-left">Animal</th>
 <th className="text-left">Próxima Dosis</th>
 <th className="text-left">Observación</th>
 <th className="text-right">Acciones</th>
 </tr>
 </thead>
 <tbody>
 {filteredVacunaciones.map(v => (
 <tr key={v.id} className="transition-colors hover:bg-dark-600/50">
 <td className="text-gray-200">{v.vacunaNombre || '—'}</td>
 <td className="text-gray-300">{v.animalArete || v.animalNombre || '—'}</td>
 <td className="text-gray-300">{v.proximaDosis || '—'}</td>
 <td className="max-w-[220px] truncate text-sm text-gray-400">{v.observacion || '—'}</td>
 <td className="space-x-3 text-right">
 <button type="button" onClick={() => openEditVacunacion(v)} className="text-sm text-amber-400 hover:text-amber-300">Editar</button>
 <button type="button" onClick={() => handleDeleteVacunacion(v.id)} className="text-sm text-red-400 hover:text-red-300">Eliminar</button>
 </td>
 </tr>
 ))}
 {filteredVacunaciones.length === 0 && (
 <tr><td colSpan="5" className="py-10 text-center text-gray-500">No hay vacunaciones registradas</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </>
 )}

 <ConfirmModal
 isOpen={confirm.isOpen}
 onClose={() => setConfirm({ isOpen: false, onConfirm: null, message: '' })}
 onConfirm={confirm.onConfirm}
 title="Confirmar acción"
 message={confirm.message}
 confirmText="Eliminar"
 variant="danger"
 />
 </div>
 );
}
