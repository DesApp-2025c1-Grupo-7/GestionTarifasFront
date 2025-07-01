import React, { useEffect, useState, useMemo } from 'react';
import { Search, Edit, Trash2, Phone, Eye } from 'lucide-react';
import { createTransportista, deleteTransportista, getTransportista, updateTransportista } from '../../../services/transportista.service';
import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getZonas } from '../../../services/zona.service';
import Swal from 'sweetalert2';
import Select from 'react-select';

// Estilos para los componentes Select
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
    multiValue: (base) => ({ ...base, backgroundColor: '#555', color: 'white' }),
    multiValueLabel: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
};

const Transportistas = ({ showNotification, tabColor }) => {
  // --- ESTADOS ---
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

  // --- LÓGICA DE FILTRADO CENTRALIZADA ---
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

  // --- MANEJADORES ---
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

  // --- LÓGICA DE SUBMIT (CRUD) ---
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
    // ... tu lógica de delete ...
  };
  
  // Opciones para los Select
  const opcionesVehiculo = useMemo(() => tiposVehiculo.map(tv => ({ value: tv.id.toString(), label: tv.descripcion })), [tiposVehiculo]);
  const opcionesZonas = useMemo(() => zonasViaje.map(z => ({ value: z.id.toString(), label: `${z.origen} - ${z.destino}` })), [zonasViaje]);

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Transportista' : 'Nuevo Transportista'}
          </h2>
          <div className="space-y-5">
            {/* Inputs del formulario */}
            <input name="nombre" value={form.nombre} onChange={handleInputChange} placeholder="Nombre" className="w-full p-3 bg-transparent border-2 border-gray-600 rounded-lg text-gray-200" />
            <input name="contacto" value={form.contacto} onChange={handleInputChange} placeholder="Contacto" className="w-full p-3 bg-transparent border-2 border-gray-600 rounded-lg text-gray-200" />
            <input type="number" name="telefono" value={form.telefono} onChange={handleInputChange} placeholder="Teléfono" className="w-full p-3 bg-transparent border-2 border-gray-600 rounded-lg text-gray-200" />
            <Select isMulti options={opcionesVehiculo} placeholder="Tipos de Vehículo..." styles={customSelectStyles} value={opcionesVehiculo.filter(opt => form.tipoVehiculos.includes(opt.value))} onChange={(selected) => handleFormSelectChange('tipoVehiculos', selected)} />
            <Select isMulti options={opcionesZonas} placeholder="Zonas de Viaje..." styles={customSelectStyles} value={opcionesZonas.filter(opt => form.zonasDeViaje.includes(opt.value))} onChange={(selected) => handleFormSelectChange('zonasDeViaje', selected)} />
            {/* Botones del formulario */}
            <div className="flex gap-4 pt-6 border-t border-gray-700">
                <button onClick={clearForm} className="px-6 py-3 bg-[#444240] text-yellow-500 border border-yellow-500 hover:text-white rounded-lg hover:bg-yellow-500 font-semibold">Limpiar</button>
                <button onClick={handleSubmit} disabled={!validateForm()} className={`px-6 py-3 text-white rounded-lg font-semibold ${!validateForm() ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>{editingId ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Transportistas Registrados</h2>
          {/* --- SECCIÓN DE FILTROS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Buscar por nombre o contacto..." value={filters.nombreContacto} onChange={(e) => setFilters(prev => ({ ...prev, nombreContacto: e.target.value }))} className="w-full p-2 bg-white/10 border border-white/30 rounded-lg placeholder-gray-300 text-white" />
            <Select isMulti options={opcionesVehiculo} placeholder="Filtrar por Vehículo..." styles={customSelectStyles} onChange={(selected) => setFilters(prev => ({ ...prev, tipoVehiculos: selected.map(opt => opt.value) }))} />
            <Select isMulti options={opcionesZonas} placeholder="Filtrar por Zona..." styles={customSelectStyles} onChange={(selected) => setFilters(prev => ({ ...prev, zonasDeViaje: selected.map(opt => opt.value) }))} />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#242423] text-gray-300 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.nombre}</td>
                  <td className="px-4 py-3 text-sm text-neutral-200">{item.contacto}</td>
                  <td className="px-4 py-3 text-sm text-neutral-200">{item.telefono}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => editEntity(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Edit size={14} /></button>
                      <button onClick={() => deleteEntity(item.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Trash2 size={14} /></button>
                      <button onClick={() => viewEntity(item)} className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
