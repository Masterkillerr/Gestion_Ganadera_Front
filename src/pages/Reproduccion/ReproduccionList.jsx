import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getReproducciones, deleteReproduccion,
  getPartos, deleteParto, updateParto,
  getTiposEvento,
} from '../../services/ganadoService';
import api from '../../services/api';
import { ErrorModal, ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const TABS = [
  { key: 'reproducciones', label: 'Registros Reproductivos' },
  { key: 'partos', label: 'Partos' },
];

function PartoFormModal({ isOpen, onClose, onSubmit, formData, onChange, error, submitting, title, parto }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fade-up"
      role="dialog" aria-modal="true" aria-label={title}>
      <div className="glass-card p-6 w-full max-w-md mx-4 space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha Parto <span className="text-red-400">*</span></label>
            <input type="date" name="fechaParto" value={formData.fechaParto} onChange={onChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cant. Crías</label>
            <input type="number" name="cantidadCrias" value={formData.cantidadCrias} onChange={onChange}
              className="input-field" min="1" max="5" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Observación</label>
            <textarea name="observacion" value={formData.observacion} onChange={onChange}
              className="input-field min-h-[60px] resize-y" placeholder="Detalles del parto..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50">
              {submitting ? 'Guardando...' : (parto ? 'Guardar Cambios' : 'Registrar Parto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReproduccionList() {
  const [activeTab, setActiveTab] = useState('reproducciones');
  const [reproducciones, setReproducciones] = useState([]);
  const [partos, setPartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const toast = useToast();

  // Error modal
  const [errorModal, setErrorModal] = useState({ isOpen: false, error: '' });

  // Confirm modal
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });

  // Parto form modal
  const [partoFormOpen, setPartoFormOpen] = useState(false);
  const [editingParto, setEditingParto] = useState(null);
  const [partoForm, setPartoForm] = useState({ fechaParto: '', cantidadCrias: 1, observacion: '' });
  const [partoError, setPartoError] = useState('');
  const [submittingParto, setSubmittingParto] = useState(false);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [reproduccionPartoRef, setReproduccionPartoRef] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p, te] = await Promise.all([
        getReproducciones().catch(() => { console.warn('[ReproduccionList] Error cargando reproducciones'); return []; }),
        getPartos().catch(() => { console.warn('[ReproduccionList] Error cargando partos'); return []; }),
        getTiposEvento().catch(() => { console.warn('[ReproduccionList] Error cargando tipos evento'); return []; }),
      ]);
      setReproducciones(r);
      setPartos(p);
      setTiposEvento(te);
    } catch (error) {
      const msg = apiError(error, 'Error al cargar datos de reproducción');
      console.error(msg, error);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showError = (msg) => {
    setErrorModal({ isOpen: true, error: msg });
  };

  // ── Reproduccion Delete ──
  const handleDeleteReproduccion = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Está seguro de eliminar este registro reproductivo?',
      onConfirm: async () => {
        try {
          await deleteReproduccion(id);
          toast.success('Registro eliminado');
          loadData();
        } catch (error) {
          const msg = apiError(error, 'Error al eliminar registro reproductivo');
          showError(msg);
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  // ── Parto CRUD ──
  const resetPartoForm = () => {
    setPartoForm({ fechaParto: '', cantidadCrias: 1, observacion: '' });
    setEditingParto(null);
    setPartoFormOpen(false);
    setPartoError('');
    setReproduccionPartoRef(null);
  };

  const openAddParto = (reproduccionId) => {
    setPartoForm({ fechaParto: '', cantidadCrias: 1, observacion: '' });
    setEditingParto(null);
    setReproduccionPartoRef(reproduccionId);
    setPartoFormOpen(true);
  };

  const openEditParto = (parto) => {
    setPartoForm({
      fechaParto: parto.fechaParto || '',
      cantidadCrias: parto.cantidadCrias ?? 1,
      observacion: parto.observacion || '',
    });
    setEditingParto(parto);
    setReproduccionPartoRef(parto.reproduccionId);
    setPartoFormOpen(true);
  };

  const handlePartoChange = (e) => {
    const { name, value } = e.target;
    setPartoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveParto = async (e) => {
    e.preventDefault();
    if (!partoForm.fechaParto) {
      setPartoError('La fecha de parto es obligatoria');
      return;
    }
    setSubmittingParto(true);
    try {
      if (editingParto) {
        await updateParto(editingParto.id, {
          eventoId: editingParto.eventoId,
          reproduccionId: editingParto.reproduccionId,
          fechaParto: partoForm.fechaParto,
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observacion: partoForm.observacion || null,
        });
        toast.success('Parto actualizado');
      } else {
        // Create evento + parto
        const tipoPartoEvento = tiposEvento.find(te =>
          te.nombre?.toLowerCase().includes('parto')
        );
        const eventoRes = await api.post('/api/evento', {
          animalId: null,
          tipoEventoId: tipoPartoEvento?.id || 1,
          descripcion: 'Parto',
          fecha: partoForm.fechaParto + 'T00:00:00',
        });
        await api.post('/api/parto', {
          eventoId: eventoRes.data.id,
          reproduccionId: parseInt(reproduccionPartoRef),
          fechaParto: partoForm.fechaParto,
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observacion: partoForm.observacion || null,
        });
        toast.success('Parto registrado');
      }
      resetPartoForm();
      loadData();
    } catch (error) {
      const msg = apiError(error, 'Error desconocido');
      setPartoError(msg);
    } finally {
      setSubmittingParto(false);
    }
  };

  const handleDeleteParto = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Está seguro de eliminar este parto?',
      onConfirm: async () => {
        try {
          await deleteParto(id);
          toast.success('Parto eliminado');
          loadData();
        } catch (error) {
          const msg = apiError(error, 'Error al eliminar parto');
          showError(msg);
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  // ── Filters ──
  const filteredReproducciones = reproducciones.filter(r => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      (r.vacaNombre && r.vacaNombre.toLowerCase().includes(q)) ||
      (r.vacaArete && r.vacaArete.toLowerCase().includes(q)) ||
      (r.toroNombre && r.toroNombre.toLowerCase().includes(q)) ||
      (r.tipoReproduccion && r.tipoReproduccion.toLowerCase().includes(q)) ||
      (r.resultadoReproduccion && r.resultadoReproduccion.toLowerCase().includes(q))
    );
  });

  const filteredPartos = partos.filter(p => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      (p.vacaNombre && p.vacaNombre.toLowerCase().includes(q)) ||
      (p.vacaArete && p.vacaArete.toLowerCase().includes(q))
    );
  });

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reproducción</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registros reproductivos y control de partos
          </p>
        </div>
        <Link to="/dashboard/reproduccion/nuevo" className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setBusqueda(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}>
            {tab.label}
            <span className="ml-2 text-xs opacity-60">
              {tab.key === 'reproducciones' ? reproducciones.length : partos.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">
            {activeTab === 'reproducciones' ? 'Buscar (animal, tipo, resultado)' : 'Buscar (vaca)'}
          </label>
          <input type="text" className="input-field" placeholder="Buscar..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <div className="text-sm text-gray-500 pb-2">
          {activeTab === 'reproducciones'
            ? `${filteredReproducciones.length} de ${reproducciones.length} registros`
            : `${filteredPartos.length} de ${partos.length} partos`}
        </div>
      </div>

      {/* ── Reproducciones Tab ── */}
      {activeTab === 'reproducciones' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="bg-dark-800/50">
                  <th className="text-left">Vaca</th>
                  <th className="text-left">Toro</th>
                  <th className="text-left">Fecha Monta</th>
                  <th className="text-left">Tipo</th>
                  <th className="text-left">Resultado</th>
                  <th className="text-left">Parto Est.</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReproducciones.map(r => (
                  <tr key={r.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="font-medium text-gray-200">{r.vacaArete || '—'}</td>
                    <td className="text-gray-300">{r.toroArete || '—'}</td>
                    <td className="text-gray-300">{r.fechaMonta || '—'}</td>
                    <td>
                      <span className={`badge-${
                        r.tipoReproduccion === 'Monta Natural' ? 'blue' :
                        r.tipoReproduccion === 'Inseminación' ? 'amber' : 'gray'
                      }`}>
                        {r.tipoReproduccion || '—'}
                      </span>
                    </td>
                    <td className="text-gray-300">{r.resultadoReproduccion || '—'}</td>
                    <td className="text-gray-300">{r.fechaPartoEstimada || '—'}</td>
                    <td className="text-right space-x-3">
                      <Link to={`/dashboard/reproduccion/editar/${r.id}`}
                        className="text-sm text-rose-400 hover:underline">Editar</Link>
                      <button onClick={() => handleDeleteReproduccion(r.id)}
                        className="text-sm text-red-400 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filteredReproducciones.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      {reproducciones.length === 0 ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                          <p className="text-sm">No hay registros reproductivos aún.</p>
                          <Link to="/dashboard/reproduccion/nuevo" className="text-sm text-rose-400 hover:underline">
                            Registrar primer servicio
                          </Link>
                        </div>
                      ) : 'No se encontraron registros.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Partos Tab ── */}
      {activeTab === 'partos' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="bg-dark-800/50">
                  <th className="text-left">Vaca</th>
                  <th className="text-left">Fecha Parto</th>
                  <th className="text-left">Cant. Crías</th>
                  <th className="text-left">Observaciones</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartos.map(p => (
                  <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                    <td className="font-medium text-gray-200">{p.vacaArete || '—'}</td>
                    <td className="text-gray-300">{p.fechaParto || '—'}</td>
                    <td className="text-gray-300">{p.cantidadCrias ?? '—'}</td>
                    <td className="text-gray-400 text-sm max-w-[200px] truncate">{p.observacion || '—'}</td>
                    <td className="text-right space-x-3">
                      <button onClick={() => openEditParto(p)}
                        className="text-sm text-amber-400 hover:underline">Editar</button>
                      <button onClick={() => handleDeleteParto(p.id)}
                        className="text-sm text-red-400 hover:underline">Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filteredPartos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      {partos.length === 0 ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                          </svg>
                          <p className="text-sm">No hay partos registrados aún.</p>
                        </div>
                      ) : 'No se encontraron partos.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parto Form Modal */}
      <PartoFormModal
        isOpen={partoFormOpen}
        onClose={resetPartoForm}
        onSubmit={handleSaveParto}
        formData={partoForm}
        onChange={handlePartoChange}
        error={partoError}
        submitting={submittingParto}
        title={editingParto ? 'Editar Parto' : 'Registrar Parto'}
        parto={editingParto}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, error: '' })}
        error={errorModal.error}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={() => setConfirm({ isOpen: false, onConfirm: null, message: '' })}
        onConfirm={confirm.onConfirm}
        title="Confirmar acción"
        message={confirm.message}
      />
    </div>
  );
}
