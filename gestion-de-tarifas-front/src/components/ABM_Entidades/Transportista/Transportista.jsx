import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, Phone, DollarSign, Truck, MapPin, Eye } from 'lucide-react';
import { createTransportista, deleteTransportista, getTransportista, updateTransportista } from '../../../services/transportista.service';
import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getZonas } from '../../../services/zona.service';
import Swal from 'sweetalert2';


const Transportistas = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [zonasViaje, setZonasViaje] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransportista, setSelectedTransportista] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Modificado: Se quita costoServicio del estado del formulario
  const [form, setForm] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    tipoVehiculos: [],
    zonasDeViaje: []
  });
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [transportistasData, tiposVehiculoData, zonasViajeData] = await Promise.all([
          getTransportista(),
          getVehiculos(),
          getZonas()
        ]);
        setData(transportistasData);
        setTiposVehiculo(tiposVehiculoData);
        setZonasViaje(zonasViajeData);
      } catch (error) {
        showNotification('Error al cargar datos', 'error');
      }
    };
    fetchAll();
  }, []);


  const clearForm = () => {
    // Modificado: Se quita costoServicio al limpiar el formulario
    setForm({
      nombre: '',
      contacto: '',
      telefono: '',
      tipoVehiculos: [], // Corregido: Debe ser un array vacío para el select multiple
      zonasDeViaje: []  // Corregido: Debe ser un array vacío para el select multiple
    });
    setEditingId(null);
  };


  const handleInputChange = (e) => {
    const { name, value, options, type } = e.target;
    if (type === 'select-multiple') {
      const selectedValues = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setForm(prev => ({ ...prev, [name]: selectedValues }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };


  const viewEntity = (transportista) => {
    setSelectedTransportista(transportista);
    setShowModal(true);
  };

  // Modificado: Se quita la validación de costoServicio
  const validateForm = () => {
    return form.nombre && form.contacto && form.telefono && form.tipoVehiculos.length > 0 && form.zonasDeViaje.length > 0 
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    
    // Modificado: Se quita costoServicio de los datos a enviar
    const entityData = {
      nombre: form.nombre,
      contacto: form.contacto,
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
      console.error('Error al guardar transportista:', error);
      const msg = error?.response?.data?.message || 'Error al guardar transportista';
      showNotification(msg, 'error');
    }
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      // Modificado: Se quita costoServicio al popular el formulario para edición
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
          setData(data.filter(item => item.id !== id));
          showNotification('Transportista eliminado correctamente');
        } catch (error) {
          console.error('Error al eliminar el transportista:', error);
          const mensaje = error?.response?.data?.message || 'Error al eliminar transportista';
          showNotification(mensaje, 'error');
        }
      }
  };

  // Corregido: Lógica de filtrado para buscar en las listas de vehículos y zonas
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    
    const tieneVehiculo = item.tipoVehiculos?.some(vehiculo => 
      vehiculo.descripcion.toLowerCase().includes(searchLower)
    );

    const cubreZona = item.zonasDeViaje?.some(zona => 
      `${zona.origen} - ${zona.destino}`.toLowerCase().includes(searchLower)
    );

    return (
      item.nombre.toLowerCase().includes(searchLower) ||
      item.contacto.toLowerCase().includes(searchLower) ||
      item.telefono.toString().includes(searchLower) ||
      tieneVehiculo ||
      cubreZona
    );
  });

  const canSubmit = tiposVehiculo.length > 0 && zonasViaje.length > 0;

  return (
    <div className="grid lg:grid-cols-3 gap-8 ">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg   border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-orange-500`}>
            {editingId ? 'Editar Transportista' : 'Nuevo Transportista'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del transportista"
                  className={`w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Contacto *
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={form.contacto}
                  onChange={handleInputChange}
                  placeholder="Persona de contacto"
                  className={`w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Teléfono *
                </label>
                <input
                  type="number"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  className={`w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all`}
                />
              </div>
              
              {/* Eliminado: Bloque del input para Costo de Servicio */}
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo de Vehículo *
                </label>
                <select
                  name="tipoVehiculos"
                  value={form.tipoVehiculos}
                  onChange={handleInputChange}
                  multiple
                  className={`w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-all h-32`}
                >
                  {tiposVehiculo.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </select>
                {tiposVehiculo.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Primero debes crear tipos de vehículo en la pestaña correspondiente
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Zona de Viaje *
                </label>
                <select
                    name="zonasDeViaje"
                    value={form.zonasDeViaje}
                    onChange={handleInputChange}
                    multiple
                    className={`w-full p-3 border-2 border-gray-300 text-gray-300 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all h-32`}
                  >
                    {zonasViaje.map(zona => (
                      <option key={zona.id} value={zona.id}>
                        {/* Modificado: Se quita el costo que ya no existe */}
                        {`${zona.origen} - ${zona.destino}`}
                      </option>
                    ))}
                </select>
                {zonasViaje.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Primero debes crear zonas de viaje en la pestaña correspondiente
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 rounded-lg  bg-[#444240] hover:bg-yellow-500 text-yellow-400 hover:text-white border border-yellow-400 font-semibold transition duration-300"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-[#444240] text-red-600 border border-red-600 hover:text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${
                  !canSubmit 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : editingId
                      ? `bg-[#444240] hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-600`
                      : 'bg-[#444240] hover:bg-green-500 text-green-400 hover:text-white border border-green-400 font-semibold py-2 px-4 rounded-2xl transition duration-300'
                }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">
            Transportistas Registrados
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar transportistas..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#242423] text-gray-300 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🚛</div>
                      <h3 className="text-lg font-semibold mb-2">No hay transportistas registrados</h3>
                      <p>Comienza agregando un nuevo transportista usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.nombre}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.contacto}</td>
                    <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-neutral-200">
                          <Phone size={12} className="mr-2" />
                          {item.telefono}
                        </div>
                        {/* Eliminado: Div que mostraba el costo de servicio */}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEntity(item.id)}
                          className={`p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteEntity(item.id)}
                          className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => viewEntity(item)}
                          className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showModal && selectedTransportista && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center">
          <div className="bg-[#333] p-6 rounded-xl max-w-md w-full shadow-lg text-gray-100">
            <h2 className="text-2xl font-bold mb-4">Detalle del Transportista</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Nombre:</strong> {selectedTransportista.nombre}</p>
              <p><strong>Contacto:</strong> {selectedTransportista.contacto}</p>
              <p><strong>Teléfono:</strong> {selectedTransportista.telefono}</p>
              {/* Eliminado: Párrafo que mostraba el Costo Servicio */}
              <div>
                <strong>Tipos de Vehículo:</strong>
                <ul className="list-disc list-inside">
                  {selectedTransportista.tipoVehiculos?.map(tv => (
                    <li key={tv.id}>{tv.descripcion}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Zonas de Viaje:</strong>
                <ul className="list-disc list-inside">
                  {selectedTransportista.zonasDeViaje?.map(z => (
                    <li key={z.id}>
                      {/* Modificado: Se quita el costo que ya no existe */}
                      {`${z.origen} - ${z.destino}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportistas;