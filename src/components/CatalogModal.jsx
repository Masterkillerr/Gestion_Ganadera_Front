import React, { useState, useEffect } from 'react';
import { createRaza, createFinca, createLote } from '../api/ganado';
import { useToast } from '../context/ToastContext';

const CatalogModal = ({ isOpen, onClose, type, onSave, fincas }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    finca: { id: '' },
    hectareas: '',
    capacidadMaxima: '',
    tipoPasto: '',
    estado: 'ACTIVO'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        finca: { id: '' },
        hectareas: '',
        capacidadMaxima: '',
        tipoPasto: '',
        estado: 'ACTIVO'
      });
      setError('');
    }
  }, [isOpen, type]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'finca') {
      setFormData({ ...formData, finca: value ? { id: parseInt(value) } : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let savedItem = null;
      if (type === 'Raza') {
        savedItem = await createRaza({ nombre: formData.nombre });
      } else if (type === 'Finca') {
        savedItem = await createFinca({ nombre: formData.nombre, ubicacion: formData.ubicacion });
      } else if (type === 'Lote') {
        savedItem = await createLote({
          nombre: formData.nombre,
          fincaId: formData.finca?.id || null,
          hectareas: formData.hectareas ? parseFloat(formData.hectareas) : null,
          capacidadMaxima: formData.capacidadMaxima ? parseInt(formData.capacidadMaxima) : null,
          tipoPasto: formData.tipoPasto,
          estado: formData.estado
        });
      }
      onSave(type, savedItem);
      onClose();
    } catch (err) {
      console.error(`Error guardando ${type}`, err);
      toast.error(`Error al guardar ${type}`);
      setError(err.response?.data?.message || `Ocurrió un error al guardar ${type}. Verifique que el nombre no esté duplicado.`);
    } finally {
      setSaving(false);
    }
  };

  const titlePrefix = type === 'Finca' ? 'Nueva' : 'Nuevo';

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${titlePrefix} ${type}`}
    >
      <div className="rounded-2xl border border-dark-400/40 bg-dark-800/60 backdrop-blur-xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">{titlePrefix} {type}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:text-gray-100 hover:bg-dark-600 transition-colors" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div role="alert" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-red-700/30 bg-red-950/40 px-4 py-3 mb-5 text-sm text-red-300 animate-slide-up">
            <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nombre *</label>
            <input required name="nombre" value={formData.nombre} onChange={handleChange} autoComplete="off" className="input-field" placeholder={`Nombre de ${type.toLowerCase()}`} />
          </div>

          {type === 'Finca' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Ubicación (Opcional)</label>
              <textarea name="ubicacion" value={formData.ubicacion} onChange={handleChange} autoComplete="off" className="input-field" placeholder="Añade la ubicación de la finca..." rows={2} />
            </div>
          )}

          {type === 'Lote' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Finca *</label>
                <select required name="finca" value={formData.finca?.id || ''} onChange={handleChange} className="input-field">
                  <option value="">Selecciona Finca...</option>
                  {fincas?.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Hectáreas</label>
                  <input type="number" step="0.01" name="hectareas" value={formData.hectareas} onChange={handleChange} autoComplete="off" className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Capacidad Máx.</label>
                  <input type="number" name="capacidadMaxima" value={formData.capacidadMaxima} onChange={handleChange} autoComplete="off" className="input-field" placeholder="Animales" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tipo de Pasto (Opcional)</label>
                <input name="tipoPasto" value={formData.tipoPasto} onChange={handleChange} autoComplete="off" className="input-field" placeholder="Ej: Estrella, Brachiaria" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="input-field">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-400/30 mt-6">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary px-4 py-2">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Guardando...
                </span>
              ) : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogModal;
