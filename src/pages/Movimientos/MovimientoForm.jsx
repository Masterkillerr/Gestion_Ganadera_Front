import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnimales, getLotes, createMovimiento, getTiposMovimiento, getTiposEvento, getUltimoLoteIdByAnimal } from '../../services/ganadoService';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const MovimientoForm = () => {
  const navigate = useNavigate();

  const [animales, setAnimales] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const overlay = useLoading();

  const [formData, setFormData] = useState({
    animalId: '',
    loteOrigenId: '',
    loteDestinoId: '',
    tipoMovimientoId: '',
    motivo: '',
  });

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [aniData, lotRes, tmRes, teRes] = await Promise.all([
          getAnimales(0, 9999).catch(() => { console.warn('[MovimientoForm] Error cargando animales'); return { content: [] }; }),
          getLotes().catch(() => { console.warn('[MovimientoForm] Error cargando lotes'); return []; }),
          getTiposMovimiento().catch(() => { console.warn('[MovimientoForm] Error cargando tipos movimiento'); return []; }),
          getTiposEvento().catch(() => { console.warn('[MovimientoForm] Error cargando tipos evento'); return []; }),
        ]);
        setAnimales(aniData?.content || aniData || []);
        setLotes(lotRes);
        setTiposMovimiento(tmRes);
        setTiposEvento(teRes);
      } catch (error) {
        toast.error(apiError(error, 'Error al cargar datos'));
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // When an animal is selected, auto-set loteOrigenId using the dedicated endpoint
    if (name === 'animalId' && value) {
      const selectedAnimal = animales.find(a => a.id === parseInt(value));
      if (selectedAnimal) {
        getUltimoLoteIdByAnimal(selectedAnimal.id).then(loteId => {
          setFormData(prev => {
            if (prev.animalId !== value) return prev;
            return {
              ...prev,
              loteOrigenId: loteId ? loteId.toString() : '',
            };
          });
        }).catch(() => {
          setFormData(prev => {
            if (prev.animalId !== value) return prev;
            return { ...prev, loteOrigenId: '' };
          });
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.loteDestinoId) {
      setError('Por favor complete los campos obligatorios: Animal y Lote Destino');
      return;
    }

    // Verificar capacidad del lote destino
    try {
      const capacityRes = await api.get(`/api/movimiento/lote/${parseInt(formData.loteDestinoId)}/capacity`);
      const { hasSpace, occupancy } = capacityRes.data;
      if (!hasSpace) {
        setError(`El lote de destino no tiene espacio disponible. Ocupación actual: ${occupancy}`);
        return;
      }
    } catch (capErr) {
      console.debug('Capacity check skipped for lote', formData.loteDestinoId, capErr);
      // Continuar de todas formas si no se puede verificar
    }

    setSubmitting(true);
    overlay.showLoading('Registrando movimiento...');
    try {
      // 1. Buscar tipoEvento = "Movimiento" y crear Evento
      const tipoMovimientoEvento = tiposEvento.find(te =>
        te.nombre?.toLowerCase().includes('movimiento')
      );
      const eventoPayload = {
        animalId: parseInt(formData.animalId),
        tipoEventoId: tipoMovimientoEvento?.id || 1,
        descripcion: formData.motivo || 'Movimiento de lote',
      };
      const evento = await api.post('/api/evento', eventoPayload);

      // 2. Crear Movimiento con el eventoId
      const payload = {
        eventoId: evento.data.id,
        tipoMovimientoId: formData.tipoMovimientoId ? parseInt(formData.tipoMovimientoId) : null,
        loteOrigenId: formData.loteOrigenId ? parseInt(formData.loteOrigenId) : null,
        loteDestinoId: parseInt(formData.loteDestinoId),
        motivo: formData.motivo || null,
      };
      await createMovimiento(payload);
      navigate('/dashboard/movimientos');
    } catch (error) {
      const msg = apiError(error, 'Error al guardar movimiento');
      setError(msg);
    } finally {
      setSubmitting(false);
      overlay.hideLoading();
    }
  };

  const selectedAnimal = animales.find(a => a.id === parseInt(formData.animalId));

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Registrar Movimiento</h1>
          <p className="text-gray-400 text-sm mt-1">
            Traslado o transferencia de un animal entre lotes
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/movimientos')} className="text-gray-400 hover:text-gray-100">
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
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">
          Datos del Movimiento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Animal */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Animal <span className="text-red-400">*</span>
            </label>
            <select
              name="animalId"
              value={formData.animalId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione un animal...</option>
              {animales.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAnimal && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedAnimal.sexo && selectedAnimal.sexo.toLowerCase().trim() === 'hembra' ? '🐮 Hembra' : '🐮 Macho'}
              </p>
            )}
          </div>

          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo de Movimiento</label>
            <select
              name="tipoMovimientoId"
              value={formData.tipoMovimientoId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccione...</option>
              {tiposMovimiento.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.nombre || `Tipo #${tm.id}`}</option>
              ))}
            </select>
          </div>

          {/* Lote Origen */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Lote de Origen (Auto)</label>
            <select
              name="loteOrigenId"
              value={formData.loteOrigenId}
              onChange={handleChange}
              className="input-field disabled:opacity-50"
              disabled
            >
              <option value="">No especificado</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>{l.nombre || `Lote #${l.id}`}</option>
              ))}
            </select>
          </div>

          {/* Lote Destino */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Lote de Destino <span className="text-red-400">*</span>
            </label>
            <select
              name="loteDestinoId"
              value={formData.loteDestinoId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione un lote...</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>{l.nombre || `Lote #${l.id}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Motivo (opcional)</label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            autoComplete="off"
            className="input-field min-h-[80px] resize-y"
            placeholder="Razón del movimiento, observaciones..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/movimientos')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Registrar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovimientoForm;
