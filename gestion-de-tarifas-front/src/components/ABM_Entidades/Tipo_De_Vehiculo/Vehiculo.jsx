import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { createVehiculo, deleteVehiculo, getVehiculos, updateVehiculo } from '../../../services/tipoVehiculo.service';
import Swal from 'sweetalert2';
import { getCargas } from '../../../services/tipoCarga.service';
import Select from 'react-select';
import { useOutletContext } from 'react-router-dom';

// Estilos para los componentes Select, puedes reutilizarlos
const customSelectStyles = (isMulti = false) => ({
  control: (base) => ({
    ...base,
    backgroundColor: isMulti ? '#444240' : 'rgba(255,255,255,0.1)',
    borderColor: isMulti ? 'rgb(107 114 128)' : 'rgba(255,255,255,0.3)',
    color: 'white',
    width: '100%',           
    minWidth: '200px',  
    fontSize: '0.875rem'
  }),
  singleValue: (base) => ({ ...base, color: 'white' }),
  multiValue: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.2)' }),
  multiValueLabel: (base) => ({ ...base, color: 'white' }),
  menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423',
    color: 'white',
  }),
  placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
});

const TiposVehiculo = () => {
  const { showNotification, tabColor } = useOutletContext();
  // --- ESTADOS ---
  const [data, setData] = useState([]); // Lista original de vehículos del backend
  const [filteredData, setFilteredData] = useState([]); // Lista que se muestra en la tabla
  const [editingId, setEditingId] = useState(null);
  
  // Estado para el formulario de creación/edición
  const [form, setForm] = useState({ descripcion: '', tipoCargaIds: [] });
  
  // Estado separado para los filtros de la tabla
  const [filters, setFilters] = useState({ descripcion: '', tipoCarga: '' });

  const [tiposCarga, setTiposCarga] = useState([]);

  // Carga inicial de datos
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vehiculosData, cargasData] = await Promise.all([
          getVehiculos(),
          getCargas()
        ]);
        setData(vehiculosData);
        // SOLUCIÓN: Inicialmente, la tabla muestra todos los datos
        setFilteredData(vehiculosData); 
        setTiposCarga(cargasData);
      } catch (error) {
        showNotification('Error al cargar datos iniciales', 'error');
      }
    };
    fetchInitialData();
  }, []);

  // Lógica de filtrado centralizada: se activa cuando cambian los datos o los filtros
  useEffect(() => {
    let dataToFilter = [...data];

    if (filters.descripcion) {
      dataToFilter = dataToFilter.filter(item => 
        item.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase())
      );
    }
    if (filters.tipoCarga) {
      dataToFilter = dataToFilter.filter(item =>
        item.tipoCargas?.some(tc => tc.categoria.toLowerCase().includes(filters.tipoCarga.toLowerCase()))
      );
    }
    setFilteredData(dataToFilter);
  }, [data, filters]);

  // --- MANEJADORES DE FORMULARIO ---
  const clearForm = () => {
    setForm({ descripcion: '', tipoCargaIds: [] });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFormTipoCargaChange = (selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(option => option.id) : [];
    setForm({ ...form, tipoCargaIds: selectedIds });
  };

  // --- LÓGICA DE SUBMIT (CRUD) ---
  const validateForm = () => form.descripcion && form.tipoCargaIds.length > 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    const entityData = {
      descripcion: form.descripcion.trim(),
      tipoCargas: form.tipoCargaIds,
    };
    try {
      let updatedData;
      if (editingId) {
        const updated = await updateVehiculo(editingId, entityData);
        updatedData = data.map(item => (item.id === editingId ? updated : item));
        showNotification('Tipo de vehículo actualizado correctamente');
      } else {
        const creado = await createVehiculo(entityData);
        updatedData = [...data, creado];
        showNotification('Tipo de vehículo agregado correctamente');
      }
      setData(updatedData);
      clearForm();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error al guardar tipo de vehículo';
      showNotification(msg, 'error');
    }
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        descripcion: entity.descripcion,
        tipoCargaIds: (entity.tipoCargas || []).map(tc => tc.id)
      });
      setEditingId(id);
    }
  };
  
  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de vehículo definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
      try {
        await deleteVehiculo(id);
        const newData = data.filter(item => item.id !== id);
        setData(newData);
        showNotification('Tipo de vehículo eliminado correctamente');
      } catch (error) {
        const mensaje = error?.response?.data?.message || 'Error al eliminar el tipo de vehículo';
        showNotification(mensaje, 'error');
      }
    }
  };
  
  const getTipoCargaNombre = (tipoCargaArr) => {
    if (!tipoCargaArr || tipoCargaArr.length === 0) return 'No especificado';
    return tipoCargaArr.map(tc => tc.categoria).join(', ');
  };

  // Opciones para los Select de los filtros
  const opcionesVehiculoFilter = useMemo(() => [
    { value: '', label: 'Todos los Vehículos' },
    ...[...new Set(data.map(item => item.descripcion))].map(desc => ({ value: desc, label: desc }))
  ], [data]);

  const opcionesCargaFilter = useMemo(() => [
    { value: '', label: 'Todos los Tipos de Carga' },
    ...[...new Set(tiposCarga.map(item => item.categoria))].map(cat => ({ value: cat, label: cat }))
  ], [tiposCarga]);

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-xl border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Descripción *</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del tipo de vehículo"
                rows="3"
                className={`w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition-all resize-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipos de Carga *</label>
              <Select
                isMulti
                options={tiposCarga}
                getOptionLabel={(e) => e.categoria}
                getOptionValue={(e) => e.id}
                value={tiposCarga.filter(tc => form.tipoCargaIds.includes(tc.id))}
                onChange={handleFormTipoCargaChange}
                placeholder="Seleccionar..."
                styles={customSelectStyles(true)}
              />
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

      {/* Tabla */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-green-700 to-green-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tipos de Vehículo Registrados</h2>
          <div className='flex gap-4 items-center'>
            <Select
              options={opcionesVehiculoFilter}
              isClearable
              placeholder="Filtrar por vehículo..."
              onChange={(selected) => setFilters(prev => ({ ...prev, descripcion: selected ? selected.value : '' }))}
              styles={customSelectStyles()}
            />
            <Select
              options={opcionesCargaFilter}
              isClearable
              placeholder="Filtrar por tipo de carga..."
              onChange={(selected) => setFilters(prev => ({ ...prev, tipoCarga: selected ? selected.value : '' }))}
              styles={customSelectStyles()}
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto bg-[#444240]">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr className='text-gray-300'>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Tipos de Carga Compatibles</th>
                <th className="px-4 py-3 text-center text-sm font-semibold ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.descripcion}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200">{getTipoCargaNombre(item.tipoCargas)}</td>
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
                  <td colSpan="3" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🚛</div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-300">No se encontraron vehículos</h3>
                      <p>Intenta ajustar los filtros o agrega un nuevo tipo de vehículo.</p>
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

export default TiposVehiculo;
