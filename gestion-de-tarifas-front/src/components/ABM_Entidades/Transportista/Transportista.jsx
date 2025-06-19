import React, { useState } from 'react';
import { Search, Edit, Trash2, Phone, DollarSign, Truck, MapPin } from 'lucide-react';

const Transportistas = ({ showNotification, tabColor, tiposVehiculo = [], zonasViaje = [] }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    costoServicio: '',
    tipoVehiculoId: '',
    zonaViajeId: ''
  });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({
      nombre: '',
      contacto: '',
      telefono: '',
      costoServicio: '',
      tipoVehiculoId: '',
      zonaViajeId: ''
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    return form.nombre && form.contacto && form.telefono && form.costoServicio && form.tipoVehiculoId && form.zonaViajeId;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      ...form,
      telefono: parseInt(form.telefono),
      costoServicio: parseFloat(form.costoServicio),
      fechaCreacion: editingId ?
        data.find(item => item.id === editingId).fechaCreacion :
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Transportista actualizado correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Transportista agregado correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        nombre: entity.nombre,
        contacto: entity.contacto,
        telefono: entity.telefono.toString(),
        costoServicio: entity.costoServicio.toString(),
        tipoVehiculoId: entity.tipoVehiculoId,
        zonaViajeId: entity.zonaViajeId
      });
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este transportista?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Transportista eliminado correctamente');
    }
  };

  const getTipoVehiculoNombre = (tipoVehiculoId) => {
    const tipoVehiculo = tiposVehiculo.find(tv => tv.id === tipoVehiculoId);
    return tipoVehiculo ? tipoVehiculo.descripcion : 'No especificado';
  };

  const getZonaViaje = (zonaViajeId) => {
    const zona = zonasViaje.find(z => z.id === zonaViajeId);
    return zona ? zona.nombre : 'No especificado';
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const tipoVehiculoNombre = getTipoVehiculoNombre(item.tipoVehiculoId);
    const zonaNombre = getZonaViaje(item.zonaViajeId);
    return (
      item.nombre.toLowerCase().includes(searchLower) ||
      item.contacto.toLowerCase().includes(searchLower) ||
      tipoVehiculoNombre.toLowerCase().includes(searchLower) ||
      zonaNombre.toLowerCase().includes(searchLower)
    );
  });

  const canSubmit = tiposVehiculo.length > 0 && zonasViaje.length > 0;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className={`text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Transportista' : 'Nuevo Transportista'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del transportista"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contacto *
                </label>
                <input
                  type="text"
                  name="contacto"
                  value={form.contacto}
                  onChange={handleInputChange}
                  placeholder="Persona de contacto"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="number"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo de Servicio *
                </label>
                <input
                  type="number"
                  name="costoServicio"
                  value={form.costoServicio}
                  onChange={handleInputChange}
                  placeholder="Costo del servicio"
                  step="0.01"
                  min="0"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Vehículo *
                </label>
                <select
                  name="tipoVehiculoId"
                  value={form.tipoVehiculoId}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Selecciona un tipo de vehículo</option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zona de Viaje *
                </label>
                <select
                  name="zonaViajeId"
                  value={form.zonaViajeId}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Selecciona una zona de viaje</option>
                  {zonasViaje.map(zona => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre}
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
                disabled={!canSubmit}
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${
                  !canSubmit 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : editingId
                      ? `bg-${tabColor}-500 hover:bg-${tabColor}-600`
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
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className={`bg-gradient-to-r from-${tabColor}-700 to-${tabColor}-800 text-white p-6`}>
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
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Información</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Detalles</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
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
                    <td className="px-4 py-3 text-sm font-medium">{item.nombre}</td>
                    <td className="px-4 py-3 text-sm">{item.contacto}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone size={12} className="mr-2" />
                          {item.telefono}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign size={12} className="mr-2" />
                          ${item.costoServicio?.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Truck size={12} className="mr-2" />
                          <span className="truncate max-w-[150px]" title={getTipoVehiculoNombre(item.tipoVehiculoId)}>
                            {getTipoVehiculoNombre(item.tipoVehiculoId)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin size={12} className="mr-2" />
                          <span className="truncate max-w-[150px]" title={getZonaViaje(item.zonaViajeId)}>
                            {getZonaViaje(item.zonaViajeId)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEntity(item.id)}
                          className={`p-2 bg-${tabColor}-500 text-white rounded-lg hover:bg-${tabColor}-600 transition-colors`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteEntity(item.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
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
    </div>
  );
};

export default Transportistas;