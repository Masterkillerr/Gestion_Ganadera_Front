import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAnimales, getReproduccionById, createReproduccion, updateReproduccion,
  getPartosByReproduccion, createParto, updateParto, deleteParto,
  getTiposReproduccion, getResultadosReproduccion, getTiposEvento,
} from '../../services/ganadoService';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const INITIAL_FORM = {
  animalId: '',
  toroId: '',
  tipoReproduccionId: '',
  resultadoReproduccionId: '',
  fechaPartoEstimada: '',
  observacion: '',
};

export default function ReproduccionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [animales, setAnimales] = useState([]);
  const [tiposReproduccion, setTiposReproduccion] = useState([]);
  const [resultadosReproduccion, setResultadosReproduccion] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const overlay = useLoading();
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Partos sub-section
  const [partoError, setPartoError] = useState('');
  const [partos, setPartos] = useState([]);
  const [showPartoForm, setShowPartoForm] = useState(false);
  const [editingPartoId, setEditingPartoId] = useState(null);
  const [partoForm, setPartoForm] = useState({
    fechaParto: '',
    cantidadCrias: 1,
    observacion: '',
  });
  const [submittingParto, setSubmittingParto] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [aniData, tpRes, rpRes, teRes] = await Promise.all([
          getAnimales().catch(() => ({ content: [] })),
          getTiposReproduccion().catch(() => []),
          getResultadosReproduccion().catch(() => []),
          getTiposEvento().catch(() => []),
        ]);
        setAnimales(aniData?.content || aniData || []);
        setTiposReproduccion(tpRes);
        setResultadosReproduccion(rpRes);
        setTiposEvento(teRes);

        if (isEditing) {
          const r = await getReproduccionById(id);
          // Map string values to catalog IDs
          const tipoMatch = tpRes.find(t => t.nombre === r.tipoReproduccion);
          const resMatch = rpRes.find(t => t.nombre === r.resultadoReproduccion);
          setFormData({
            animalId: r.vacaId?.toString() || '',
            toroId: r.toroId?.toString() || '',
            tipoReproduccionId: tipoMatch?.id?.toString() || '',
            resultadoReproduccionId: resMatch?.id?.toString() || '',
            fechaPartoEstimada: r.fechaPartoEstimada || '',
            observacion: r.observacion || '',
          });

          // Load associated partos
          const partosRes = await getPartosByReproduccion(id).catch(() => []);
          setPartos(partosRes);
        }
      } catch (error) {
        const msg = apiError(error, 'Error al cargar datos');
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId) {
      setError('Seleccione una vaca');
      return;
    }

    setSubmitting(true);
    overlay.showLoading(isEditing ? 'Guardando cambios...' : 'Creando registro...');
    try {
      // 1. Buscar tipoEvento = "Reproducción" y crear Evento
      const tipoReproEvento = tiposEvento.find(te =>
        te.nombre?.toLowerCase().includes('reproduc')
      );
      const eventoPayload = {
        animalId: parseInt(formData.animalId),
        tipoEventoId: tipoReproEvento?.id || 1,
        descripcion: 'Registro reproductivo',
      };
      const evento = await api.post('/api/evento', eventoPayload);

      // 2. Crear Reproduccion con el eventoId
      const payload = {
        eventoId: evento.data.id,
        vacaId: parseInt(formData.animalId),
        toroId: formData.toroId ? parseInt(formData.toroId) : null,
        tipoReproduccionId: formData.tipoReproduccionId ? parseInt(formData.tipoReproduccionId) : null,
        resultadoReproduccionId: formData.resultadoReproduccionId ? parseInt(formData.resultadoReproduccionId) : null,
        fechaPartoEstimada: formData.fechaPartoEstimada || null,
        observacion: formData.observacion || null,
      };

      if (isEditing) {
        await updateReproduccion(id, payload);
      } else {
        await createReproduccion(payload);
      }
      navigate('/dashboard/reproduccion');
    } catch (error) {
      const msg = apiError(error, 'Error desconocido');
      setError(msg);
    } finally {
      setSubmitting(false);
      overlay.hideLoading();
    }
  };

  // ── Parto handlers ──
  const handlePartoChange = (e) => {
    const { name, value } = e.target;
    setPartoForm(prev => ({ ...prev, [name]: value }));
  };

  const resetPartoForm = () => {
    setPartoForm({ fechaParto: '', cantidadCrias: 1, observacion: '' });
    setEditingPartoId(null);
    setShowPartoForm(false);
    setPartoError('');
  };

  const handleEditParto = (parto) => {
    setPartoForm({
      fechaParto: parto.fechaParto || '',
      cantidadCrias: parto.cantidadCrias ?? 1,
      observacion: parto.observacion || '',
    });
    setEditingPartoId(parto.id);
    setShowPartoForm(true);
  };

  const handleSaveParto = async (e) => {
    e.preventDefault();
    if (!partoForm.fechaParto) {
      setPartoError('La fecha de parto es obligatoria');
      return;
    }
    setSubmittingParto(true);
    overlay.showLoading('Guardando parto...');
    try {
      // Cada Parto tiene su propio Evento con la fecha de parto
      const tipoPartoEvento = tiposEvento.find(te =>
        te.nombre?.toLowerCase().includes('parto')
      );
      const eventoPayload = {
        animalId: parseInt(formData.animalId),
        tipoEventoId: tipoPartoEvento?.id || 1,
        descripcion: 'Parto asociado a reproducción',
        fecha: partoForm.fechaParto + 'T00:00:00',
      };
      const evento = await api.post('/api/evento', eventoPayload);
      const eventoId = evento.data.id;

      if (editingPartoId) {
        const updated = await updateParto(editingPartoId, {
          eventoId,
          reproduccionId: parseInt(id),
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observacion: partoForm.observacion || null,
          fechaParto: partoForm.fechaParto,
        });
        setPartos(prev => prev.map(p => p.id === editingPartoId ? updated : p));
      } else {
        const newParto = await createParto({
          eventoId,
          reproduccionId: parseInt(id),
          fechaParto: partoForm.fechaParto,
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observacion: partoForm.observacion || null,
        });
        setPartos(prev => [...prev, newParto]);
      }
      resetPartoForm();
    } catch (error) {
      const msg = apiError(error, 'Error desconocido');
      setPartoError('Error al ' + (editingPartoId ? 'actualizar' : 'registrar') + ' parto: ' + msg);
    } finally {
      setSubmittingParto(false);
      overlay.hideLoading();
    }
  };

  const handleDeleteParto = async (partoId) => {
    try {
      await deleteParto(partoId);
      setPartos(prev => prev.filter(p => p.id !== partoId));
    } catch (error) {
      setPartoError('Error al eliminar parto');
    }
  };

  const vacas = animales.filter(a => a.sexo && a.sexo.toLowerCase().trim() === 'hembra');
  const toros = animales.filter(a => a.sexo === 'Macho');

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {isEditing ? 'Editar Registro Reproductivo' : 'Nuevo Registro Reproductivo'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Registro de monta, inseminación y control de gestación
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/reproduccion')} className="text-gray-400 hover:text-gray-100">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {error && (
          <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">Datos del Servicio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vaca */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Vaca <span className="text-red-400">*</span>
            </label>
            <select
              name="animalId"
              value={formData.animalId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione una vaca...</option>
              {vacas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Toro */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Toro</label>
            <select
              name="toroId"
              value={formData.toroId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccione un toro...</option>
              {toros.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo Reproducción */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select
              name="tipoReproduccionId"
              value={formData.tipoReproduccionId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccione...</option>
              {tiposReproduccion.map(tr => (
                <option key={tr.id} value={tr.id}>{tr.nombre || `Tipo #${tr.id}`}</option>
              ))}
            </select>
          </div>

          {/* Resultado */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Resultado</label>
            <select
              name="resultadoReproduccionId"
              value={formData.resultadoReproduccionId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">—</option>
              {resultadosReproduccion.map(rr => (
                <option key={rr.id} value={rr.id}>{rr.nombre || `Resultado #${rr.id}`}</option>
              ))}
            </select>
          </div>

          {/* Fecha Parto Estimada */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha Parto Estimada</label>
            <input
              type="date"
              name="fechaPartoEstimada"
              value={formData.fechaPartoEstimada}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            className="input-field min-h-[80px] resize-y"
            placeholder="Notas adicionales, detalles del servicio, etc."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/reproduccion')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/30 disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Registro')}
          </button>
        </div>
      </form>

      {/* ── Partos Section (only when editing) ── */}
      {isEditing && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-100">Partos Asociados</h2>              <button
                          type="button"
                          onClick={() => {
                            if (showPartoForm) resetPartoForm();
                            else setShowPartoForm(true);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/30"
                        >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showPartoForm ? 'Cancelar' : 'Registrar Parto'}
            </button>
          </div>

          {showPartoForm && (
            <form onSubmit={handleSaveParto} className="bg-dark-700/50 rounded-lg p-4 space-y-4 border border-dark-500">
              {partoError && (
                <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg flex items-center gap-3">
                  <span>{partoError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Fecha Parto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaParto"
                    value={partoForm.fechaParto}
                    onChange={handlePartoChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cant. Crías</label>
                  <input
                    type="number"
                    name="cantidadCrias"
                    value={partoForm.cantidadCrias}
                    onChange={handlePartoChange}
                    className="input-field"
                    min="1"
                    max="5"
                  />
                </div>
                <div className="flex items-end">                  <button
                          type="submit"
                          disabled={submittingParto}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-all duration-200 active:scale-95 shadow-lg shadow-rose-600/30 disabled:opacity-50 w-full"
                        >
                    {submittingParto ? 'Guardando...' : (editingPartoId ? 'Actualizar Parto' : 'Guardar Parto')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Observaciones del Parto</label>
                <textarea
                  name="observacion"
                  value={partoForm.observacion}
                  onChange={handlePartoChange}
                  className="input-field min-h-[60px] resize-y"
                  placeholder="Detalles del parto, complicaciones, etc."
                />
              </div>
            </form>
          )}

          {partos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/50">
                    <th className="text-left">Fecha Parto</th>
                    <th className="text-left">Crías</th>
                    <th className="text-left">Observaciones</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partos.map(p => (
                    <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-300">{p.fechaParto}</td>
                      <td className="text-gray-300">{p.cantidadCrias ?? '—'}</td>
                      <td className="text-gray-400 text-sm max-w-[300px] truncate">
                        {p.observacion || '—'}
                      </td>
                      <td className="text-right space-x-3">
                        <button
                          onClick={() => handleEditParto(p)}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          Editar
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
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay partos registrados para esta reproducción.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
