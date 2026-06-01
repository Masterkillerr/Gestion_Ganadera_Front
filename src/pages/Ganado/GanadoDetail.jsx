import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAnimalById, getUltimoLoteIdByAnimal,
  apiAlimentacion, apiProduccion, apiEventos,
  apiTratamientos, apiVacunaciones,
  getSexos, getDietas, getTurnosProduccion,
} from '../../services/ganadoService';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getTodayLocal } from '../../utils/date';

const GanadoDetail = () => {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [ultimoLote, setUltimoLote] = useState(null);
  const [activeTab, setActiveTab] = useState('alimentacion');
  const [sexoFiltro, setSexoFiltro] = useState('Hembra');

  const [historial, setHistorial] = useState({
    alimentacion: [], produccion: [], eventos: [], tratamientos: [], vacunaciones: []
  });
  const toast = useToast();

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal states for custom forms
  const [dietas, setDietas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [alimentacionForm, setAlimentacionForm] = useState({ open: false, fecha: '', dietaId: '', observacion: '' });
  const [produccionForm, setProduccionForm] = useState({ open: false, fecha: '', litros: '', turnoProduccionId: '' });
  const [eventoForm, setEventoForm] = useState({ open: false, fecha: '', descripcion: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [animalData, loteData, dietasData, turnosData] = await Promise.all([
        getAnimalById(id),
        getUltimoLoteIdByAnimal(id).catch(() => 'No asignado'),
        getDietas().catch(() => []),
        getTurnosProduccion().catch(() => []),
      ]);
      setAnimal(animalData);
      setUltimoLote(loteData);
      setDietas(Array.isArray(dietasData) ? dietasData : []);
      setTurnos(Array.isArray(turnosData) ? turnosData : []);

      setSexoFiltro(prev => animalData?.sexo === 'Macho' || animalData?.sexo === 'MACHO' ? 'Macho' : 'Hembra');

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
      toast.error(apiError(error, 'Error al cargar datos del animal'));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTarget.api.delete(deleteTarget.recordId);
      loadData();
    } catch (error) {
      toast.error(apiError(error, 'Error al eliminar registro'));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddAlimentacion = async () => {
    if (!alimentacionForm.fecha) {
      toast.error('La fecha es obligatoria');
      return;
    }
    try {
      await apiAlimentacion.create({
        animalId: parseInt(id),
        fecha: alimentacionForm.fecha + 'T00:00:00',
        dietaId: alimentacionForm.dietaId ? parseInt(alimentacionForm.dietaId) : null,
        observacion: alimentacionForm.observacion.trim() || null,
      });
      setAlimentacionForm({ open: false, fecha: '', dietaId: '', observacion: '' });
      loadData();
      toast.success('Registro de alimentación creado');
    } catch (error) {
      toast.error(apiError(error, 'Error al guardar alimentación'));
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
        turnoProduccionId: produccionForm.turnoProduccionId ? parseInt(produccionForm.turnoProduccionId) : null,
      });
      setProduccionForm({ open: false, fecha: '', litros: '', turnoProduccionId: '' });
      loadData();
      toast.success('Registro de producción creado');
    } catch (error) {
      toast.error(apiError(error, 'Error al guardar producción'));
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
        tipoEventoId: 10,
        fecha: eventoForm.fecha,
        descripcion: eventoForm.descripcion,
      });
      setEventoForm({ open: false, fecha: '', descripcion: '' });
      loadData();
      toast.success('Evento registrado');
    } catch (error) {
      toast.error(apiError(error, 'Error al guardar evento'));
    }
  };

  if (!animal) return <LoadingSpinner fullPage message="Cargando ficha..." />;

  const tabs = [
    { id: 'alimentacion', name: 'Alimentación' },
    { id: 'produccion', name: 'Producción' },
    { id: 'sanidad', name: 'Sanidad' },
    { id: 'eventos', name: 'Eventos' },
  ];

  const today = getTodayLocal();

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

      {/* ── Alimentación Modal (igual a OperacionesPage) ── */}
      {alimentacionForm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-100">Nueva Alimentación</h3>
              <button onClick={() => setAlimentacionForm({ open: false, fecha: '', dietaId: '', observacion: '' })} className="text-gray-400 hover:text-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Animal <span className="text-red-400">*</span></label>
                <input type="text" className="input-field" value={animal?.identificadorArete || `ID:${id}`} disabled />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dieta (opcional)</label>
                <select value={alimentacionForm.dietaId} onChange={e => setAlimentacionForm(p => ({ ...p, dietaId: e.target.value }))} className="input-field">
                  <option value="">Sin dieta</option>
                  {dietas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha <span className="text-red-400">*</span></label>
                <input type="date" value={alimentacionForm.fecha} onChange={e => setAlimentacionForm(p => ({ ...p, fecha: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Observación (opcional)</label>
                <textarea value={alimentacionForm.observacion} onChange={e => setAlimentacionForm(p => ({ ...p, observacion: e.target.value }))} className="input-field min-h-[60px]" placeholder="Notas..." />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
                <button type="button" onClick={() => setAlimentacionForm({ open: false, fecha: '', dietaId: '', observacion: '' })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
                <button onClick={handleAddAlimentacion} className="btn-primary">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Producción Modal (igual a OperacionesPage) ── */}
      {produccionForm.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" role="dialog" aria-modal="true">
          <div className="glass-card p-6 w-full max-w-md mx-4 animate-fade-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-100">Nueva Producción</h3>
              <button onClick={() => setProduccionForm({ open: false, fecha: '', litros: '', turnoProduccionId: '' })} className="text-gray-400 hover:text-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Animal <span className="text-red-400">*</span></label>
                <input type="text" className="input-field" value={animal?.identificadorArete || `ID:${id}`} disabled />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Litros <span className="text-red-400">*</span></label>
                <input type="number" step="0.1" min="0" value={produccionForm.litros} onChange={e => setProduccionForm(p => ({ ...p, litros: e.target.value }))} className="input-field" placeholder="0.0" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Turno</label>
                <select value={produccionForm.turnoProduccionId} onChange={e => setProduccionForm(p => ({ ...p, turnoProduccionId: e.target.value }))} className="input-field">
                  <option value="">Seleccione...</option>
                  {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha <span className="text-red-400">*</span></label>
                <input type="date" value={produccionForm.fecha} onChange={e => setProduccionForm(p => ({ ...p, fecha: e.target.value }))} className="input-field" required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-400">
                <button type="button" onClick={() => setProduccionForm({ open: false, fecha: '', litros: '', turnoProduccionId: '' })} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
                <button onClick={handleAddProduccion} className="btn-primary">Guardar</button>
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
              <span className={`${animal.sexo === 'HEMBRA' || animal.sexo === 'Hembra' ? 'badge-pink' : 'badge-blue'} badge text-sm flex items-center gap-1`}>
                <span className="text-lg">
                    {animal.sexo === 'HEMBRA' || animal.sexo === 'Hembra' ? '♀' : '♂'}
                </span>
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
              {/* Alimentación — igual estructura que OperacionesPage, filtrada por animal */}
              {activeTab === 'alimentacion' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">Historial de Alimentación</h3>
                    <button onClick={() => setAlimentacionForm({ open: true, fecha: today, dietaId: '', observacion: '' })} className="btn-primary text-xs py-2">+ Nueva Alimentación</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table">
                      <thead><tr className="bg-dark-800/80">
                        <th className="text-left">ID</th>
                        <th className="text-left">ID Animal</th>
                        <th className="text-left">Arete</th>
                        <th className="text-left">ID Dieta</th>
                        <th className="text-left">Dieta</th>
                        <th className="text-left">Fecha</th>
                        <th className="text-left">Observación</th>
                        <th className="text-right">Acciones</th>
                      </tr></thead>
                      <tbody className="divide-y divide-dark-500">
                        {historial.alimentacion.map(r => (
                          <tr key={r.id} className="hover:bg-dark-600/50 transition-colors">
                            <td className="text-sm text-gray-300">{r.id}</td>
                            <td className="text-sm text-gray-300">{r.animalId ?? '—'}</td>
                            <td className="text-sm text-gray-200 font-medium">{r.animalArete || animal?.identificadorArete || '—'}</td>
                            <td className="text-sm text-gray-300">{r.dietaId ?? '—'}</td>
                            <td className="text-sm text-gray-300">{r.dietaNombre || '—'}</td>
                            <td className="text-sm text-gray-300">{r.fecha ? r.fecha.substring(0, 10) : '—'}</td>
                            <td className="text-sm text-gray-400 max-w-[200px] truncate" title={r.observacion || ''}>{r.observacion || '—'}</td>
                            <td className="text-right"><button onClick={() => setDeleteTarget({ api: apiAlimentacion, recordId: r.id })} className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button></td>
                          </tr>
                        ))}
                        {historial.alimentacion.length === 0 && <tr><td colSpan="8" className="text-center text-gray-500 py-8">Sin registros de alimentación</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Producción — igual estructura que OperacionesPage, filtrada por animal */}
              {activeTab === 'produccion' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-300">Historial de Producción</h3>
                    <button onClick={() => setProduccionForm({ open: true, fecha: today, litros: '', turnoProduccionId: '' })} className="btn-primary text-xs py-2">+ Nueva Producción</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table">
                      <thead><tr className="bg-dark-800/80">
                        <th className="text-left">ID</th>
                        <th className="text-left">Animal</th>
                        <th className="text-left">Cantidad (L)</th>
                        <th className="text-left">Turno</th>
                        <th className="text-left">Fecha</th>
                        <th className="text-right">Acciones</th>
                      </tr></thead>
                      <tbody className="divide-y divide-dark-500">
                        {[...historial.produccion].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)).map(r => (
                          <tr key={r.id} className="hover:bg-dark-600/50 transition-colors">
                            <td className="text-sm text-gray-300">{r.id}</td>
                            <td className="text-sm text-gray-200 font-medium">{r.animalArete || animal?.identificadorArete || '—'}</td>
                            <td className="text-sm text-gray-300">{r.litros != null ? r.litros : '—'}</td>
                            <td className="text-sm text-gray-300">{r.turno || '—'}</td>
                            <td className="text-sm text-gray-300">{r.fecha ? r.fecha.substring(0, 10) : '—'}</td>
                            <td className="text-right"><button onClick={() => setDeleteTarget({ api: apiProduccion, recordId: r.id })} className="text-red-400 hover:text-red-300 text-xs font-medium">Eliminar</button></td>
                          </tr>
                        ))}
                        {historial.produccion.length === 0 && <tr><td colSpan="6" className="text-center text-gray-500 py-8">Sin registros de producción</td></tr>}
                      </tbody>
                    </table>
                  </div>
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
