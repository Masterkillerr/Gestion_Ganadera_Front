import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovimientos, deleteMovimiento } from '../../services/ganadoService';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const MovimientosList = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 50;
  const toast = useToast();

  const loadData = async (pageNum = 0, search = busqueda) => {
    try {
      const res = await getMovimientos(pageNum, PAGE_SIZE, search);
      const data = Array.isArray(res) ? res : (res?.content || []);
      setMovimientos(data);
      setTotalPages(res?.totalPages || 0);
      setTotalElements(res?.totalElements || data.length);
    } catch (error) {
      const msg = apiError(error, 'Error al cargar movimientos');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reload when page or search changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => loadData(page, busqueda), 300);
    return () => clearTimeout(timer);
  }, [page, busqueda]);

  const handleDelete = (id) => {
    setDeleteTarget({ id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMovimiento(deleteTarget.id);
      loadData(page, busqueda);
    } catch (error) {
      const msg = apiError(error, 'Error al eliminar movimiento');
      toast.error(msg);
    } finally {
      setDeleteTarget(null);
    }
  };

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Reset to page 0 when search changes
  useEffect(() => {
    setPage(0);
  }, [busqueda]);

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar movimiento"
        message="¿Está seguro de eliminar este movimiento?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Movimientos de Animales</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registro de traslados, ingresos y egresos de animales entre lotes
          </p>
        </div>
        <Link to="/dashboard/movimientos/nuevo" className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Movimiento
        </Link>
      </div>

      {/* Filtros */}
      <div className="glass-card p-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">
            Buscar (animal, lote, tipo)
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
          {totalElements} registros encontrados
        </div>
      </div>

      {/* Tabla */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-dark-800/50">
                <th className="text-left">Fecha</th>
                <th className="text-left">Animal</th>
                <th className="text-left">Origen</th>
                <th className="text-left">Destino</th>
                <th className="text-left">Tipo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(mov => (
                <tr key={mov.id} className="hover:bg-dark-600/50 transition-colors">
                  <td className="text-gray-300">{mov.fecha}</td>
                  <td className="font-medium text-gray-200">
                    {mov.animalArete || '—'}
                  </td>
                  <td className="text-gray-300">{mov.origen || '—'}</td>
                  <td className="text-gray-300">{mov.destino || '—'}</td>
                  <td>
                    <span className={`badge-${
                      mov.tipoMovimiento?.toLowerCase() === 'ingreso' ? 'green' :
                      mov.tipoMovimiento?.toLowerCase() === 'egreso' ? 'red' :
                      'gray'
                    }`}>
                      {mov.tipoMovimiento || 'Traslado'}
                    </span>
                  </td>
                  <td className="text-right space-x-3">
                    <button
                      onClick={() => handleDelete(mov.id)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && movimientos.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    {busqueda ? (
                      'No se encontraron movimientos con los filtros aplicados.'
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                        </svg>
                        <p className="text-sm">No hay movimientos registrados aún.</p>
                        <Link to="/dashboard/movimientos/nuevo" className="text-sm text-brand-400 hover:underline">
                          Registrar primer movimiento
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-500 bg-dark-800/50">
            <span className="text-sm text-gray-500">
              {totalElements} registros — Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-dark-600 text-gray-300 hover:bg-dark-500 hover:text-white"
              >
                ← Anterior
              </button>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-dark-600 text-gray-300 hover:bg-dark-500 hover:text-white"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MovimientosList;
