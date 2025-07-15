import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, Edit, Trash2, Phone, Eye, MoreVertical } from 'lucide-react';
import { createTransportista, deleteTransportista, getTransportista, updateTransportista } from '../../../services/transportista.service';
import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getZonas } from '../../../services/zona.service';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { useOutletContext } from 'react-router-dom';

const customSelectStyles = (isMulti = false) => ({
  control: (base) => ({
    ...base,
    backgroundColor: isMulti ? '#444240' : 'rgba(255,255,255,0.1)',
    borderColor: isMulti ? 'rgb(107 114 128)' : 'rgba(255,255,255,0.3)',
    color: 'white',
    width: '100%',
    minWidth: '200px',
    fontSize: '0.875rem',
    minHeight: '42px', 
  }),
  singleValue: (base) => ({ ...base, color: 'white' }),
  multiValue: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.2)' }),
  multiValueLabel: (base) => ({ ...base, color: 'white' }),
  menu: (base) => ({ 
    ...base, 
    backgroundColor: '#242423', 
    color: 'white',
    maxHeight: '200px',
    zIndex: 9999
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px', 
    overflowY: 'auto',  
    // Estilos personalizados para la barra de scroll
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#1f1f1f',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#555',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: '#777',
      },
    },
  }),
  option: (base, state) => ({ 
    ...base, 
    backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', 
    color: 'white' 
  }),
  placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
});

