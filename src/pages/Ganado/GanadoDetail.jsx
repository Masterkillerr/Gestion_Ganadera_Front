import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnimalById, apiAlimentacion, apiProduccion, apiEventos, apiTratamientos, apiVacunaciones } from '../../api/ganado';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const GanadoDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [activeTab, setActiveTab] = useState('alimentacion');
  
  const [historial, setHistorial] = useState({
    alimentacion: [], produccion: [], eventos: [], tratamientos: [], vacunaciones: []
  });
  const toast = useToast();

  const loadData = async () => {
    try {
      const animalData = await getAnimalById(id);
      setAnimal(animalData);
      
      // Load all histories
      const [ali, prod, ev, trat, vac] = await Promise.all([
        apiAlimentacion.getByAnimal(id),
        apiProduccion.getByAnimal(id),
        apiEventos.getByAnimal(id),
        apiTratamientos.getByAnimal(id),
        apiVacunaciones.getByAnimal(id)
      ]);
      setHistorial({
        alimentacion: ali, produccion: prod, eventos: ev, tratamientos: trat, vacunaciones: vac
      });
    } catch (error) {
      console.error('Error cargando ficha', error);
      toast.error('Error al cargar datos del animal');
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDeleteRecord = (api, recordId) => {
    setDeleteTarget({ api, recordId });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTarget.api.delete(deleteTarget.recordId);
      loadData();
    } catch (error) {
      console.error('Error al eliminar registro', error);
      toast.error('Error al eliminar registro');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Funciones de inserción simplificadas para prueba
  const handleAddAlimentacion = async () => {
    const cantidad = prompt('Cantidad (kg):');
    if (cantidad) {
      await apiAlimentacion.create({ animalId: parseInt(id), fecha: new Date().toISOString().split('T')[0], cantidad: parseFloat(cantidad) });
      loadData();
    }
  };

  const handleAddProduccion = async () => {
    const litros = prompt('Litros:');
    if (litros) {
      await apiProduccion.create({ animalId: parseInt(id), fecha: new Date().toISOString().split('T')[0], litros: parseFloat(litros) });
      loadData();
    }
  };

  const handleAddEvento = async () => {
    const desc = prompt('Descripción del evento:');
    if (desc) {
      await apiEventos.create({ animalId: parseInt(id), descripcion: desc });
      loadData();
    }
  };

  const tabs = [
    { id: 'alimentacion', name: 'Alimentación' },
    { id: 'produccion', name: 'Producción' },
    { id: 'sanidad', name: 'Sanidad' },
    { id: 'eventos', name: 'Eventos' }
  ];

  if (!animal) return <LoadingSpinner fullPage message="Cargando ficha..." />;

  return (
    <>
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            {animal.identificadorArete || `ID:${animal.id}`} {animal.nombre ? `- ${animal.nombre}` : ''}
            {animal.sexo === 'HEMBRA' ? <span className="badge-pink badge text-sm">Hembra</span> : <span className="badge-blue badge text-sm">Macho</span>}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Ficha completa e historial</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/dashboard/ganado/editar/${animal.id}`} className="btn-primary bg-dark-600 hover:bg-dark-500 border border-dark-400">Editar Animal</Link>
          <Link to="/dashboard/ganado" className="px-4 py-2 text-gray-400 hover:text-gray-100">Volver</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 md:col-span-1 space-y-4">
          <div className="w-full aspect-square bg-dark-800 rounded-xl mb-4 flex items-center justify-center text-gray-600 overflow-hidden">
             {animal.fotoUrl ? <img src={animal.fotoUrl} alt="Foto" className="w-full h-full object-cover" /> : <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          </div>
          <div><span className="text-xs text-gray-500 block">Raza</span><span className="text-gray-200">{animal.razaNombre || 'No asignada'}</span></div>
          <div><span className="text-xs text-gray-500 block">Categoría</span><span className="text-gray-200">{animal.categoriaNombre || 'No asignada'}</span></div>
          <div><span className="text-xs text-gray-500 block">Lote / Finca</span><span className="text-gray-200">{animal.loteNombre || 'N/A'} {animal.fincaNombre ? `(${animal.fincaNombre})` : ''}</span></div>
          <div><span className="text-xs text-gray-500 block">Peso al Nacer</span><span className="text-gray-200">{animal.pesoNacimiento ? `${animal.pesoNacimiento} kg` : 'N/A'}</span></div>
          <div><span className="text-xs text-gray-500 block">Peso Actual</span><span className="text-gray-200">{animal.pesoActual ? `${animal.pesoActual} kg` : 'N/A'}</span></div>            <div className="pt-2 border-t border-dark-600">
            <span className="text-xs font-semibold text-brand-400 uppercase">Genealogía</span>
            <div className="mt-1 text-sm"><span className="text-gray-500">Madre:</span> {animal.madreArete || (animal.madreId ? `ID ${animal.madreId}` : 'Desconocida')}</div>
            <div className="text-sm"><span className="text-gray-500">Padre:</span> {animal.padreArete || (animal.padreId ? `ID ${animal.padreId}` : 'Desconocido')}</div>
          </div>
        </div>

        <div className="glass-card md:col-span-2 flex flex-col">
          <div className="flex border-b border-dark-600">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-brand-400 border-b-2 border-brand-400' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'alimentacion' && (
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Historial de Alimentación</h3>
                  <button onClick={handleAddAlimentacion} className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded">Añadir Registro</button>
                </div>
                <table className="w-full data-table">
                  <thead><tr><th>Fecha</th><th>Cantidad (kg)</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {historial.alimentacion.map(r => (
                      <tr key={r.id}><td>{r.fecha}</td><td>{r.cantidad}</td><td><button onClick={() => handleDeleteRecord(apiAlimentacion, r.id)} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                    ))}
                    {historial.alimentacion.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'produccion' && (
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Historial de Producción</h3>
                  <button onClick={handleAddProduccion} className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded">Añadir Registro</button>
                </div>
                <table className="w-full data-table">
                  <thead><tr><th>Fecha</th><th>Litros</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {historial.produccion.map(r => (
                      <tr key={r.id}><td>{r.fecha}</td><td>{r.litros}</td><td><button onClick={() => handleDeleteRecord(apiProduccion, r.id)} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                    ))}
                    {historial.produccion.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'sanidad' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Tratamientos</h3>
                  <table className="w-full data-table">
                    <thead><tr><th>Fecha Inicio</th><th>Observaciones</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {historial.tratamientos.map(r => (
                        <tr key={r.id}><td>{r.fechaInicio}</td><td>{r.observacion}</td><td><button onClick={() => handleDeleteRecord(apiTratamientos, r.id)} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                      ))}
                      {historial.tratamientos.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-300 mb-2">Vacunaciones</h3>
                  <table className="w-full data-table">
                    <thead><tr><th>Fecha</th><th>Observaciones</th><th>Próxima Dosis</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {historial.vacunaciones.map(r => (
                        <tr key={r.id}><td>{r.fecha}</td><td>{r.observacion}</td><td>{r.proximaDosis}</td><td><button onClick={() => handleDeleteRecord(apiVacunaciones, r.id)} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                      ))}
                      {historial.vacunaciones.length === 0 && <tr><td colSpan="4" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'eventos' && (
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Registro de Eventos</h3>
                  <button onClick={handleAddEvento} className="text-xs bg-brand-600 hover:bg-brand-500 text-white px-3 py-1 rounded">Añadir Evento</button>
                </div>
                <div className="space-y-3">
                  {historial.eventos.map(ev => (
                    <div key={ev.id} className="p-3 bg-dark-800 rounded-lg border border-dark-600 flex justify-between">
                      <div>
                        <div className="text-xs text-gray-400">{new Date(ev.fecha || new Date()).toLocaleString()}</div>
                        <div className="text-gray-200 mt-1">{ev.descripcion}</div>
                      </div>
                      <button onClick={() => handleDeleteRecord(apiEventos, ev.id)} className="text-red-400 text-xs hover:underline">Eliminar</button>
                    </div>
                  ))}
                  {historial.eventos.length === 0 && <div className="text-center text-gray-500 py-4">Sin eventos registrados</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GanadoDetail;
