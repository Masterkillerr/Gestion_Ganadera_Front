import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducciones, getAlimentaciones, deleteAlimentacion, deleteProduccion } from '../api/ganado';
import { ConfirmModal } from '../components/Modal';
import { useToast } from '../context/ToastContext';

const TABS = [
  { key: 'produccion', label: 'Producción' },
  { key: 'alimentacion', label: 'Alimentación' },
];

export default function OperacionesPage() {
  const [activeTab, setActiveTab] = useState('produccion');
  const [producciones, setProducciones] = useState([]);
  const [alimentaciones, setAlimentaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'produccion') {
        const data = await getProducciones();
        setProducciones(Array.isArray(data) ? data : []);
      } else {
        const data = await getAlimentaciones();
        setAlimentaciones(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type, id) => {
    setDeleteTarget({ type, id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'produccion') await deleteProduccion(deleteTarget.id);
      else await deleteAlimentacion(deleteTarget.id);
      loadData();
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Error al eliminar registro');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filterSearch = (items, fields) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item =>
      fields.some(f => item[f]?.toString().toLowerCase().includes(q))
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Operaciones</h1>
          <p className="text-sm text-gray-400 mt-1">Registro de producción y alimentación del ganado</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dark-800 rounded-lg p-1 w-fit border border-dark-500">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                : 'text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Add */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field w-64"
        />
        <Link
          to={`/dashboard/${activeTab === 'produccion' ? 'produccion/nuevo' : 'alimentacion/nuevo'}`}
          className="btn-primary"
        >
          + Añadir
        </Link>
      </div>

      {/* Tabla Producción */}
      {activeTab === 'produccion' && (
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : (
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
                  {filterSearch(producciones, ['id', 'cantidadLeche', 'turno']).map(p => (
                    <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-sm text-gray-300">{p.id}</td>
                      <td className="text-sm text-gray-200 font-medium">{p.animalArete || '—'}</td>
                      <td className="text-sm text-gray-300">{p.cantidadLeche}</td>
                      <td className="text-sm text-gray-300">{p.turno}</td>
                      <td className="text-sm text-gray-300">{p.fecha ? p.fecha.substring(0, 10) : '—'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete('produccion', p.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {producciones.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-8">Sin registros de producción</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tabla Alimentación */}
      {activeTab === 'alimentacion' && (
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Cargando...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/80">
                    <th className="text-left">ID</th>
                    <th className="text-left">Animal</th>
                    <th className="text-left">Alimento</th>
                    <th className="text-left">Cantidad (kg)</th>
                    <th className="text-left">Fecha</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-500">
                  {filterSearch(alimentaciones, ['id', 'alimentoNombre', 'cantidad']).map(a => (
                    <tr key={a.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-sm text-gray-300">{a.id}</td>
                      <td className="text-sm text-gray-200 font-medium">{a.animalArete || '—'}</td>
                      <td className="text-sm text-gray-300">{a.alimentoNombre || '—'}</td>
                      <td className="text-sm text-gray-300">{a.cantidad}</td>
                      <td className="text-sm text-gray-300">{a.fecha ? a.fecha.substring(0, 10) : '—'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete('alimentacion', a.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alimentaciones.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-8">Sin registros de alimentación</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
    </div>
  );
}
