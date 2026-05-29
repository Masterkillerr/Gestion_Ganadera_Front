import React, { useEffect, useState } from 'react';
import { getVacunas, createVacuna, deleteVacuna, getVacunaciones } from '../api/ganado';
import { ConfirmModal, DetailModal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'vacunas', label: 'Vacunas (Catálogo)' },
  { key: 'vacunaciones', label: 'Vacunaciones' },
];

export default function SanidadPage() {
  const [activeTab, setActiveTab] = useState('vacunas');
  const [vacunas, setVacunas] = useState([]);
  const [vacunaciones, setVacunaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaVacuna, setNuevaVacuna] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  // Confirm modal state
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });
  // Detail modal state
  const [detail, setDetail] = useState({ isOpen: false, title: '', fields: [] });

  const loadData = async () => {
    setLoading(true);
    try {
      const [v, vacs] = await Promise.all([
        getVacunas().catch(() => []),
        getVacunaciones().catch(() => []),
      ]);
      setVacunas(v);
      setVacunaciones(vacs);
    } catch (error) {
      console.error('Error cargando datos de sanidad', error);
      toast.error('Error al cargar datos de sanidad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateVacuna = async (e) => {
    e.preventDefault();
    if (!nuevaVacuna.trim()) return;
    try {
      await createVacuna({ nombre: nuevaVacuna.trim() });
      setNuevaVacuna('');
      setError('');
      loadData();
    } catch (error) {
      setError('Error al crear vacuna');
    }
  };

  const handleDeleteVacuna = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Eliminar esta vacuna del catálogo?',
      onConfirm: async () => {
        try {
          await deleteVacuna(id);
          loadData();
        } catch (error) {
          setError('Error al eliminar vacuna');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  const openVacunaDetail = (v) => {
    setDetail({
      isOpen: true,
      title: `Vacuna: ${v.vacuna?.nombre || ''}`,
      fields: [
        { label: 'Animal', value: v.evento?.animal?.identificadorArete || v.evento?.animal?.nombre || '—' },
        { label: 'Vacuna', value: v.vacuna?.nombre || '—' },
        { label: 'Próxima Dosis', value: v.proximaDosis || '—' },
        { label: 'Observación', value: v.observacion || '—' },
      ],
    });
  };

  const filteredVacunas = vacunas.filter(v =>
    !busqueda || v.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const filteredVacunaciones = vacunaciones.filter(v => {
    if (!busqueda) return true;
    const q = busqueda.toLowerCase();
    return (
      (v.vacuna?.nombre && v.vacuna.nombre.toLowerCase().includes(q)) ||
      (v.observacion && v.observacion.toLowerCase().includes(q))
    );
  });

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Sanidad</h1>
          <p className="text-gray-400 text-sm mt-1">Control de vacunas y vacunaciones del hato</p>
        </div>
      </div>

      {error && (
        <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-3">
          <span>{error}</span>
        </div>
      )}

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
      </div>

      {activeTab === 'vacunas' && (
        <div className="glass-card p-6 space-y-4">
          <form onSubmit={handleCreateVacuna} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Nueva Vacuna</label>
              <input type="text" className="input-field" placeholder="Nombre de la vacuna" value={nuevaVacuna} onChange={e => setNuevaVacuna(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Añadir
            </button>
          </form>
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
                    <td className="text-gray-200 font-medium">{v.nombre}</td>
                    <td className="text-right">
                      <button onClick={() => handleDeleteVacuna(v.id)} className="text-sm text-red-400 hover:underline">Eliminar</button>
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

      {activeTab === 'vacunaciones' && (
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
                    <td className="text-gray-200">{v.vacuna?.nombre || '—'}</td>
                    <td className="text-gray-300">{v.evento?.animal?.identificadorArete || v.evento?.animal?.nombre || '—'}</td>
                    <td className="text-gray-300">{v.proximaDosis || '—'}</td>
                    <td className="text-gray-400 text-sm max-w-[200px] truncate">{v.observacion || '—'}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => openVacunaDetail(v)}
                        className="text-sm text-purple-400 hover:underline"
                      >
                        Ver ficha
                      </button>
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

      <DetailModal
        isOpen={detail.isOpen}
        onClose={() => setDetail({ isOpen: false, title: '', fields: [] })}
        title={detail.title}
        fields={detail.fields}
      />
    </div>
  );
}