const Transportistas = () => {
  const { showNotification, tabColor } = useOutletContext();
  const [data, setData] = useState([]); // Datos originales del backend
  const [editingId, setEditingId] = useState(null);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [zonasViaje, setZonasViaje] = useState([]);
  const [selectedTransportista, setSelectedTransportista] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Estado para el formulario de creación/edición
  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', tipoVehiculos: [], zonasDeViaje: [] });

  // Estado separado para los filtros de la tabla
  const [filters, setFilters] = useState({ nombreContacto: '', tipoVehiculos: [], zonasDeViaje: [] });

  const formRef = useRef(null);
  const tableHeaderRef = useRef(null);
  const [tableBodyHeight, setTableBodyHeight] = useState('auto');

  // Carga inicial de datos
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [transportistasData, vehiculosData, zonasData] = await Promise.all([
          getTransportista(),
          getVehiculos(),
          getZonas()
        ]);
        setData(transportistasData);
        setTiposVehiculo(vehiculosData);
        setZonasViaje(zonasData);
      } catch (error) {
        showNotification('Error al cargar datos', 'error');
      }
    };
    fetchAll();
  }, []);

  
  // LÓGICA DE FILTRADO 
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nombreMatch = filters.nombreContacto === '' || item.nombre.toLowerCase().includes(filters.nombreContacto.toLowerCase());
      const contactoMatch = filters.nombreContacto === '' || item.contacto.toLowerCase().includes(filters.nombreContacto.toLowerCase());
      
      const tipoVehiculosMatch = filters.tipoVehiculos.length === 0 || 
        item.tipoVehiculos?.some(tv => filters.tipoVehiculos.includes(tv.id.toString()));
        
      const zonasDeViajeMatch = filters.zonasDeViaje.length === 0 ||
        item.zonasDeViaje?.some(zv => filters.zonasDeViaje.includes(zv.id.toString()));

      return (nombreMatch || contactoMatch) && tipoVehiculosMatch && zonasDeViajeMatch;
    });
  }, [data, filters]);

  //  formulario  
  const clearForm = () => {
    setForm({ nombre: '', contacto: '', telefono: '', tipoVehiculos: [], zonasDeViaje: [] });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFormSelectChange = (name, selectedOptions) => {
    const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setForm(prev => ({ ...prev, [name]: selectedIds }));
  };

  const viewEntity = (transportista) => {
    setSelectedTransportista(transportista);
    setShowModal(true);
  };

  // CRUD 
  const validateForm = () => form.nombre && form.contacto && form.telefono && form.tipoVehiculos.length > 0 && form.zonasDeViaje.length > 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    const entityData = {
      ...form,
      telefono: form.telefono,
      tipoVehiculos: form.tipoVehiculos.map(id => parseInt(id)),
      zonasDeViaje: form.zonasDeViaje.map(id => parseInt(id)),
    };
    try {
      if (editingId) {
        const updated = await updateTransportista(editingId, entityData);
        setData(data.map(item => (item.id === editingId ? updated : item)));
        showNotification('Transportista actualizado correctamente');
      } else {
        const created = await createTransportista(entityData);
        setData([...data, created]);
        showNotification('Transportista agregado correctamente');
      }
      clearForm();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error al guardar transportista';
      showNotification(msg, 'error');
    }
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        nombre: entity.nombre,
        contacto: entity.contacto,
        telefono: entity.telefono.toString(),
        tipoVehiculos: (entity.tipoVehiculos || []).map(tv => tv.id.toString()),
        zonasDeViaje: (entity.zonasDeViaje || []).map(zn => zn.id.toString())
      });
      setEditingId(id);
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el transportista definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      try {
        await deleteTransportista(id);
        const newData = data.filter(item => item.id !== id);
        setData(newData);
        showNotification('Transportista eliminado correctamente');
      } catch (error) {
        const mensaje = error?.response?.data?.message || 'Error al eliminar el transportista';
        showNotification(mensaje, 'error');
      }
    }
  };
  
  // Opciones para los Select
  const opcionesVehiculo = useMemo(() => tiposVehiculo.map(tv => ({ value: tv.id.toString(), label: tv.descripcion })), [tiposVehiculo]);
  const opcionesZonas = useMemo(() => zonasViaje.map(z => ({ value: z.id.toString(), label: `${z.origen} - ${z.destino}` })), [zonasViaje]);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (formRef.current && tableHeaderRef.current) {
        const formHeight = formRef.current.offsetHeight;
        const headerHeight = tableHeaderRef.current.offsetHeight;
        const calculatedHeight = formHeight - headerHeight;

        if (calculatedHeight > 0) {
          setTableBodyHeight(`${calculatedHeight}px`);
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [editingId, filteredData]); 

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Estilos CSS para mejorar la barra de scroll */}
      <style jsx>{`
        /* Estilos personalizados para la barra de scroll */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d2d2d;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
          border: 1px solid #2d2d2d;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #9ca3af;
        }

        /* Para Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d2d2d;
        }

        /* Ocultar flechas de input numérico */
        .no-arrows::-webkit-outer-spin-button,
        .no-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .no-arrows[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      {/* Form Section */}
      <div className="lg:col-span-1">
        <div ref={formRef} className="bg-[#444240] p-8 rounded-2xl shadow-xl border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-orange-500`}>
            {editingId ? 'Editar Transportista' : 'Nuevo Transportista'}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre *</label>
              <input 
                name="nombre" 
                value={form.nombre} 
                onChange={handleInputChange} 
                placeholder="Nombre del transportista" 
                className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Contacto *</label>
              <input 
                name="contacto" 
                value={form.contacto} 
                onChange={handleInputChange} 
                placeholder="Persona de contacto" 
                className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Teléfono *</label>
              <input 
                type="number" 
                name="telefono" 
                value={form.telefono} 
                onChange={handleInputChange} 
                placeholder="Número de teléfono" 
                className="w-full p-3 border-2 text-gray-300 bg-transparent border-gray-600 rounded-lg focus:border-orange-500 focus:outline-none transition-all no-arrows" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipos de Vehículo *</label>
              <Select 
                isMulti 
                options={opcionesVehiculo} 
                placeholder="Seleccionar tipos de vehículo..." 
                styles={customSelectStyles(true)} 
                value={opcionesVehiculo.filter(opt => form.tipoVehiculos.includes(opt.value))} 
                onChange={(selected) => handleFormSelectChange('tipoVehiculos', selected)}
                maxMenuHeight={200} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Zonas de Viaje *</label>
              <Select 
                isMulti 
                options={opcionesZonas} 
                placeholder="Seleccionar zonas de viaje..." 
                styles={customSelectStyles(true)} 
                value={opcionesZonas.filter(opt => form.zonasDeViaje.includes(opt.value))} 
                onChange={(selected) => handleFormSelectChange('zonasDeViaje', selected)}
                maxMenuHeight={200} 
              />
            </div>
            {/* Botones del formulario */}
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
        <div ref={tableHeaderRef} className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Transportistas Registrados</h2>
          
          {/* SECCIÓN DE FILTROS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar por nombre o contacto..." 
                value={filters.nombreContacto} 
                onChange={(e) => setFilters(prev => ({ ...prev, nombreContacto: e.target.value }))} 
                className="w-full px-3 py-2.5 bg-white/10 border border-white/30 rounded-lg placeholder-gray-300 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all min-h-[42px]"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={16} />
            </div>
            <Select 
              isMulti 
              options={opcionesVehiculo} 
              placeholder="Filtrar por Vehículo..." 
              styles={customSelectStyles()} 
              onChange={(selected) => setFilters(prev => ({ ...prev, tipoVehiculos: selected.map(opt => opt.value) }))} 
            />
            <Select 
              isMulti 
              options={opcionesZonas} 
              placeholder="Filtrar por Zona..." 
              styles={customSelectStyles()} 
              onChange={(selected) => setFilters(prev => ({ ...prev, zonasDeViaje: selected.map(opt => opt.value) }))} 
            />
          </div>
        </div>
        <div className="relative">
          <div className="overflow-y-auto custom-scrollbar" style={{ height: tableBodyHeight }}>
            <table className="w-full">
              <thead className="bg-[#242423] text-gray-300 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contacto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">🛣️</div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">No se encontraron transportistas</h3>
                        <p>Intenta ajustar los filtros o agrega un nuevo transportista.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-600 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.nombre}</td>
                      <td className="px-4 py-3 text-sm text-neutral-200">{item.contacto}</td>
                      <td className="px-4 py-3 text-sm text-neutral-200">{item.telefono}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => editEntity(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Edit size={14} /></button>
                          <button onClick={() => deleteEntity(item.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><Trash2 size={14} /></button>
                          <button onClick={() => viewEntity(item)} className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"><Eye size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {filteredData.length > 8 && (
            <div className="absolute bottom-2 right-2 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
              <span>↕</span>
              <span>{filteredData.length} registros</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Detalles */}
      {showModal && selectedTransportista && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center">
          <div className="bg-[#333] p-6 rounded-xl max-w-md w-full shadow-lg text-gray-100">
            <h2 className="text-2xl font-bold mb-4">{selectedTransportista.nombre}</h2>
            <p><strong>Contacto:</strong> {selectedTransportista.contacto}</p>
            <p><strong>Teléfono:</strong> {selectedTransportista.telefono}</p>
            <div className="mt-4">
              <strong>Vehículos:</strong>
              <ul className="list-disc list-inside">{selectedTransportista.tipoVehiculos?.map(tv => <li key={tv.id}>{tv.descripcion}</li>)}</ul>
            </div>
            <div className="mt-2">
              <strong>Zonas:</strong>
              <ul className="list-disc list-inside">{selectedTransportista.zonasDeViaje?.map(z => <li key={z.id}>{`${z.origen} - ${z.destino}`}</li>)}</ul>
            </div>
            <button onClick={() => setShowModal(false)} className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportistas;