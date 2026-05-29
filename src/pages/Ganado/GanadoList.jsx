import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimales, deleteAnimal, getRazas, getLotes } from '../../api/ganado';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const GanadoList = () => {
  const [animales, setAnimales] = useState([]);
  const [filteredAnimales, setFilteredAnimales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const toast = useToast();

  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: '',
    sexo: '',
  });

  const loadData = async () => {
    try {
      const data = await getAnimales();
      setAnimales(data);
      setFilteredAnimales(data);
    } catch (error) {
      console.error('Error al cargar animales', error);
      toast.error('Error al cargar animales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = animales;
    if (filtros.busqueda) {
      result = result.filter(a =>
        (a.identificadorArete && a.identificadorArete.toLowerCase().includes(filtros.busqueda.toLowerCase())) ||
        (a.nombre && a.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()))
      );
    }
    if (filtros.estado) {
      result = result.filter(a => a.estadoAnimal === filtros.estado);
    }
    if (filtros.sexo) {
      result = result.filter(a => a.sexo === filtros.sexo);
    }
    setFilteredAnimales(result);
  }, [filtros, animales]);

  const handleDelete = (id) => {
    setDeleteTarget({ id });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAnimal(deleteTarget.id);
      loadData();
    } catch (error) {
      console.error('Error al eliminar', error);
      toast.error('Error al eliminar animal');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <>
      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar animal"
        message="¿Está seguro de eliminar este animal?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Gestión de Ganado</h1>
          <p className="text-gray-400 text-sm mt-1">Lista completa de animales y filtrado</p>
        </div>
        <Link to="/dashboard/ganado/nuevo" className="btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Animal
        </Link>
      </div>

      <div className="glass-card p-4 flex gap-4 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Buscar (ID, Arete, Nombre)</label>
          <input
            type="text"
            className="input-field"
            placeholder="Buscar..."
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
          />
        </div>
        <div className="w-48">
          <label className="block text-xs text-gray-400 mb-1">Estado</label>
          <select
            className="input-field"
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="Sano">Sano</option>
            <option value="En Tratamiento">En Tratamiento</option>
            <option value="Gestante">Gestante</option>
            <option value="Lactancia">Lactancia</option>
            <option value="Seca">Seca</option>
            <option value="Vendido/Baja">Vendido/Baja</option>
          </select>
        </div>
        <div className="w-48">
          <label className="block text-xs text-gray-400 mb-1">Sexo</label>
          <select
            className="input-field"
            value={filtros.sexo}
            onChange={(e) => setFiltros({ ...filtros, sexo: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-dark-800/50">
                <th className="text-left">Arete / ID</th>
                <th className="text-left">Nombre</th>
                <th className="text-left" style={{ paddingLeft: '19px' }}>Sexo</th>
                <th className="text-left">Raza</th>
                <th className="text-left">Estado</th>
                <th className="text-left" style={{ paddingLeft: '53px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimales.map(animal => (
                <tr key={animal.id}>
                  <td>

                    <div className="font-medium text-brand-300">{animal.identificadorArete || `ID:${animal.id}`}</div>
                  </td>
                  <td>{animal.nombre || '-'}</td>
                  <td>
                    {animal.sexo === 'Hembra' ? <span className="badge-pink badge">Hembra</span> :
                      animal.sexo === 'Macho' ? <span className="badge-blue badge">Macho</span> : '-'}
                  </td>
                  <td>{animal.razaNombre || '-'}</td>
                  <td>
                    {animal.estadoAnimal === 'Activo' ? <span className="badge-green">{animal.estadoAnimal}</span> :
                      <span className="badge-gray">{animal.estadoAnimal || 'N/A'}</span>}
                  </td>
                  <td className="text-right space-x-2">
                    <Link to={`/dashboard/ganado/${animal.id}`} className="text-sm text-brand-400 hover:underline">Ver Ficha</Link>
                    <Link to={`/dashboard/ganado/editar/${animal.id}`} className="text-sm text-blue-400 hover:underline">Editar</Link>
                    <button onClick={() => handleDelete(animal.id)} className="text-sm text-red-400 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
              {filteredAnimales.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No se encontraron animales.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default GanadoList;
