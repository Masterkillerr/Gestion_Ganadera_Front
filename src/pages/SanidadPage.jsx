import React, { useEffect, useState } from 'react';
import {
  getVacunas, createVacuna, updateVacuna, deleteVacuna,
  getVacunaciones, getAnimales, getTiposEvento,
  apiVacunaciones,
} from '../api/ganado';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal, InlineFormModal } from '../components/Modal';
import { LoadingSpinner } from '../components/LoadingSpinner';

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

  // New vacuna inline form
  const [nuevaVacuna, setNuevaVacuna] = useState('');
  const [vacunaError, setVacunaError] = useState('');

  // Modal state
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });

  // Vacuna edit state
  const [editingVacuna, setEditingVacuna] = useState(null);
  const [editVacunaNombre, setEditVacunaNombre] = useState('');

  // Vacunacion CRUD state
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

  // ── Vacuna CRUD ──
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
  };

  const handleDeleteVacuna = (id) => {
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

  // ── Vacunacion CRUD ──
  const resetVacunacionForm = () => {
    setVacunacionForm({ animalId: '', vacunaId: '', proximaDosis: '', observacion: '' });
    setEditingVacunacion(null);
    setShowVacunacionForm(false);
    setVacunacionError('');
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

  const handleVacunacionChange = (e) => {
    const { name, value } = e.target;
    setVacunacionForm(prev => ({ ...prev, [name]: value }));
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
        // For update, use the existing evento ID or create a new one
        const payload = {
          eventoId: editingVacunacion.eventoId,
          vacunaId: parseInt(vacunacionForm.vacunaId),
          proximaDosis: vacunacionForm.proximaDosis || null,
          observacion: vacunacionForm.observacion || null,
        };
        await apiVacunaciones.update(editingVacunacion.id, payload);
        toast.success('Vacunación actualizada');
      } else {
        // Create evento first
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

  // ── Filters ──
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

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Sanidad</h1>
          <p className="text-gray-400 text-sm mt-1">Control de vacunas y vacunaciones del hato</p>
        </div>
      </div>

      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setBusqueda(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
            {tab.label}
            <span className="ml-2 text-xs opacity-60">
              {tab.key === 'vacunas' ? vacunas.length : vacunaciones.length}
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card p-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Buscar</label>
          <input type="text" className="input-field" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        {activeTab === 'vacunaciones' && (
          <button onClick={() => setShowVacunacionForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-purple-600/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Nueva Vacunación
          </button>
        )}
      </div>

      {/* ── Vacunas Tab ── */}
      {activeTab === 'vacunas' && (
        <div className="glass-card p-6 space-y-4">
          <form onSubmit={handleCreateVacuna} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Nueva Vacuna</label>
              <input type="text" className="input-field" placeholder="Nombre de la vacuna"
                value={nuevaVacuna} onChange={e => setNuevaVacuna(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir
            </button>
          </form>
          {vacunaError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">{vacunaError}</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="bg-dark-800/50">
                  <th className="text-left">Nombre</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVacunas.map(v => (
                  <tr key={v.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="text-gray-200 font-medium">
                      {editingVacuna === v.id ? (
                        <div className="flex gap-2 items-center">
                          <input type="text" className="input-field py-1 text-sm" value={editVacunaNombre}
                            onChange={e => setEditVacunaNombre(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditVacuna(v.id); if (e.key === 'Escape') setEditingVacuna(null); }}
                            autoFocus />
                          <button onClick={() => handleEditVacuna(v.id)}
                            className="text-xs text-green-400 hover:underline">Guardar</button>
                          <button onClick={() => setEditingVacuna(null)}
                            className="text-xs text-gray-400 hover:underline">Cancelar</button>
                        </div>
                      ) : v.nombre}
                    </td>
                    <td className="text-right space-x-3">
                      <button onClick={() => { setEditingVacuna(v.id); setEditVacunaNombre(v.nombre); }}
                        className="text-sm text-amber-400 hover:underline">Editar</button>
                      <button onClick={() => handleDeleteVacuna(v.id)}
                        className="text-sm text-red-400 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filteredVacunas.length === 0 && (
                  <tr><td colSpan="2" className="text-center py-8 text-gray-500">No hay vacunas registradas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Vacunaciones Tab ── */}
      {activeTab === 'vacunaciones' && (
        <>
          {/* Vacunacion Form Modal */}
          <InlineFormModal
            isOpen={showVacunacionForm}
            onClose={resetVacunacionForm}
            title={editingVacunacion ? 'Editar Vacunación' : 'Nueva Vacunación'}>
            <form onSubmit={handleSaveVacunacion} className="space-y-4">
              {vacunacionError && (
                <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">{vacunacionError}</div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Animal <span className="text-red-400">*</span></label>
                <select name="animalId" value={vacunacionForm.animalId} onChange={handleVacunacionChange}
                  className="input-field" required>
                  <option value="">Seleccione un animal...</option>
                  {animales.map(a => (
                    <option key={a.id} value={a.id}>{a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Vacuna <span className="text-red-400">*</span></label>
                <select name="vacunaId" value={vacunacionForm.vacunaId} onChange={handleVacunacionChange} className="input-field" required>
                  <option value="">Seleccione una vacuna...</option>
                  {vacunas.map(v => (
                    <option key={v.id} value={v.id}>{v.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Próxima Dosis</label>
                <input type="date" name="proximaDosis" value={vacunacionForm.proximaDosis}
                  onChange={handleVacunacionChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Observación</label>
                <textarea name="observacion" value={vacunacionForm.observacion}
                  onChange={handleVacunacionChange} className="input-field min-h-[60px] resize-y"
                  placeholder="Notas adicionales..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
                <button type="button" onClick={resetVacunacionForm}
                  className="px-4 py-2 text-gray-400 hover:text-gray-100 transition-colors">Cancelar</button>
                <button type="submit" disabled={submittingVacunacion}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-purple-600/30 disabled:opacity-50">
                  {submittingVacunacion ? 'Guardando...' : (editingVacunacion ? 'Guardar Cambios' : 'Registrar')}
                </button>
              </div>
            </form>
          </InlineFormModal>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/50">
                    <th className="text-left">Vacuna</th>
                    <th className="text-left">Animal</th>
                    <th className="text-left">Próxima Dosis</th>
                    <th className="text-left">Observación</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVacunaciones.map(v => (
                    <tr key={v.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-200">{v.vacunaNombre || '—'}</td>
                      <td className="text-gray-300">{v.animalArete || v.animalNombre || '—'}</td>
                      <td className="text-gray-300">{v.proximaDosis || '—'}</td>
                      <td className="text-gray-400 text-sm max-w-[200px] truncate">{v.observacion || '—'}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => openEditVacunacion(v)}
                          className="text-sm text-amber-400 hover:underline">Editar</button>
                        <button onClick={() => handleDeleteVacunacion(v.id)}
                          className="text-sm text-red-400 hover:underline">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {filteredVacunaciones.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No hay vacunaciones registradas</td></tr>
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
