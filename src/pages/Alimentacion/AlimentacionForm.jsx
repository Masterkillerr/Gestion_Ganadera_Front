import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAnimales, apiAlimentacion } from '../../services/ganadoService';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';
import { apiError } from '../../lib/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getTodayLocal } from '../../utils/date';

const AlimentacionForm = () => {
  const navigate = useNavigate();

  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const overlay = useLoading();

  const [formData, setFormData] = useState({
    animalId: '',
    alimento: '',
    cantidad: '',
    fecha: getTodayLocal(),
    observacion: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const aniRes = await getAnimales().catch(() => ({ content: [] }));
        setAnimales(aniRes?.content || aniRes || []);
      } catch (error) {
        toast.error(apiError(error, 'Error al cargar datos'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.cantidad || !formData.fecha) {
      setError('Por favor complete los campos obligatorios: Animal, Cantidad y Fecha');
      return;
    }

    const cantidad = parseFloat(formData.cantidad);
    if (isNaN(cantidad) || cantidad <= 0) {
      setError('Ingrese una cantidad válida (mayor a 0)');
      return;
    }

    setSubmitting(true);
    setError('');
    overlay.showLoading('Registrando alimentación...');
    try {
      const payload = {
        animalId: parseInt(formData.animalId),
        alimento: formData.alimento || null,
        cantidad: cantidad,
        fecha: formData.fecha,
        observacion: formData.observacion || null,
      };

      await apiAlimentacion.create(payload);
      navigate('/dashboard/operaciones');
    } catch (error) {
      toast.error(apiError(error, 'Error al guardar alimentación'));
      setError(apiError(error, 'Error al guardar alimentación'));
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
          <h1 className="text-2xl font-bold text-gray-100">Nuevo Registro de Alimentación</h1>
          <p className="text-gray-400 text-sm mt-1">
            Registrar alimentación de un animal
          </p>
        </div>
        <Link
          to="/dashboard/operaciones"
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
          Datos de Alimentación
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
              {animales.filter(a => a.sexo === 'HEMBRA').map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAnimal && (
              <p className="text-xs text-gray-500 mt-1">
                🐮 {selectedAnimal.razaNombre || 'Sin raza'} —{' '}
                {selectedAnimal.sexo || 'Sin género'}
              </p>
            )}
          </div>

          {/* Alimento */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Alimento <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="alimento"
              value={formData.alimento}
              onChange={handleChange}
              autoComplete="off"
              className="input-field"
              placeholder="Ej. Concentrado, Pasto, Heno..."
              required
            />
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Cantidad (kg) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
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

        {/* Observación */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Observación (opcional)</label>
          <textarea
            name="observacion"
            value={formData.observacion}
            onChange={handleChange}
            autoComplete="off"
            className="input-field min-h-[80px] resize-y"
            placeholder="Notas adicionales sobre la alimentación..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/operaciones')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Registrar Alimentación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlimentacionForm;
