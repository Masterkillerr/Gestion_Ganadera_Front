import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnimales, getAnimalById, createAnimal, updateAnimal, getRazas, getLotes, getFincas, getSexos, getEstadosAnimal } from '../../api/ganado';
import CatalogModal from '../../components/CatalogModal';
import { useToast } from '../../context/ToastContext';
import { useLoading } from '../../context/LoadingContext';

const GanadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    identificadorArete: '',
    nombre: '',
    sexo: 'Hembra',
    fechaNacimiento: '',
    pesoNacimiento: '',
    pesoActualKg: '',
    estado: 'Activo',
    fotoUrl: '',
    razaId: '',
    loteId: '',
    fincaId: '',
    madreId: '',
    padreId: ''
  });

  const [catalogs, setCatalogs] = useState({
    sexos: [], estadosAnimal: [], razas: [], lotes: [], fincas: [], madres: [], padres: []
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
      setFormData(prev => ({ ...prev, fincaId: newItem.id }));
    } else if (type === 'Lote') {
      setCatalogs(prev => ({ ...prev, lotes: [...prev.lotes, newItem] }));
      setFormData(prev => ({ ...prev, loteId: newItem.id }));
    }
  };

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [sxRes, eaRes, razRes, lotRes, finRes, aniRes] = await Promise.all([
          getSexos().catch(() => []),
          getEstadosAnimal().catch(() => []),
          getRazas().catch(() => []),
          getLotes().catch(() => []),
          getFincas().catch(() => []),
          getAnimales().catch(() => [])
        ]);
        setCatalogs({
          sexos: sxRes,
          estadosAnimal: eaRes,
          razas: razRes,
          lotes: lotRes,
          fincas: finRes,
          madres: aniRes.filter(a => a.sexo === 'Hembra' && a.id !== parseInt(id)),
          padres: aniRes.filter(a => a.sexo === 'Macho' && a.id !== parseInt(id))
        });
      } catch (error) {
        console.error('Error cargando catálogos', error);
        toast.error('Error al cargar catálogos');
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
          pesoNacimiento: data.pesoNacimiento || '',
          pesoActualKg: data.pesoActualKg || '',
          estado: data.estadoAnimal || 'Activo',
          fotoUrl: data.fotoUrl || '',
          razaId: catalogs.razas.find(r => r.nombre === data.razaNombre)?.id || '',
          loteId: data.loteId || '',
          fincaId: data.fincaId || '',
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

      if (isEditing) {
        await updateAnimal(id, payload);
      } else {
        await createAnimal(payload);
      }
      navigate('/dashboard/ganado');
    } catch (error) {
      console.error('Error guardando', error);
      toast.error('Error al guardar animal');
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
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
            <label className="block text-sm text-gray-400 mb-1">Arete / Identificador</label>
            <input name="identificadorArete" value={formData.identificadorArete || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input name="nombre" value={formData.nombre || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className="input-field">
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Peso al Nacer (kg)</label>
            <input type="number" step="0.01" name="pesoNacimiento" value={formData.pesoNacimiento || ''} onChange={handleChange} autoComplete="off" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select name="estado" value={formData.estado} onChange={handleChange} className="input-field">
              <option value="Activo">Activo</option>
              <option value="En tratamiento">En tratamiento</option>
              <option value="En cuarentena">En cuarentena</option>
              <option value="Vendido">Vendido</option>
              <option value="Fallecido">Fallecido</option>
              <option value="Sacrificado">Sacrificado</option>
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
            <label className="block text-sm text-gray-400 mb-1">Finca</label>
            <div className="flex items-center gap-2">
              <select name="fincaId" value={formData.fincaId} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.fincas.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Finca ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Finca')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Lote</label>
            <div className="flex items-center gap-2">
              <select name="loteId" value={formData.loteId} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.lotes.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Lote ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Lote')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
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
