import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFincas, getLotes, deleteFinca, deleteLote } from '../api/ganado';
import { ConfirmModal, DetailModal } from '../components/Modal';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const TABS = [
  { key: 'finca', label: 'Fincas' },
  { key: 'lote', label: 'Lotes' },
];

export default function InfraestructuraPage() {
  const [activeTab, setActiveTab] = useState('finca');
  const [fincas, setFincas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });
  const [detail, setDetail] = useState({ isOpen: false, title: '', fields: [] });
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'finca') {
        const fincasData = await getFincas();
        const lotesData = await getLotes();
        const lotesByFinca = {};
        (Array.isArray(lotesData) ? lotesData : []).forEach(lote => {
          const fid = lote.fincaId || lote.idFinca;
          if (!lotesByFinca[fid]) lotesByFinca[fid] = [];
          lotesByFinca[fid].push(lote);
        });
        const enriched = (Array.isArray(fincasData) ? fincasData : []).map(f => ({
          ...f,
          lotes: lotesByFinca[f.id] || [],
        }));
        setFincas(enriched);
      } else {
        const data = await getLotes();
        setLotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, id) => {
    setConfirm({
      isOpen: true,
      message: '¿Eliminar este registro?',
      onConfirm: async () => {
        try {
          if (type === 'finca') await deleteFinca(id);
          else await deleteLote(id);
          loadData();
        } catch (err) {
          console.error('Error deleting:', err);
          toast.error('Error al eliminar');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  const openFincaDetail = (finca) => {
    setDetail({
      isOpen: true,
      title: finca.nombre || `Finca #${finca.id}`,
      fields: [
        { label: 'Nombre', value: finca.nombre || '—' },
        { label: 'Ubicación', value: finca.ubicacion || '—' },
        { label: 'Extensión', value: finca.extension ? `${finca.extension} ha` : '—' },
        { label: 'Lotes Asociados', value: finca.lotes?.length ? finca.lotes.map(l => l.nombre || `Lote #${l.id}`).join(', ') : 'Ninguno' },
      ],
    });
  };

  const filterSearch = (items, fields) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item =>
      fields.some(f => item[f]?.toString().toLowerCase().includes(q))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Infraestructura</h1>
          <p className="text-gray-400 text-sm mt-1">Gestión de fincas y lotes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-700 rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-dark-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field max-w-xs"
        />
        <Link
          to={`/dashboard/${activeTab === 'finca' ? 'finca/nuevo' : 'lote/nuevo'}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-orange-600/30"
        >
          + Añadir
        </Link>
      </div>

      {/* Tabla Fincas con Lotes asociados */}
      {activeTab === 'finca' && (
        <div className="space-y-4">
          {loading ? (
            <LoadingSpinner fullPage message="Cargando..." />
          ) : (
            filterSearch(fincas, ['id', 'nombre', 'ubicacion', 'extension']).length === 0 ? (
              <div className="glass-card p-8 text-center text-gray-500">
                {search ? 'Sin resultados' : 'No hay fincas registradas'}
              </div>
            ) : (
              filterSearch(fincas, ['id', 'nombre', 'ubicacion', 'extension']).map(finca => (
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
                      <button
                        onClick={() => openFincaDetail(finca)}
                        className="text-sm text-orange-400 hover:underline"
                      >
                        Ver ficha
                      </button>
                      <button
                        onClick={() => handleDelete('finca', finca.id)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {finca.lotes.length > 0 ? (
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
                            <td className="px-4 py-2 text-sm text-gray-300">{lote.capacidad || '—'}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleDelete('lote', lote.id)}
                                className="text-red-400 hover:text-red-300 text-xs font-medium"
                              >
                                Eliminar
                              </button>
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

      {/* Tabla Lotes */}
      {activeTab === 'lote' && (
        <div className="glass-card overflow-hidden">
          {loading ? (
            <LoadingSpinner fullPage message="Cargando..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/50">
                    <th className="text-left">ID</th>
                    <th className="text-left">Nombre</th>
                    <th className="text-left">Capacidad</th>
                    <th className="text-left">Finca</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-400">
                  {filterSearch(lotes, ['id', 'nombre', 'capacidad', 'fincaId']).map(l => (
                    <tr key={l.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-300">{l.id}</td>
                      <td className="text-gray-300">{l.nombre || '—'}</td>
                      <td className="text-gray-300">{l.capacidad || '—'}</td>
                      <td className="text-gray-300">{l.fincaId || l.idFinca || '—'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete('lote', l.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lotes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500 py-8">Sin lotes registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
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
