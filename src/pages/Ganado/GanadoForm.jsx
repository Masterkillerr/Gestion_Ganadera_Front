import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAnimales, getAnimalById, createAnimal, updateAnimal, getRazas, getLotes, getFincas, getSexos, getEstadosAnimal, checkLoteCapacity, apiEventos, createMovimiento, getTiposEvento, getTiposMovimiento } from '../../services/ganadoService';
import { getTodayLocal } from '../../utils/date';
import CatalogModal from '../../components/CatalogModal';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';
import { apiError } from '../../lib/api';

const GanadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    identificadorArete: '',
    nombre: '',
    sexo: 'Hembra',
    fechaNacimiento: '',
    pesoActualKg: '',
    estado: '',
    fotoUrl: '',
    razaId: '',
    madreId: '',
    padreId: ''
  });

  const [catalogs, setCatalogs] = useState({
    sexos: [], estadosAnimal: [], razas: [], lotes: [], fincas: [], madres: [], padres: [],
    tiposEvento: [], tiposMovimiento: []
  });

  const [error, setError] = useState('');
  const toast = useToast();
  const loading = useLoading();
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  const handleSaveCatalogItem = (type, newItem) => {
    if (type === 'Raza') {
      setCatalogs(prev => ({ ...prev, razas: [...prev.razas, newItem] }));
      setFormData(prev => ({ ...prev, razaId: newItem.id }));
    } else if (type === 'Finca') {
      setCatalogs(prev => ({ ...prev, fincas: [...prev.fincas, newItem] }));
    } else if (type === 'Lote') {
      setCatalogs(prev => ({ ...prev, lotes: [...prev.lotes, newItem] }));
    }
  };

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [sxRes, eaRes, razRes, lotRes, finRes, aniData, teRes, tmRes] = await Promise.all([
          getSexos().catch(() => []),
          getEstadosAnimal().catch(() => []),
          getRazas().catch(() => []),
          getLotes().catch(() => []),
          getFincas().catch(() => []),
          getAnimales().catch(() => ({ content: [] })),
          getTiposEvento().catch(() => []),
          getTiposMovimiento().catch(() => [])
        ]);
        const aniRes = aniData?.content || aniData || [];
        setCatalogs({
          sexos: sxRes,
          estadosAnimal: eaRes,
          razas: razRes,
          lotes: lotRes,
          fincas: finRes,
          madres: aniRes.filter(a => a.sexo && a.sexo.toLowerCase().trim() === 'hembra' && a.id !== parseInt(id)),
          padres: aniRes.filter(a => a.sexo && a.sexo.toLowerCase().trim() === 'macho' && a.id !== parseInt(id)),
          tiposEvento: teRes,
          tiposMovimiento: tmRes
        });
      } catch (error) {
        toast.error(apiError(error, 'Error al cargar catálogos'));
      }
    };
    loadCatalogs();

    if (isEditing) {
      getAnimalById(id).then(data => {
        // Convert sexo string to our select value
        const sexoValue = data.sexo === 'Macho' ? 'Macho' : 'Hembra';
        setFormData({
          identificadorArete: data.identificadorArete || '',
          nombre: data.nombre || '',
          sexo: sexoValue,
          fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '',

          pesoActualKg: data.pesoActualKg || '',
          estado: data.estadoAnimal || '',
          fotoUrl: data.fotoUrl || '',
          razaId: catalogs.razas.find(r => r.nombre === data.razaNombre)?.id || '',

          madreId: data.madreId || '',
          padreId: data.padreId || ''
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getSexoId = (sexoName) => {
    const found = catalogs.sexos.find(s => s.nombre === sexoName);
    return found?.id || 1;
  };

  const getEstadoAnimalId = (estadoName) => {
    const found = catalogs.estadosAnimal.find(e => e.nombre === estadoName);
    return found?.id || 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    loading.showLoading(isEditing ? 'Actualizando animal...' : 'Guardando animal...');
    try {
      const payload = {
        identificadorArete: formData.identificadorArete,
        nombre: formData.nombre,
        sexoId: getSexoId(formData.sexo),
        estadoAnimalId: getEstadoAnimalId(formData.estado),
        razaId: parseInt(formData.razaId) || null,
        fechaNacimiento: formData.fechaNacimiento || null,
        pesoActualKg: formData.pesoActualKg ? parseFloat(formData.pesoActualKg) : null,
        fotoUrl: formData.fotoUrl || null,
        madreId: formData.madreId ? parseInt(formData.madreId) : null,
        padreId: formData.padreId ? parseInt(formData.padreId) : null
      };



      let animalId;
      if (isEditing) {
        await updateAnimal(id, payload);
        animalId = parseInt(id);
      } else {
        const created = await createAnimal(payload);
        animalId = created.id;
      }


      navigate('/dashboard/ganado');
    } catch (error) {
      const msg = apiError(error, 'Error al guardar animal');
      toast.error(msg);
      setError(msg);
    } finally {
      loading.hideLoading();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">{isEditing ? 'Editar Animal' : 'Nuevo Animal'}</h1>
        <Link to="/dashboard/ganado" className="text-gray-400 hover:text-gray-100">Volver</Link>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">Información Básica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="identificadorArete" className="block text-sm text-gray-400 mb-1">Arete / Identificador</label>
            <input id="identificadorArete" name="identificadorArete" value={formData.identificadorArete || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label htmlFor="nombre" className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input id="nombre" name="nombre" value={formData.nombre || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label htmlFor="sexo" className="block text-sm text-gray-400 mb-1">Sexo</label>
            <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} className="input-field">
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>          <div>
            <label className="block text-sm text-gray-400 mb-1">Peso Actual (kg)</label>
            <input type="number" step="0.01" name="pesoActualKg" value={formData.pesoActualKg || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label htmlFor="estado" className="block text-sm text-gray-400 mb-1">Estado</label>
            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} className="input-field">
              <option value="">Seleccione...</option>
              {catalogs.estadosAnimal.map(e => (
                <option key={e.id} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div role="alert" aria-live="polite" className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2 pt-4">Clasificación y Ubicación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Raza</label>
            <div className="flex items-center gap-2">
              <select name="razaId" value={formData.razaId} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.razas.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Raza ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Raza')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Foto URL (opcional)</label>
            <input type="url" name="fotoUrl" value={formData.fotoUrl || ''} onChange={handleChange} className="input-field" placeholder="https://ejemplo.com/foto.jpg" />
          </div>
        </div>

        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2 pt-4">Genealogía</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Madre</label>
            <select name="madreId" value={formData.madreId} onChange={handleChange} className="input-field">
              <option value="">Desconocido</option>
              {catalogs.madres.map(c => <option key={c.id} value={c.id}>{c.identificadorArete || `ID:${c.id}`} {c.nombre ? `(${c.nombre})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Padre</label>
            <select name="padreId" value={formData.padreId} onChange={handleChange} className="input-field">
              <option value="">Desconocido</option>
              {catalogs.padres.map(c => <option key={c.id} value={c.id}>{c.identificadorArete || `ID:${c.id}`} {c.nombre ? `(${c.nombre})` : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar Animal</button>
        </div>
      </form>

      <CatalogModal
        isOpen={!!modalType}
        onClose={closeModal}
        type={modalType}
        onSave={handleSaveCatalogItem}
        fincas={catalogs.fincas}
      />
    </div>
  );
};

export default GanadoForm;
