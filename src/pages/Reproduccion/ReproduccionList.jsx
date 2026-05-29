import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getReproducciones, deleteReproduccion,
  getPartos, deleteParto,
} from '../../api/ganado';
import { ConfirmModal, DetailModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

const TABS = [
  { key: 'reproducciones', label: 'Registros Reproductivos' },
  { key: 'partos', label: 'Partos' },
];

export default function ReproduccionList() {
  const [activeTab, setActiveTab] = useState('reproducciones');
  const [reproducciones, setReproducciones] = useState([]);
  const [partos, setPartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Modals
  const [confirm, setConfirm] = useState({ isOpen: false, onConfirm: null, message: '' });
  const [detail, setDetail] = useState({ isOpen: false, title: '', fields: [] });
  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        getReproducciones().catch(() => []),
        getPartos().catch(() => []),
      ]);
      setReproducciones(r);
      setPartos(p);
    } catch (error) {
      console.error('Error cargando datos de reproducción', error);
      toast.error('Error al cargar datos de reproducción');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteReproduccion = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Está seguro de eliminar este registro reproductivo?',
      onConfirm: async () => {
        try {
          await deleteReproduccion(id);
          loadData();
        } catch (error) {
          console.error('Error al eliminar', error);
          toast.error('Error al eliminar registro');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  const handleDeleteParto = (id) => {
    setConfirm({
      isOpen: true,
      message: '¿Está seguro de eliminar este parto?',
      onConfirm: async () => {
        try {
          await deleteParto(id);
          loadData();
        } catch (error) {
          console.error('Error al eliminar', error);
          toast.error('Error al eliminar parto');
        }
        setConfirm({ isOpen: false, onConfirm: null, message: '' });
      },
    });
  };

  const openPartoDetail = (p) => {
    setDetail({
      isOpen: true,
      title: `Parto - ${p.vacaArete || 'Vaca #' + p.id}`,
      fields: [
        { label: 'Vaca', value: p.vacaArete || '—' },
        { label: 'Fecha Parto', value: p.fechaParto || '—' },
        { label: 'Cant. Crías', value: p.cantidadCrias?.toString() || '—' },
        { label: 'Observaciones', value: p.observacion || '—' },
      ],
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

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

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
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setBusqueda(''); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
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
          <input
            type="text"
            className="input-field"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 pb-2">
          {activeTab === 'reproducciones'
            ? `${filteredReproducciones.length} de ${reproducciones.length} registros`
            : `${filteredPartos.length} de ${partos.length} partos`}
        </div>
      </div>

      {/* Tab Content */}
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
                    <td className="font-medium text-gray-200">
                      {r.vacaArete || '—'}
                    </td>
                    <td className="text-gray-300">
                      {r.toroArete || '—'}
                    </td>
                    <td className="text-gray-300">
                      {r.fechaMonta || '—'}
                    </td>
                    <td>
                      <span className={`badge-${
                        r.tipoReproduccion === 'Monta Natural' ? 'blue' :
                        r.tipoReproduccion === 'Inseminación' ? 'amber' :
                        'gray'
                      }`}>
                        {r.tipoReproduccion || '—'}
                      </span>
                    </td>
                    <td className="text-gray-300">{r.resultadoReproduccion || '—'}</td>
                    <td className="text-gray-300">{r.fechaPartoEstimada || '—'}</td>
                    <td className="text-right space-x-3">
                      <Link
                        to={`/dashboard/reproduccion/editar/${r.id}`}
                        className="text-sm text-rose-400 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDeleteReproduccion(r.id)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
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
                    <td className="font-medium text-gray-200">
                      {p.vacaArete || '—'}
                    </td>
                    <td className="text-gray-300">{p.fechaParto || '—'}</td>
                    <td className="text-gray-300">{p.cantidadCrias ?? '—'}</td>
                    <td className="text-gray-400 text-sm max-w-[200px] truncate">
                      {p.observacion || '—'}
                    </td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => openPartoDetail(p)}
                        className="text-sm text-rose-400 hover:underline"
                      >
                        Ver ficha
                      </button>
                      <button
                        onClick={() => handleDeleteParto(p.id)}
                        className="text-sm text-red-400 hover:underline"
                      >
                        Eliminar
                      </button>
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
                          <p className="text-xs text-dark-400 mt-1">
                            Los partos se registran desde la ficha de cada registro reproductivo.
                          </p>
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
