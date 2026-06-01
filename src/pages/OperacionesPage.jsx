import React, { useEffect, useState, useCallback } from 'react';

import {
  getProducciones, getAlimentaciones, deleteAlimentacion, deleteProduccion,
  getAlimentos, createAlimento, updateAlimento, deleteAlimento,
  getDietas, createDieta, updateDieta, deleteDieta,
  getDietaAlimentosByDieta, createDietaAlimento, updateDietaAlimento, deleteDietaAlimento,
  getAnimales, apiAlimentacion, apiProduccion, updateProduccion,
  getTurnosProduccion
} from '../services/ganadoService';
import { getTodayLocal } from '../utils/date';
import { ConfirmModal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { apiError } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const TABS = [
  { key: 'produccion', label: 'Producción' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'alimento', label: 'Alimento' },
  { key: 'dietas', label: 'Dietas' },
];

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState('produccion');
  const [producciones, setProducciones] = useState([]);
  const [alimentaciones, setAlimentaciones] = useState([]);
  const [alimentos, setAlimentos] = useState([]);
  const [dietas, setDietas] = useState([]);
  const [dietaAlimentos, setDietaAlimentos] = useState([]);
  const [selectedDietaId, setSelectedDietaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [alimentoModal, setAlimentoModal] = useState({ open: false, edit: null });
  const [dietaModal, setDietaModal] = useState({ open: false, edit: null });
  const [daModal, setDaModal] = useState({ open: false, edit: null });
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [daForm, setDaForm] = useState({ alimentoId: '', cantidad: '', unidad: '' });
  const [alimentacionModal, setAlimentacionModal] = useState({ open: false, edit: null });
  const [aliForm, setAliForm] = useState({ animalId: '', dietaId: '', fecha: '', observacion: '' });
  const [animales, setAnimales] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [produccionModal, setProduccionModal] = useState({ open: false, edit: null });
  const [prodForm, setProdForm] = useState({ animalId: '', litros: '', turnoProduccionId: '', fecha: '' });
  const toast = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'produccion') {
        const [data, turnosData, animalesData] = await Promise.all([
          getProducciones(),
          getTurnosProduccion().catch(() => []),
          getAnimales(0, 9999).catch(() => ({ content: [] })),
        ]);
        setProducciones(Array.isArray(data) ? data : []);
        setTurnos(Array.isArray(turnosData) ? turnosData : []);
        setAnimales(Array.isArray(animalesData) ? animalesData : (animalesData?.content || []));
      } else if (activeTab === 'alimentacion') {
        const [data, animalesData, dietasData] = await Promise.all([
          getAlimentaciones(),
          getAnimales(0, 9999).catch(() => ({ content: [] })),
          getDietas().catch(() => []),
        ]);
        setAlimentaciones(Array.isArray(data) ? data : []);
        setAnimales(Array.isArray(animalesData) ? animalesData : (animalesData?.content || []));
        setDietas(Array.isArray(dietasData) ? dietasData : []);
      } else if (activeTab === 'alimento') {
        const data = await getAlimentos();
        setAlimentos(Array.isArray(data) ? data : []);
      } else if (activeTab === 'dietas') {
        const [dietasData, alimentosData] = await Promise.all([
          getDietas(),
          getAlimentos()
        ]);
        setDietas(Array.isArray(dietasData) ? dietasData : []);
        setAlimentos(Array.isArray(alimentosData) ? alimentosData : []);
        setSelectedDietaId(null);
        setDietaAlimentos([]);
      }
    } catch (err) {
      toast.error(apiError(err, 'Error al cargar datos'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cargar dieta_alimentos cuando se selecciona una dieta
  useEffect(() => {
    if (selectedDietaId) {
      getDietaAlimentosByDieta(selectedDietaId)
        .then(data => setDietaAlimentos(Array.isArray(data) ? data : []))
        .catch(() => setDietaAlimentos([]));
    } else {
      setDietaAlimentos([]);
    }
  }, [selectedDietaId]);

  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'produccion') await deleteProduccion(deleteTarget.id);
      else if (deleteTarget.type === 'alimentacion') await deleteAlimentacion(deleteTarget.id);
      else if (deleteTarget.type === 'alimento') await deleteAlimento(deleteTarget.id);
      else if (deleteTarget.type === 'dieta') await deleteDieta(deleteTarget.id);
      else if (deleteTarget.type === 'dieta_alimento') await deleteDietaAlimento(deleteTarget.id);
      loadData();
    } catch (err) {
      toast.error(apiError(err, 'Error al eliminar registro'));
    } finally {
      setDeleteTarget(null);
    }
  };

  // --- Producción CRUD handlers ---
  const openNewProduccion = () => {
    const today = getTodayLocal();
    setProdForm({ animalId: '', litros: '', turnoProduccionId: '', fecha: today });
    setProduccionModal({ open: true, edit: null });
  };

  const openEditProduccion = (item) => {
    const turnoMatch = turnos.find(t => t.nombre === item.turno);
    setProdForm({
      animalId: item.animalId?.toString() || '',
      litros: item.litros?.toString() || '',
      turnoProduccionId: turnoMatch?.id?.toString() || '',
      fecha: item.fecha || getTodayLocal(),
    });
    setProduccionModal({ open: true, edit: item });
  };

  const saveProduccion = async (e) => {
    e.preventDefault();
    if (!prodForm.animalId || !prodForm.litros || !prodForm.fecha) return;
    try {
      const payload = {
        animalId: parseInt(prodForm.animalId),
        litros: parseFloat(prodForm.litros),
        turnoProduccionId: prodForm.turnoProduccionId ? parseInt(prodForm.turnoProduccionId) : null,
        fecha: prodForm.fecha,
      };
      if (produccionModal.edit) {
        await updateProduccion(produccionModal.edit.id, payload);
      } else {
        await apiProduccion.create(payload);
      }
      setProduccionModal({ open: false, edit: null });
      loadData();
    } catch (err) {
      toast.error(apiError(err, 'Error al guardar producción'));
    }
  };

  // --- Alimento modal handlers ---
  const openNewAlimento = () => {
    setFormName('');
    setAlimentoModal({ open: true, edit: null });
  };

  const openEditAlimento = (alimento) => {
    setFormName(alimento.nombre);
    setAlimentoModal({ open: true, edit: alimento });
  };

  const saveAlimento = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      if (alimentoModal.edit) {
        await updateAlimento(alimentoModal.edit.id, { nombre: formName.trim() });
      } else {
        await createAlimento({ nombre: formName.trim() });
      }
      setAlimentoModal({ open: false, edit: null });
      loadData();
    } catch (err) {
      toast.error(apiError(err, 'Error al guardar alimento'));
    }
  };

  // --- Dieta modal handlers ---
  const openNewDieta = () => {
    setFormName('');
    setFormDesc('');
    setDietaModal({ open: true, edit: null });
  };

  const openEditDieta = (dieta) => {
    setFormName(dieta.nombre);
    setFormDesc(dieta.descripcion || '');
    setDietaModal({ open: true, edit: dieta });
  };

  const saveDieta = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      if (dietaModal.edit) {
        await updateDieta(dietaModal.edit.id, { nombre: formName.trim(), descripcion: formDesc.trim() || null });
      } else {
        await createDieta({ nombre: formName.trim(), descripcion: formDesc.trim() || null });
      }
      setDietaModal({ open: false, edit: null });
      loadData();
    } catch (err) {
      toast.error(apiError(err, 'Error al guardar dieta'));
    }
  };

  // --- DietaAlimento modal handlers ---
  const openNewDA = () => {
    setDaForm({ alimentoId: '', cantidad: '', unidad: '' });
    setDaModal({ open: true, edit: null });
  };

  const openEditDA = (da) => {
    setDaForm({
      alimentoId: da.alimentoId?.toString() || '',
      cantidad: da.cantidad?.toString() || '',
      unidad: da.unidad || '',
    });
    setDaModal({ open: true, edit: da });
  };

  const saveDA = async (e) => {
    e.preventDefault();
    if (!daForm.alimentoId || !selectedDietaId) return;
    try {
      const payload = {
        dietaId: parseInt(selectedDietaId),
        alimentoId: parseInt(daForm.alimentoId),
        cantidad: daForm.cantidad ? parseFloat(daForm.cantidad) : null,
        unidad: daForm.unidad || null,
      };
      if (daModal.edit) {
        await updateDietaAlimento(daModal.edit.id, payload);
      } else {
        await createDietaAlimento(payload);
      }
      setDaModal({ open: false, edit: null });
      // Recargar dieta_alimentos
      const data = await getDietaAlimentosByDieta(selectedDietaId);
      setDietaAlimentos(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(apiError(err, 'Error al guardar asignación'));
    }
  };

  // --- Alimentación CRUD handlers ---
  const openNewAlimentacion = () => {
    const today = getTodayLocal();
    setAliForm({ animalId: '', dietaId: '', fecha: today, observacion: '' });
    setAlimentacionModal({ open: true, edit: null });
  };

  const openEditAlimentacion = (item) => {
    setAliForm({
      animalId: item.animalId?.toString() || '',
      dietaId: item.dietaId?.toString() || '',
      fecha: item.fecha ? item.fecha.substring(0, 10) : '',
      observacion: item.observacion || '',
    });
    setAlimentacionModal({ open: true, edit: item });
  };

  const saveAlimentacion = async (e) => {
    e.preventDefault();
    if (!aliForm.animalId || !aliForm.fecha) return;
    try {
      const payload = {
        animalId: parseInt(aliForm.animalId),
        dietaId: aliForm.dietaId ? parseInt(aliForm.dietaId) : null,
        fecha: aliForm.fecha + 'T00:00:00',
        observacion: aliForm.observacion.trim() || null,
      };
      if (alimentacionModal.edit) {
        await apiAlimentacion.update(alimentacionModal.edit.id, payload);
      } else {
        await apiAlimentacion.create(payload);
      }
      setAlimentacionModal({ open: false, edit: null });
      loadData();
    } catch (err) {
      toast.error(apiError(err, 'Error al guardar alimentación'));
    }
  };

  const filterSearch = (items, fields) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item =>
      fields.some(f => item[f]?.toString().toLowerCase().includes(q))
    );
  };

  const filterAlimentacion = (items) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(a =>
      String(a.id).includes(q) ||
      (a.animalArete || '').toLowerCase().includes(q) ||
      String(a.animalId || '').includes(q) ||
      (a.dietaNombre || '').toLowerCase().includes(q) ||
      (a.observacion || '').toLowerCase().includes(q)
    );
  };

  const selectedAliAnimal = alimentacionModal.open && animales.find(a => a.id === parseInt(aliForm.animalId));


  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar registro"
        message="¿Eliminar este registro?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal Alimento */}
      <SimpleModal isOpen={alimentoModal.open} onClose={() => setAlimentoModal({ open: false, edit: null })} title={alimentoModal.edit ? 'Editar Alimento' : 'Nuevo Alimento'}>
        <form onSubmit={saveAlimento} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="input-field" placeholder="Nombre del alimento" required autoFocus />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => setAlimentoModal({ open: false, edit: null })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </SimpleModal>

      {/* Modal Dieta */}
      <SimpleModal isOpen={dietaModal.open} onClose={() => setDietaModal({ open: false, edit: null })} title={dietaModal.edit ? 'Editar Dieta' : 'Nueva Dieta'}>
        <form onSubmit={saveDieta} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} className="input-field" placeholder="Nombre de la dieta" required autoFocus />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripción (opcional)</label>
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} className="input-field min-h-[80px]" placeholder="Descripción..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => setDietaModal({ open: false, edit: null })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </SimpleModal>

      {/* Modal Alimentación */}
      <SimpleModal isOpen={alimentacionModal.open} onClose={() => setAlimentacionModal({ open: false, edit: null })} title={alimentacionModal.edit ? 'Editar Alimentación' : 'Nueva Alimentación'}>
        <form onSubmit={saveAlimentacion} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Animal <span className="text-red-400">*</span></label>
            <select value={aliForm.animalId} onChange={e => setAliForm(p => ({ ...p, animalId: e.target.value }))} className="input-field" required>
              <option value="">Seleccione...</option>
              {animales.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAliAnimal && (
              <p className="text-xs text-gray-500 mt-1">{selectedAliAnimal.razaNombre || 'Sin raza'} — {selectedAliAnimal.loteNombre ? `Lote: ${selectedAliAnimal.loteNombre}` : 'Sin lote'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Dieta (opcional)</label>
            <select value={aliForm.dietaId} onChange={e => setAliForm(p => ({ ...p, dietaId: e.target.value }))} className="input-field">
              <option value="">Sin dieta</option>
              {dietas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha <span className="text-red-400">*</span></label>
            <input type="date" value={aliForm.fecha} onChange={e => setAliForm(p => ({ ...p, fecha: e.target.value }))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Observación (opcional)</label>
            <textarea value={aliForm.observacion} onChange={e => setAliForm(p => ({ ...p, observacion: e.target.value }))} className="input-field min-h-[60px]" placeholder="Notas..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => setAlimentacionModal({ open: false, edit: null })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </SimpleModal>

      {/* Modal Producción */}
      <SimpleModal isOpen={produccionModal.open} onClose={() => setProduccionModal({ open: false, edit: null })} title={produccionModal.edit ? 'Editar Producción' : 'Nueva Producción'}>
        <form onSubmit={saveProduccion} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Animal <span className="text-red-400">*</span></label>
            <select value={prodForm.animalId} onChange={e => setProdForm(p => ({ ...p, animalId: e.target.value }))} className="input-field" required>
              <option value="">Seleccione...</option>
              {animales.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Litros <span className="text-red-400">*</span></label>
            <input type="number" step="0.1" min="0" value={prodForm.litros} onChange={e => setProdForm(p => ({ ...p, litros: e.target.value }))} className="input-field" placeholder="0.0" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Turno</label>
            <select value={prodForm.turnoProduccionId} onChange={e => setProdForm(p => ({ ...p, turnoProduccionId: e.target.value }))} className="input-field">
              <option value="">Seleccione...</option>
              {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha <span className="text-red-400">*</span></label>
            <input type="date" value={prodForm.fecha} onChange={e => setProdForm(p => ({ ...p, fecha: e.target.value }))} className="input-field" required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => setProduccionModal({ open: false, edit: null })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </SimpleModal>

      {/* Modal Dieta-Alimento */}
      <SimpleModal isOpen={daModal.open} onClose={() => setDaModal({ open: false, edit: null })} title={daModal.edit ? 'Editar Asignación' : 'Asignar Alimento a Dieta'}>
        <form onSubmit={saveDA} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Alimento</label>
            <select value={daForm.alimentoId} onChange={e => setDaForm(p => ({ ...p, alimentoId: e.target.value }))} className="input-field" required>
              <option value="">Seleccione...</option>
              {alimentos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Cantidad</label>
            <input type="number" step="0.01" value={daForm.cantidad} onChange={e => setDaForm(p => ({ ...p, cantidad: e.target.value }))} className="input-field" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Unidad</label>
            <input type="text" value={daForm.unidad} onChange={e => setDaForm(p => ({ ...p, unidad: e.target.value }))} className="input-field" placeholder="kg, g, L..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => setDaModal({ open: false, edit: null })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </SimpleModal>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Operaciones</h1>
          <p className="text-sm text-gray-400 mt-1">Registro de producción, alimentación, alimentos y dietas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 rounded-lg p-1 w-fit border border-dark-500 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add (no search/add for dietas sub-tables) */}
      {activeTab !== 'dietas' && (
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-64"
          />
          {activeTab === 'alimento' ? (
            <button onClick={openNewAlimento} className="btn-primary">+ Nuevo Alimento</button>
          ) : activeTab === 'alimentacion' ? (
            <button onClick={openNewAlimentacion} className="btn-primary">+ Nueva Alimentación</button>
          ) : activeTab === 'produccion' ? (
            <button onClick={openNewProduccion} className="btn-primary">+ Nueva Producción</button>
          ) : null}
        </div>
      )}

      {/* Tabla Producción */}
      {activeTab === 'produccion' && (
        <div className="glass-card overflow-hidden">
          {loading ? (<LoadingSpinner fullPage message="Cargando..." />) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left">ID</th>
                    <th className="text-left">Animal</th>
                    <th className="text-left">Cantidad (L)</th>
                    <th className="text-left">Turno</th>
                    <th className="text-left">Fecha</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {[...producciones].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)).filter(p => {
                    if (!search) return true;
                    const q = search.toLowerCase();
                    return (p.animalArete || '').toLowerCase().includes(q) ||
                      (p.animalNombre || '').toLowerCase().includes(q) ||
                      (p.turno || '').toLowerCase().includes(q);
                  }).map(p => (
                    <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-sm text-gray-300">{p.id}</td>
                      <td className="text-sm text-gray-200 font-medium">
                        {p.animalArete || '—'}
                        {p.animalNombre ? <span className="text-gray-500 ml-1">({p.animalNombre})</span> : ''}
                      </td>
                      <td className="text-sm text-gray-300">{p.litros != null ? p.litros : '—'}</td>
                      <td className="text-sm text-gray-300">{p.turno}</td>
                      <td className="text-sm text-gray-300">{p.fecha ? p.fecha.substring(0, 10) : '—'}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => openEditProduccion(p)} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">Editar</button>
                        <button onClick={() => handleDelete('produccion', p.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {producciones.length === 0 && (<tr><td colSpan="6" className="text-center text-gray-500 py-8">Sin registros de producción</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Alimentación */}
      {activeTab === 'alimentacion' && (
        <div className="glass-card overflow-hidden">
          {loading ? (<LoadingSpinner fullPage message="Cargando..." />) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left">ID</th>
                    <th className="text-left">ID Animal</th>
                    <th className="text-left">Arete</th>
                    <th className="text-left">ID Dieta</th>
                    <th className="text-left">Dieta</th>
                    <th className="text-left">Fecha</th>
                    <th className="text-left">Observación</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {filterAlimentacion(alimentaciones).map(a => (
                    <tr key={a.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-sm text-gray-300">{a.id}</td>
                      <td className="text-sm text-gray-300">{a.animalId ?? '—'}</td>
                      <td className="text-sm text-gray-200 font-medium">{a.animalArete || '—'}</td>
                      <td className="text-sm text-gray-300">{a.dietaId ?? '—'}</td>
                      <td className="text-sm text-gray-300">{a.dietaNombre || '—'}</td>
                      <td className="text-sm text-gray-300">{a.fecha ? a.fecha.substring(0, 10) : '—'}</td>
                      <td className="text-sm text-gray-400 max-w-[200px] truncate" title={a.observacion || ''}>{a.observacion || '—'}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => openEditAlimentacion(a)} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">Editar</button>
                        <button onClick={() => handleDelete('alimentacion', a.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {alimentaciones.length === 0 && (<tr><td colSpan="8" className="text-center text-gray-500 py-8">Sin registros de alimentación</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Alimento */}
      {activeTab === 'alimento' && (
        <div className="glass-card overflow-hidden">
          {loading ? (<LoadingSpinner fullPage message="Cargando..." />) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left">ID</th>
                    <th className="text-left">Nombre</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {filterSearch(alimentos, ['id', 'nombre']).map(a => (
                    <tr key={a.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-sm text-gray-300">{a.id}</td>
                      <td className="text-sm text-gray-200 font-medium">{a.nombre}</td>
                      <td className="text-right space-x-3">
                        <button onClick={() => openEditAlimento(a)} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">Editar</button>
                        <button onClick={() => handleDelete('alimento', a.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {alimentos.length === 0 && (<tr><td colSpan="3" className="text-center text-gray-500 py-8">Sin alimentos registrados</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Dietas */}
      {activeTab === 'dietas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">Administración de dietas y asignación de alimentos</p>
            <button onClick={openNewDieta} className="btn-primary">+ Nueva Dieta</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de dietas */}
            <div className="glass-card overflow-hidden">
              <h3 className="text-md font-semibold text-gray-200 p-4 border-b border-dark-500">Dietas</h3>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr className="bg-dark-800/80">
                      <th className="text-left">Nombre</th>
                      <th className="text-left">Descripción</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-500">
                    {dietas.map(d => (
                      <tr key={d.id}
                        className={`hover:bg-dark-600/50 transition-colors cursor-pointer ${selectedDietaId === d.id ? 'bg-brand-600/10 border-l-2 border-brand-400' : ''}`}
                        onClick={() => setSelectedDietaId(d.id)}
                      >
                        <td className="text-sm text-gray-200 font-medium">{d.nombre}</td>
                        <td className="text-sm text-gray-400">{d.descripcion || '—'}</td>
                        <td className="text-right space-x-3" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEditDieta(d)} className="text-brand-400 hover:text-brand-300 text-xs font-medium">Editar</button>
                          <button onClick={() => handleDelete('dieta', d.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {dietas.length === 0 && (<tr><td colSpan="3" className="text-center text-gray-500 py-8">Sin dietas registradas</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alimentos asignados a la dieta seleccionada */}
            <div className="glass-card overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-dark-500">
                <h3 className="text-md font-semibold text-gray-200">
                  {selectedDietaId
                    ? `Alimentos — ${dietas.find(d => d.id === selectedDietaId)?.nombre || 'Dieta'}`
                    : 'Alimentos asignados'}
                </h3>
                {selectedDietaId && (
                  <button onClick={openNewDA} className="btn-primary text-xs px-3 py-1">+ Asignar</button>
                )}
              </div>
              {selectedDietaId ? (
                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr className="bg-dark-800/80">
                        <th className="text-left">Alimento</th>
                        <th className="text-left">Cantidad</th>
                        <th className="text-left">Unidad</th>
                        <th className="text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-500">
                      {dietaAlimentos.map(da => (
                        <tr key={da.id} className="hover:bg-dark-600/50 transition-colors">
                          <td className="text-sm text-gray-200">{da.alimentoNombre || '—'}</td>
                          <td className="text-sm text-gray-300">{da.cantidad || '—'}</td>
                          <td className="text-sm text-gray-300">{da.unidad || '—'}</td>
                          <td className="text-right space-x-3">
                            <button onClick={() => openEditDA(da)} className="text-brand-400 hover:text-brand-300 text-xs font-medium">Editar</button>
                            <button onClick={() => handleDelete('dieta_alimento', da.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {dietaAlimentos.length === 0 && (<tr><td colSpan="4" className="text-center text-gray-500 py-8">Sin alimentos asignados</td></tr>)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm">Seleccione una dieta para ver sus alimentos asignados</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-fade-up" role="dialog" aria-modal="true" aria-label={title}>
      <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-100"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        {children}
      </div>
    </div>
  );
}
