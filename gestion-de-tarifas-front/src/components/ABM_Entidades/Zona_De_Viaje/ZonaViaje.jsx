import React, { useState, useEffect, useMemo } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { getZonas, createZona, updateZona, deleteZona } from '../../../services/zona.service';
import Select from 'react-select';
import { useOutletContext } from 'react-router-dom';

// Estilos para los componentes Select, para mantener la consistencia
const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderColor: 'rgba(255,255,255,0.3)',
      color: 'white',
      width: '100%',
      minWidth: '200px',
      fontSize: '0.875rem',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
};

const ZonasViaje = () => {
  const { showNotification, tabColor } = useOutletContext();
  // --- ESTADOS ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Estado para el formulario (sin campos de costo)
  const [form, setForm] = useState({ origen: '', destino: '', distanciaKm: '' });
  
  // Estado separado para los filtros
  const [filters, setFilters] = useState({ origen: '', destino: '' });

  // Carga inicial de datos
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const zonas = await getZonas();
        // Adaptamos el nombre del campo del backend (distancia) al del frontend (distanciaKm)
        const zonasAdaptadas = zonas.map(zona => ({
          ...zona,
          distanciaKm: zona.distancia,
        }));
        setData(zonasAdaptadas);
        setFilteredData(zonasAdaptadas);
      } catch (error) {
        console.error('Error al obtener zonas de viaje:', error);
        showNotification('Error al cargar las zonas de viaje', 'error');
      }
    };
    fetchZonas();
  }, []);

  // Lógica de filtrado que se activa cuando cambian los datos o los filtros
  useEffect(() => {
    let dataToFilter = [...data];
    if (filters.origen) {
      dataToFilter = dataToFilter.filter(item => item.origen === filters.origen);
    }
    if (filters.destino) {
      dataToFilter = dataToFilter.filter(item => item.destino === filters.destino);
    }
    setFilteredData(dataToFilter);
  }, [data, filters]);

  // --- MANEJADORES DE FORMULARIO ---
  const clearForm = () => {
    setForm({ origen: '', destino: '', distanciaKm: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // --- LÓGICA DE SUBMIT (CRUD) ---
  const validateForm = () => {
    return form.origen.trim() && form.destino.trim() && form.distanciaKm;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    // Adaptamos el nombre del campo del frontend (distanciaKm) al del backend (distancia)
    const entityData = {
      origen: form.origen,
      destino: form.destino,
      distancia: parseFloat(form.distanciaKm),
    };
    try {
      let updatedData;
      if (editingId) {
        const updatedZona = await updateZona(editingId, entityData);
        updatedData = data.map(item =>
          item.id === editingId
            ? { ...item, ...updatedZona, distanciaKm: updatedZona.distancia }
            : item
        );
        showNotification('Zona de viaje actualizada correctamente');
      } else {
        const nuevaZona = await createZona(entityData);
        updatedData = [...data, { ...nuevaZona, distanciaKm: nuevaZona.distancia }];
        showNotification('Zona de viaje agregada correctamente');
      }
      setData(updatedData);
      clearForm();
    } catch (error) {
      const mensaje = error?.response?.data?.message || 'Error al guardar la zona de viaje';
      showNotification(mensaje, 'error');
    }
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        origen: entity.origen,
        destino: entity.destino,
        distanciaKm: entity.distanciaKm.toString(),
      });
      setEditingId(id);
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la zona de viaje definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteZona(id);
        setData(data.filter(item => item.id !== id));
        showNotification('Zona de viaje eliminada correctamente');
      } catch (error) {
        const mensaje = error?.response?.data?.message || 'Error al eliminar la zona de viaje';
        showNotification(mensaje, 'error');
      }
    }
  };

  // Opciones para los filtros desplegables
  const opcionesOrigen = useMemo(() => [
    { value: '', label: 'Todos los Orígenes' },
    ...[...new Set(data.map(item => item.origen))].map(origen => ({ value: origen, label: origen }))
  ], [data]);

  const opcionesDestino = useMemo(() => [
    { value: '', label: 'Todos los Destinos' },
    ...[...new Set(data.map(item => item.destino))].map(destino => ({ value: destino, label: destino }))
  ], [data]);

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-xl border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-purple-500`}>
            {editingId ? 'Editar Zona de Viaje' : 'Nueva Zona de Viaje'}
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Origen *</label>
                <input type="text" name="origen" value={form.origen} onChange={handleInputChange} placeholder="Ciudad o zona de origen" className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Destino *</label>
                <input type="text" name="destino" value={form.destino} onChange={handleInputChange} placeholder="Ciudad o zona de destino" className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Distancia (Km) *</label>
                <input type="number" name="distanciaKm" value={form.distanciaKm} onChange={handleInputChange} placeholder="Distancia en kilómetros" min="0" step="0.1" className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none transition-all" />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 w-full">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${editingId
                  ? `bg-indigo-500 hover:bg-indigo-600`
                  : 'bg-green-500 hover:bg-green-600'
                  }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-purple-700 to-purple-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Zonas de Viaje Registradas</h2>
          <div className="flex gap-4 items-center">
            <Select options={opcionesOrigen} isClearable placeholder="Filtrar por origen..." onChange={(opt) => setFilters(f => ({ ...f, origen: opt ? opt.value : '' }))} styles={customSelectStyles} />
            <Select options={opcionesDestino} isClearable placeholder="Filtrar por destino..." onChange={(opt) => setFilters(f => ({ ...f, destino: opt ? opt.value : '' }))} styles={customSelectStyles} />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto bg-[#444240]">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Origen</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Destino</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Distancia (Km)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.origen}</td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.destino}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.distanciaKm} km</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => editEntity(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit size={14} /></button>
                        <button onClick={() => deleteEntity(item.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🗺️</div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-300">No se encontraron zonas</h3>
                      <p>Intenta ajustar los filtros o agrega una nueva zona de viaje.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ZonasViaje;