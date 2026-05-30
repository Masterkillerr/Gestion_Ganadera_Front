import React, { useEffect, useState, useCallback } from 'react';
import { getFincas, getLotes, createFinca, updateFinca, deleteFinca,
  createLote, updateLote, deleteLote, getAnimalesByLote } from '../api/ganado';
import { ConfirmModal, InlineFormModal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const TABS = [
  { key: 'finca', label: 'Fincas' },
  { key: 'lote', label: 'Lotes' },
  { key: 'animales', label: 'Animales por Lote' },
];

export default function InfraestructuraPage() {
  const [activeTab, setActiveTab] = useState('finca');
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  // Confirm modal
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });

  // Inline form modal
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // { type: 'finca'|'lote', data }
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  // Animales por lote state
  const [animalesPorLote, setAnimalesPorLote] = useState({});
  const [loadingAnimales, setLoadingAnimales] = useState({});
  const [expandedLotes, setExpandedLotes] = useState({});

  const toggleLote = async (loteId) => {
    const isExpanded = !expandedLotes[loteId];
    setExpandedLotes(prev => ({ ...prev, [loteId]: isExpanded }));

    if (isExpanded const [loadingAnimales, setLoadingAnimales] = useState({});const [loadingAnimales, setLoadingAnimales] = useState({}); !animalesPorLote[loteId]) {
      setLoadingAnimales(prev => ({ ...prev, [loteId]: true }));
      try {
        const animals = await getAnimalesByLote(loteId).catch(() => []);
        setAnimalesPorLote(prev => ({ ...prev, [loteId]: animals }));
      } finally {
        setLoadingAnimales(prev => ({ ...prev, [loteId]: false }));
      }
    }
  };
  const [expandedLotes, setExpandedLotes] = useState({});

  const toggleLote = async (loteId) => {
    const isExpanded = !expandedLotes[loteId];
    setExpandedLotes(prev => ({ ...prev, [loteId]: isExpanded }));

    // Fetch data if expanding and not already loaded
    if (isExpanded && !animalesPorLote[loteId]) {
      setLoadingAnimales(prev => ({ ...prev, [loteId]: true }));
      try {
        const animals = await getAnimalesByLote(loteId).catch(() => []);
        setAnimalesPorLote(prev => ({ ...prev, [loteId]: animals }));
      } finally {
        setLoadingAnimales(prev => ({ ...prev, [loteId]: false }));
      }
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'finca' || activeTab === 'lote') {
        const [fincasData, lotesData] = await Promise.all([
          getFincas().catch(() => []),
          getLotes().catch(() => []),
        ]);
        const lotesByFinca = {};
        (Array.isArray(lotesData) ? lotesData : []).forEach(lote => {
          const fid = lote.fincaId || lote.finca?.id || lote.idFinca;
          if (!lotesByFinca[fid]) lotesByFinca[fid] = [];
          lotesByFinca[fid].push({ ...lote, fincaNombre: lote.fincaNombre || lote.finca?.nombre || '' });
        });
        const enriched = (Array.isArray(fincasData) ? fincasData : []).map(f => ({
          ...f,
          lotes: lotesByFinca[f.id] || [],
        }));
        setFincas(enriched);
        setLotes((Array.isArray(lotesData) ? lotesData : []).map(l => ({
          ...l,
          fincaNombre: l.fincaNombre || l.finca?.nombre || '',
        })));
      } else {
        const [fincasData, lotesData] = await Promise.all([
          getFincas().catch(() => []),
          getLotes().catch(() => []),
        ]);
        setFincas(Array.isArray(fincasData) ? fincasData : []);
        setLotes((Array.isArray(lotesData) ? lotesData : []).map(l => ({
          ...l,
          fincaNombre: l.fincaNombre || l.finca?.nombre || '',
        })));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Animals by Lote ──

  // ── Inline Form helpers ──
  const openAddForm = (type) => {
    setEditingItem({ type, data: null });
    if (type === 'finca') {
      setFormData({ nombre: '', ubicacion: '', extension: '' });
    } else {
      setFormData({ nombre: '', fincaId: '', capacidadMaxima: '', hectareas: '', tipoPasto: '', estado: '' });
    }
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (type, data) => {
    setEditingItem({ type, data });
    if (type === 'finca') {
      setFormData({
        nombre: data.nombre || '',
        ubicacion: data.ubicacion || '',
        extension: data.extension || '',
      });
    } else {
      setFormData({
        nombre: data.nombre || '',
        fincaId: data.fincaId || data.finca?.id || data.idFinca || '',
        capacidadMaxima: data.capacidadMaxima || data.capacidad || '',
        hectareas: data.hectareas || '',
        tipoPasto: data.tipoPasto || '',
        estado: data.estado || '',
      });
    }
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { type, data } = editingItem;
    try {
      if (type === 'finca') {
        const payload = {
          nombre: formData.nombre,
          ubicacion: formData.ubicacion || null,
          extension: formData.extension ? parseFloat(formData.extension) : null,
        };
        if (data) {
          await updateFinca(data.id, payload);
          toast.success('Finca actualizada');
        } else {
          await createFinca(payload);
          toast.success('Finca creada');
        }
      } else {
        const payload = {
          nombre: formData.nombre,
          fincaId: formData.fincaId ? parseInt(formData.fincaId) : null,
          capacidadMaxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : null,
          hectareas: formData.hectareas ? parseFloat(formData.hectareas) : null,
          tipoPasto: formData.tipoPasto || null,
          estado: formData.estado || null,
        };
        if (data) {
          await updateLote(data.id, payload);
          toast.success('Lote actualizado');
        } else {
          await createLote(payload);
          toast.success('Lote creado');
        }
      }
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error desconocido';
      setFormError(msg);
    }
  };

  // ── Delete ──
  const handleDelete = (type, id) => {
    setConfirm({
      isOpen: true,
      message: `¿Eliminar ${type === 'finca' ? 'esta finca' : 'este lote'}?`,
      onConfirm: async () => {
        try {
          if (type === 'finca') await deleteFinca(id);
          else await deleteLote(id);
          toast.success(`${type === 'finca' ? 'Finca' : 'Lote'} eliminado`);
          loadData();
        } catch (err) {
          toast.error(`Error al eliminar ${type}`);
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  // ── Filters ──
  const filterSearch = (items, fields) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item =>
      fields.some(f => item[f]?.toString().toLowerCase().includes(q))
    );
  };

  const filteredFincas = filterSearch(fincas, ['id', 'nombre', 'ubicacion']);
  const filteredLotes = filterSearch(lotes, ['id', 'nombre', 'capacidad', 'fincaNombre', 'estado']);

  // ── Render ──
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Infraestructura</h1>
          <p className="text-gray-400 text-sm mt-1">Gestión de fincas y lotes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-500'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add */}
      {activeTab !== 'animales' && (
        <div className="flex items-center justify-between gap-4">
          <input type="text" placeholder="Buscar..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field max-w-xs" />
          <button onClick={() => openAddForm(activeTab)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-600/30">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + Añadir {activeTab === 'finca' ? 'Finca' : 'Lote'}
          </button>
        </div>
      )}

      {/* ── Fincas Tab ── */}
      {activeTab === 'finca' && (
        <div className="space-y-4">
          {loading ? (<LoadingSpinner fullPage message="Cargando..." />) : (
            filteredFincas.length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500">
                {search ? 'Sin resultados' : 'No hay fincas registradas'}
              </div>
            ) : (
              filteredFincas.map(finca => (
                <div key={finca.id} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-dark-800/50 border-b border-dark-400">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold">
                        {finca.nombre || `Finca #${finca.id}`}
                        <span className="text-gray-400 text-sm ml-2">#{finca.id}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {finca.ubicacion || 'Sin ubicación'} · Ext: {finca.extension || '—'} ha
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <button onClick={() => openEditForm('finca', finca)}
                        className="text-sm text-amber-400 hover:underline">
                        Editar
                      </button>
                      <button onClick={() => handleDelete('finca', finca.id)}
                        className="text-sm text-red-400 hover:underline">
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {finca.lotes?.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-dark-400 bg-dark-800/30">
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-8">ID Lote</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacidad</th>
                          <th className="text-right px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-400/50">
                        {finca.lotes.map(lote => (
                          <tr key={lote.id} className="hover:bg-dark-600/30 transition-colors">
                            <td className="px-4 py-2 text-sm text-gray-300 pl-8">{lote.id}</td>
                            <td className="px-4 py-2 text-sm text-gray-300">{lote.nombre || '—'}</td>
                            <td className="px-4 py-2 text-sm text-gray-300">{lote.capacidadMaxima || lote.capacidad || '—'}</td>
                            <td className="px-4 py-2 text-right">
                              <button onClick={() => openEditForm('lote', lote)}
                                className="text-amber-400 hover:text-amber-300 text-xs font-medium mr-3">Editar</button>
                              <button onClick={() => handleDelete('lote', lote.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 pl-8">Sin lotes asignados</div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* ── Lotes Tab ── */}
      {activeTab === 'lote' && (
        <div className="glass-card overflow-hidden">
          {loading ? (<LoadingSpinner fullPage message="Cargando..." />) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/50">
                    <th className="text-left">ID</th>
                    <th className="text-left">Nombre</th>
                    <th className="text-left">Capacidad</th>
                    <th className="text-left">Finca</th>
                    <th className="text-left">Estado</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-400">
                  {filteredLotes.map(l => (
                    <tr key={l.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-300">{l.id}</td>
                      <td className="text-gray-300">{l.nombre || '—'}</td>
                      <td className="text-gray-300">{l.capacidadMaxima || l.capacidad || '—'}</td>
                      <td className="text-gray-300">{l.fincaNombre || l.finca?.nombre || '—'}</td>
                      <td><span className={`badge-${l.estado === 'Activo' ? 'green' : 'gray'}`}>{l.estado || '—'}</span></td>
                      <td className="text-right space-x-3">
                        <button onClick={() => openEditForm('lote', l)}
                          className="text-amber-400 hover:text-amber-300 text-xs font-medium">Editar</button>
                        <button onClick={() => handleDelete('lote', l.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {filteredLotes.length === 0 && (
                    <tr><td colSpan="6" className="text-center text-gray-500 py-8">Sin lotes registrados</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Animales por Lote Tab ── */}
      {activeTab === 'animales' && (
        <div className="space-y-4">
          {lotes.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500">No hay lotes registrados</div>
          ) : loadingAnimales ? (
            <LoadingSpinner fullPage message="Cargando animales..." />
          ) : (
            lotes.map(l => {
              const animals = animalesPorLote[l.id] || [];
              return (
                <div key={l.id} className="glass-card overflow-hidden">
                  <div className="px-4 py-3 bg-dark-800/50 border-b border-dark-400 cursor-pointer flex justify-between items-center" onClick={() => toggleLote(l.id)}>
                    <div>
                      <h3 className="text-white font-semibold">
                        {l.nombre || `Lote #${l.id}`}
                        <span className="text-gray-400 text-sm ml-2">#{l.id}</span>
                        <span className="text-gray-500 text-xs ml-3">
                          {l.capacidadMaxima ? `Cap. ${animals.length}/${l.capacidadMaxima}` : `${animals.length} animales`}
                        </span>
                      </h3>
                      {l.fincaNombre && <p className="text-xs text-gray-500 mt-0.5">Finca: {l.fincaNombre}</p>}
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${expandedLotes[l.id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {expandedLotes[l.id] && (
                    animals.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-400 bg-dark-800/30">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider pl-8">ID</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Arete</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Raza</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sexo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-400/50">
                          {animals.map(a => (
                            <tr key={a.id} className="hover:bg-dark-600/30 transition-colors">
                              <td className="px-4 py-2 text-sm text-gray-300 pl-8">{a.id}</td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-200">{a.identificadorArete || '—'}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{a.nombre || '—'}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{a.raza?.nombre || a.razaNombre || '—'}</td>
                              <td className="px-4 py-2 text-sm text-gray-300">{a.sexo || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 pl-8">Sin animales en este lote</div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Inline Form Modal ── */}
      <InlineFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); setFormError(''); }}
        title={editingItem?.data
          ? `Editar ${editingItem.type === 'finca' ? 'Finca' : 'Lote'}`
          : `Nuev${editingItem?.type === 'finca' ? 'a' : 'o'} ${editingItem?.type === 'finca' ? 'Finca' : 'Lote'}`
        }>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg">{formError}</div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre <span className="text-red-400">*</span></label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange}
              className="input-field" required />
          </div>
          {editingItem?.type === 'finca' ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ubicación</label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleFormChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Extensión (ha)</label>
                <input type="number" step="0.01" name="extension" value={formData.extension} onChange={handleFormChange} className="input-field" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Finca <span className="text-red-400">*</span></label>
                <select name="fincaId" value={formData.fincaId} onChange={handleFormChange} className="input-field" required>
                  <option value="">Seleccione una finca...</option>
                  {fincas.map(f => (
                    <option key={f.id} value={f.id}>{f.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Capacidad Máxima</label>
                  <input type="number" name="capacidadMaxima" value={formData.capacidadMaxima} onChange={handleFormChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hectáreas</label>
                  <input type="number" step="0.01" name="hectareas" value={formData.hectareas} onChange={handleFormChange} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tipo Pasto</label>
                  <input type="text" name="tipoPasto" value={formData.tipoPasto} onChange={handleFormChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleFormChange} className="input-field">
                    <option value="">—</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                  </select>
                </div>
              </div>
            </>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
            <button type="button" onClick={() => { setShowForm(false); setEditingItem(null); setFormError(''); }}
              className="px-4 py-2 text-gray-400 hover:text-gray-100 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-600/30">
              {editingItem?.data ? 'Guardar Cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </InlineFormModal>

      {/* Confirm Modal */}
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
