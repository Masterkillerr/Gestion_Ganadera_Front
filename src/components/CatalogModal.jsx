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

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Nuev${type === 'Finca' ? 'a' : 'o'} ${type}`}
    >
      <div className="glass-card p-6 w-full max-w-md animate-fade-up">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Nuev{type === 'Finca' ? 'a' : 'o'} {type}</h2>
        
        {error && (
          <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 flex items-center gap-3 animate-fade-up">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
            <input required name="nombre" value={formData.nombre} onChange={handleChange} autoComplete="off" className="input-field" placeholder={`Nombre de la ${type}`} />
          </div>

          {type === 'Finca' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ubicación (Opcional)</label>
              <textarea name="ubicacion" value={formData.ubicacion} onChange={handleChange} autoComplete="off" className="input-field" placeholder="Añada la ubicación de la finca..." />
            </div>
          )}

          {type === 'Lote' && (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Finca *</label>
                <select required name="finca" value={formData.finca?.id || ''} onChange={handleChange} className="input-field">
                  <option value="">Seleccione Finca...</option>
                  {fincas?.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Hectáreas (Opcional)</label>
                <input type="number" step="0.01" name="hectareas" value={formData.hectareas} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Capacidad Máxima (Animales) (Opcional)</label>
                <input type="number" name="capacidadMaxima" value={formData.capacidadMaxima} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de Pasto (Opcional)</label>
                <input name="tipoPasto" value={formData.tipoPasto} onChange={handleChange} autoComplete="off" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="input-field">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-600 mt-4">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CatalogModal;
