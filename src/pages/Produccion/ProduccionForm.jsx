import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getAnimales, getProducciones, apiProduccion, updateProduccion, getTurnosProduccion } from '../../api/ganado';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const ProduccionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [animales, setAnimales] = useState([]);
  const [turnosProduccion, setTurnosProduccion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const overlay = useLoading();

  const [formData, setFormData] = useState({
    animalId: '',
    litros: '',
    turnoProduccionId: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [aniData, tpData] = await Promise.all([
          getAnimales().catch(() => []),
          getTurnosProduccion().catch(() => []),
        ]);
        setAnimales(aniData);
        setTurnosProduccion(tpData);

        if (isEditing) {
          const allProduccion = await getProducciones().catch(() => []);
          const record = allProduccion.find(p => p.id === parseInt(id));
          if (record) {
            // Map turno string to turnoProduccionId
            const turnoMatch = tpData.find(t => t.nombre === record.turno);
            setFormData({
              animalId: record.animalId?.toString() || '',
              litros: record.litros?.toString() || '',
              turnoProduccionId: turnoMatch?.id?.toString() || '',
              fecha: record.fecha || new Date().toISOString().split('T')[0],
            });
          }
        }
      } catch (error) {
        console.error('Error cargando datos', error);
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.litros || !formData.fecha) {
      setError('Por favor complete todos los campos obligatorios: Animal, Litros y Fecha');
      return;
    }

    const litros = parseFloat(formData.litros);
    if (isNaN(litros) || litros <= 0) {
      setError('Ingrese una cantidad válida de litros (mayor a 0)');
      return;
    }

    setSubmitting(true);
    overlay.showLoading(isEditing ? 'Actualizando producción...' : 'Registrando producción...');
    try {
      const payload = {
        animalId: parseInt(formData.animalId),
        litros: litros,
        turnoProduccionId: formData.turnoProduccionId ? parseInt(formData.turnoProduccionId) : null,
        fecha: formData.fecha,
      };

      if (isEditing) {
        await updateProduccion(parseInt(id), payload);
      } else {
        await apiProduccion.create(payload);
      }
      navigate('/dashboard/produccion');
    } catch (error) {
      console.error('Error guardando producción', error);
      toast.error('Error al guardar producción');
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      setError(msg);
    } finally {
      setSubmitting(false);
      overlay.hideLoading();
    }
  };

  const selectedAnimal = animales.find(a => a.id === parseInt(formData.animalId));

  const hembras = animales.filter(a => a.sexo === 'Hembra');

  if (loading) return <LoadingSpinner fullPage message="Cargando..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {isEditing ? 'Editar Registro de Producción' : 'Nuevo Registro de Producción'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Registrar producción de leche por animal y turno
          </p>
        </div>
        <Link
          to="/dashboard/produccion"
          className="text-gray-400 hover:text-gray-100"
        >
          Volver
        </Link>
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
          Datos de Producción
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
              autoComplete="off"
              className="input-field"
              required
            >
              <option value="">Seleccione un animal...</option>
              {hembras.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAnimal && (
              <p className="text-xs text-gray-500 mt-1">
                🐮 {selectedAnimal.razaNombre || 'Sin raza'} —{' '}
                {selectedAnimal.loteNombre ? `Lote: ${selectedAnimal.loteNombre}` : 'Sin lote'}
              </p>
            )}
            {hembras.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                No hay hembras registradas. Debes registrar animales hembra para registrar producción.
              </p>
            )}
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Turno
            </label>
            <select
              name="turnoProduccionId"
              value={formData.turnoProduccionId}
              onChange={handleChange}
              autoComplete="off"
              className="input-field"
            >
              <option value="">Seleccione un turno...</option>
              {turnosProduccion.map(tp => (
                <option key={tp.id} value={tp.id}>{tp.nombre || `Turno #${tp.id}`}</option>
              ))}
            </select>
          </div>

          {/* Litros */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Litros <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="litros"
              value={formData.litros}
              onChange={handleChange}
              autoComplete="off"
              className="input-field"
              placeholder="0.0"
              min="0"
              step="0.1"
              required
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              autoComplete="off"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/produccion')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting
              ? 'Guardando...'
              : isEditing ? 'Actualizar Registro' : 'Registrar Producción'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProduccionForm;
