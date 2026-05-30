import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAnimalById, getUltimoLoteIdByAnimal,
  apiAlimentacion, apiProduccion, apiEventos,
  apiTratamientos, apiVacunaciones,
  getSexos,
} from '../../api/ganado';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const GanadoDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [ultimoLote, setUltimoLote] = useState(null);
  const [activeTab, setActiveTab] = useState('alimentacion');
  const [sexos, setSexos] = useState([]);

  const [historial, setHistorial] = useState({
    alimentacion: [], produccion: [], eventos: [], tratamientos: [], vacunaciones: []
  });
  const toast = useToast();

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal states for custom forms
  const [alimentacionForm, setAlimentacionForm] = useState({ open: false, fecha: '', cantidad: '', observacion: '' });
  const [produccionForm, setProduccionForm] = useState({ open: false, fecha: '', litros: '', turno: '' });
  const [eventoForm, setEventoForm] = useState({ open: false, fecha: '', descripcion: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [animalData, loteData, sexosData] = await Promise.all([
        getAnimalById(id),
        getUltimoLoteIdByAnimal(id).catch(() => 'No asignado'),
        getSexos().catch(() => []),
      ]);
      setAnimal(animalData);
      setUltimoLote(loteData);
      setSexos(sexosData);

      const [ali, prod, ev, trat, vac] = await Promise.all([
        apiAlimentacion.getByAnimal(id),
        apiProduccion.getByAnimal(id),
        apiEventos.getByAnimal(id),
        apiTratamientos.getByAnimal(id),
        apiVacunaciones.getByAnimal(id),
      ]);
      setHistorial({
        alimentacion: ali, produccion: prod, eventos: ev,
        tratamientos: trat, vacunaciones: vac,
      });
    } catch (error) {
      console.error('Error cargando ficha', error);
      toast.error('Error al cargar datos del animal');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTarget.api.delete(deleteTarget.recordId);
      loadData();
    } catch (error) {
      console.error('Error al eliminar', error);
      toast.error('Error al eliminar registro');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddAlimentacion = async () => {
    if (!alimentacionForm.cantidad || !alimentacionForm.fecha) {
      toast.error('Cantidad y fecha son obligatorios');
      return;
    }
    try {
      await apiAlimentacion.create({
        animalId: parseInt(id),
        fecha: alimentacionForm.fecha,
        cantidad: parseFloat(alimentacionForm.cantidad),
        observacion: alimentacionForm.observacion || undefined,
      });
      setAlimentacionForm({ open: false, fecha: '', cantidad: '', observacion: '' });
      loadData();
      toast.success('Registro de alimentación creado');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleAddProduccion = async () => {
    if (!produccionForm.litros || !produccionForm.fecha) {
      toast.error('Litros y fecha son obligatorios');
      return;
    }
    try {
      await apiProduccion.create({
        animalId: parseInt(id),
        fecha: produccionForm.fecha,
        litros: parseFloat(produccionForm.litros),
      });
      setProduccionForm({ open: false, fecha: '', litros: '', turno: '' });
      loadData();
      toast.success('Registro de producción creado');
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleAddEvento = async () => {
    if (!eventoForm.fecha || !eventoForm.descripcion) {
      toast.error('Fecha y descripción son obligatorios');
      return;
    }
    try {
      await apiEventos.create({
        animalId: parseInt(id),
        tipo: 'General',
        tipoId: 10,
        fecha: eventoForm.fecha,
        descripcion: eventoForm.descripcion,
      });
      setEventoForm({ open: false, fecha: '', descripcion: '' });
      loadData();
      toast.success('Evento registrado');
    } catch (error) {
      toast.error('Error al guardar evento');
    }
  };

  if (!animal) return <LoadingSpinner fullPage message="Cargando ficha..." />;

  const tabs = [
    { id: 'alimentacion', name: 'Alimentación' },
    { id: 'produccion', name: 'Producción' },
    { id: 'sanidad', name: 'Sanidad' },
    { id: 'eventos', name: 'Eventos' },
  ];

  const today = new Date().toISOString().split('T')[0];

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

      {/* ── Alimentación Modal ── */}
      {alimentacionForm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
            <h3 className="text-lg font-display font-semibold text-white mb-5">Nuevo Registro de Alimentación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Fecha</label>
                <input type="date" className="input-field" value={alimentacionForm.fecha}
                  onChange={e => setAlimentacionForm({ ...alimentacionForm, fecha: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Cantidad (kg)</label>
                <input type="number" className="input-field" placeholder="Ej: 25" value={alimentacionForm.cantidad}
                  onChange={e => setAlimentacionForm({ ...alimentacionForm, cantidad: e.target.value })} min="0" step="0.1" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Observación</label>
                <textarea className="input-field" rows="2" placeholder="Opcional"
                  value={alimentacionForm.observacion}
                  onChange={e => setAlimentacionForm({ ...alimentacionForm, observacion: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddAlimentacion} className="btn-primary flex-1 justify-center">Guardar</button>
                <button onClick={() => setAlimentacionForm({ open: false, fecha: '', cantidad: '', observacion: '' })} className="px-4 py-2 rounded-2xl bg-surface-600 text-gray-300 text-sm hover:bg-surface-500 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Producción Modal ── */}
      {produccionForm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
            <h3 className="text-lg font-display font-semibold text-white mb-5">Nuevo Registro de Producción</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Fecha</label>
                <input type="date" className="input-field" value={produccionForm.fecha}
                  onChange={e => setProduccionForm({ ...produccionForm, fecha: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Litros</label>
                <input type="number" className="input-field" placeholder="Ej: 22.5" value={produccionForm.litros}
                  onChange={e => setProduccionForm({ ...produccionForm, litros: e.target.value })} min="0" step="0.1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddProduccion} className="btn-primary flex-1 justify-center">Guardar</button>
                <button onClick={() => setProduccionForm({ open: false, fecha: '', litros: '', turno: '' })} className="px-4 py-2 rounded-2xl bg-surface-600 text-gray-300 text-sm hover:bg-surface-500 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Evento Modal (custom: fecha + descripción, tipo fijo "General" id=10) ── */}
      {eventoForm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
            <h3 className="text-lg font-display font-semibold text-white mb-5">Nuevo Evento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Fecha del evento</label>
                <input type="date" className="input-field" value={eventoForm.fecha}
                  onChange={e => setEventoForm({ ...eventoForm, fecha: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-2">Descripción</label>
                <textarea className="input-field" rows="3" placeholder="Describe lo ocurrido..."
                  value={eventoForm.descripcion}
                  onChange={e => setEventoForm({ ...eventoForm, descripcion: e.target.value })} />
                <p className="text-[10px] text-gray-600 mt-1.5">Tipo de evento: General (fijo)</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddEvento} className="btn-primary flex-1 justify-center">Guardar Evento</button>
                <button onClick={() => setEventoForm({ open: false, fecha: '', descripcion: '' })} className="px-4 py-2 rounded-2xl bg-surface-600 text-gray-300 text-sm hover:bg-surface-500 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
              {animal.identificadorArete || `ID:${animal.id}`}{animal.nombre ? ` - ${animal.nombre}` : ''}
              <span className={`${animal.sexo === 'HEMBRA' || animal.sexo === 'Hembra' ? 'badge-pink' : 'badge-blue'} badge text-sm`}>
                {animal.sexo || 'Sin sexo'}
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Ficha completa e historial</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/dashboard/ganado/editar/${animal.id}`} className="btn-primary">Editar Animal</Link>
            <Link to="/dashboard/ganado" className="px-4 py-2 text-gray-400 hover:text-gray-100 text-sm">Volver</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar info */}
          <div className="glass-card p-6 md:col-span-1 space-y-4">
            <div className="w-full aspect-square bg-surface-800 rounded-2xl mb-4 flex items-center justify-center text-gray-600 overflow-hidden border border-surface-400/30">
              {animal.fotoUrl ? <img src={animal.fotoUrl} alt={animal.nombre || 'Animal'} className="w-full h-full object-cover" /> : (
                <svg className="w-16 h-16 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div><span className="text-[11px] text-gray-500 uppercase tracking-wider block">Raza</span><span className="text-gray-200">{animal.razaNombre || 'No asignada'}</span></div>
            <div><span className="text-[11px] text-gray-500 uppercase tracking-wider block">Lote</span><span className="text-gray-200">{ultimoLote || 'No asignado'}</span></div>
            <div><span className="text-[11px] text-gray-500 uppercase tracking-wider block">Peso Actual</span><span className="text-gray-200">{animal.pesoActualKg ? `${animal.pesoActualKg} kg` : 'N/A'}</span></div>
            <div className="pt-3 border-t border-surface-400/30">
              <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">Genealogía</span>
              <div className="mt-2 text-sm space-y-1">
                <div><span className="text-gray-500">Madre:</span> {animal.madreArete || (animal.madreId ? `ID ${animal.madreId}` : 'Desconocida')}</div>
                <div><span className="text-gray-500">Padre:</span> {animal.padreArete || (animal.padreId ? `ID ${animal.padreId}` : 'Desconocido')}</div>
              </div>
            </div>
          </div>

          {/* Main content + tabs */}
          <div className="glass-card md:col-span-2 flex flex-col">
            <div className="flex border-b border-surface-400/30">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 relative ${activeTab === tab.id ? 'text-brand-400' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  {tab.name}
                  {activeTab === tab.id && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full" />}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {/* Alimentación — sin botón Añadir integrado, solo historial */}
              {activeTab === 'alimentacion' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">Historial de Alimentación</h3>
                    <button onClick={() => setAlimentacionForm({ open: true, fecha: today, cantidad: '', observacion: '' })} className="btn-primary text-xs py-2">Añadir Registro</button>
                  </div>
                  <table className="w-full data-table">
                    <thead><tr><th>Fecha</th><th>Cantidad (kg)</th><th>Observación</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {historial.alimentacion.map(r => (
                        <tr key={r.id}><td className="text-xs">{r.fecha}</td><td className="text-xs">{r.cantidad}</td><td className="text-xs text-gray-400">{r.observacion || '—'}</td><td><button onClick={() => setDeleteTarget({ api: apiAlimentacion, recordId: r.id })} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                      ))}
                      {historial.alimentacion.length === 0 && <tr><td colSpan="4" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Producción — sin botón Añadir integrado, solo historial */}
              {activeTab === 'produccion' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">Historial de Producción</h3>
                    <button onClick={() => setProduccionForm({ open: true, fecha: today, litros: '', turno: '' })} className="btn-primary text-xs py-2">Añadir Registro</button>
                  </div>
                  <table className="w-full data-table">
                    <thead><tr><th>Fecha</th><th>Litros</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {historial.produccion.map(r => (
                        <tr key={r.id}><td className="text-xs">{r.fecha}</td><td className="text-xs">{r.litros}</td><td><button onClick={() => setDeleteTarget({ api: apiProduccion, recordId: r.id })} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                      ))}
                      {historial.produccion.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sanidad */}
              {activeTab === 'sanidad' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-3">Tratamientos</h3>
                    <table className="w-full data-table">
                      <thead><tr><th>Fecha Inicio</th><th>Observaciones</th><th>Acciones</th></tr></thead>
                      <tbody>
                        {historial.tratamientos.map(r => (
                          <tr key={r.id}><td className="text-xs">{r.fechaInicio}</td><td className="text-xs">{r.observacion || '—'}</td><td><button onClick={() => setDeleteTarget({ api: apiTratamientos, recordId: r.id })} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                        ))}
                        {historial.tratamientos.length === 0 && <tr><td colSpan="3" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-3">Vacunaciones</h3>
                    <table className="w-full data-table">
                      <thead><tr><th>Fecha</th><th>Observaciones</th><th>Próxima Dosis</th><th>Acciones</th></tr></thead>
                      <tbody>
                        {historial.vacunaciones.map(r => (
                          <tr key={r.id}><td className="text-xs">{r.fecha}</td><td className="text-xs">{r.observacion || '—'}</td><td className="text-xs">{r.proximaDosis || '—'}</td><td><button onClick={() => setDeleteTarget({ api: apiVacunaciones, recordId: r.id })} className="text-red-400 text-xs hover:underline">Eliminar</button></td></tr>
                        ))}
                        {historial.vacunaciones.length === 0 && <tr><td colSpan="4" className="text-center text-gray-500 py-4">Sin registros</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Eventos — con modal personalizado, tipo fijo General (id 10) */}
              {activeTab === 'eventos' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">Registro de Eventos</h3>
                    <button onClick={() => setEventoForm({ open: true, fecha: today, descripcion: '' })} className="btn-primary text-xs py-2">Añadir Evento</button>
                  </div>
                  <div className="space-y-2.5">
                    {historial.eventos.map(ev => (
                      <div key={ev.id} className="p-4 bg-surface-800/60 rounded-xl border border-surface-400/35 flex justify-between items-start hover:border-surface-400/60 transition-colors">
                        <div>
                          <div className="text-[11px] text-gray-500 font-body mb-1">
                            {ev.fecha ? new Date(ev.fecha.split('T')[0] + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                          <div className="text-sm text-gray-200">{ev.descripcion}</div>
                          {ev.tipo && <span className="text-[10px] text-brand-400 mt-1 inline-block">{ev.tipo}</span>}
                        </div>
                        <button onClick={() => setDeleteTarget({ api: apiEventos, recordId: ev.id })} className="text-red-400 text-xs hover:underline shrink-0 ml-3">Eliminar</button>
                      </div>
                    ))}
                    {historial.eventos.length === 0 && <div className="text-center text-gray-500 py-6 text-sm">Sin eventos registrados</div>}
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
