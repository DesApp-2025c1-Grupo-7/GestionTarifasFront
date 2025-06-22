import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X } from 'lucide-react';

const TarifaCosto = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdicionalesModal, setShowAdicionalesModal] = useState(false);
  const [adicionalForm, setAdicionalForm] = useState({ descripcion: '', costo: '' });
  
  const [form, setForm] = useState({
    tipoVehiculo: '',
    tipoCarga: '',
    zonaViaje: '',
    transportista: '',
    adicionales: [],
    costoFinal: 0
  });

  // Datos simulados de API 
  const [apiData, setApiData] = useState({
    tiposVehiculo: [
      { id: 1, nombre: 'Camión', costoPorKm: 2.5 },
      { id: 2, nombre: 'Camioneta', costoPorKm: 1.8 },
      { id: 3, nombre: 'Furgón', costoPorKm: 2.0 },
      { id: 4, nombre: 'Tráiler', costoPorKm: 3.2 }
    ],
    tiposCarga: [
      { id: 1, nombre: 'Carga General', multiplicador: 1.0 },
      { id: 2, nombre: 'Carga Frágil', multiplicador: 1.3 },
      { id: 3, nombre: 'Carga Peligrosa', multiplicador: 1.8 },
      { id: 4, nombre: 'Carga Refrigerada', multiplicador: 1.5 }
    ],
    zonasViaje: [
      { id: 1, origen: 'Buenos Aires', destino: 'Córdoba', distanciaKm: 695 },
      { id: 2, origen: 'Buenos Aires', destino: 'Rosario', distanciaKm: 300 },
      { id: 3, origen: 'Córdoba', destino: 'Mendoza', distanciaKm: 600 },
      { id: 4, origen: 'Buenos Aires', destino: 'Mar del Plata', distanciaKm: 400 }
    ],
    transportistas: [
      { id: 1, nombre: 'Transportes Rápidos SA', tarifaBase: 500 },
      { id: 2, nombre: 'Logística del Sur', tarifaBase: 450 },
      { id: 3, nombre: 'Cargas Eficientes', tarifaBase: 480 },
      { id: 4, nombre: 'Transporte Premium', tarifaBase: 550 }
    ]
  });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({
      tipoVehiculo: '',
      tipoCarga: '',
      zonaViaje: '',
      transportista: '',
      adicionales: [],
      costoFinal: 0
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCostoFinalChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm({ ...form, costoFinal: value });
  };

  // Calcular costo automáticamente
  const calculateCosto = () => {
    const vehiculo = apiData.tiposVehiculo.find(v => v.id.toString() === form.tipoVehiculo);
    const carga = apiData.tiposCarga.find(c => c.id.toString() === form.tipoCarga);
    const zona = apiData.zonasViaje.find(z => z.id.toString() === form.zonaViaje);
    const transportista = apiData.transportistas.find(t => t.id.toString() === form.transportista);

    if (!vehiculo || !carga || !zona || !transportista) return 0;

    const costoDistancia = vehiculo.costoPorKm * zona.distanciaKm;
    const costoConCarga = costoDistancia * carga.multiplicador;
    const costoBase = costoConCarga + transportista.tarifaBase;
    const costoAdicionales = form.adicionales.reduce((sum, adicional) => sum + parseFloat(adicional.costo || 0), 0);

    return costoBase + costoAdicionales;
  };

  // Actualizar costo automáticamente cuando cambian los campos
  useEffect(() => {
    const costoCalculado = calculateCosto();
    if (costoCalculado > 0 && costoCalculado !== form.costoFinal) {
      setForm(prev => ({ ...prev, costoFinal: costoCalculado }));
    }
  }, [form.tipoVehiculo, form.tipoCarga, form.zonaViaje, form.transportista, form.adicionales]);

  const validateForm = () => {
    return form.tipoVehiculo && form.tipoCarga && form.zonaViaje && form.transportista;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      ...form,
      costoFinal: parseFloat(form.costoFinal),
      fechaCreacion: editingId ?
        data.find(item => item.id === editingId).fechaCreacion :
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Tarifa de costo actualizada correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Tarifa de costo agregada correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm(entity);
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarifa de costo?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Tarifa de costo eliminada correctamente');
    }
  };

  // Manejar adicionales
  const handleAdicionalSubmit = () => {
    if (!adicionalForm.descripcion || !adicionalForm.costo) {
      showNotification('Por favor completa descripción y costo del adicional', 'error');
      return;
    }

    const nuevoAdicional = {
      id: generateId(),
      descripcion: adicionalForm.descripcion,
      costo: parseFloat(adicionalForm.costo)
    };

    setForm(prev => ({
      ...prev,
      adicionales: [...prev.adicionales, nuevoAdicional]
    }));

    setAdicionalForm({ descripcion: '', costo: '' });
    setShowAdicionalesModal(false);
    showNotification('Adicional agregado correctamente');
  };

  const removeAdicional = (id) => {
    setForm(prev => ({
      ...prev,
      adicionales: prev.adicionales.filter(adicional => adicional.id !== id)
    }));
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const vehiculo = apiData.tiposVehiculo.find(v => v.id.toString() === item.tipoVehiculo)?.nombre || '';
    const transportista = apiData.transportistas.find(t => t.id.toString() === item.transportista)?.nombre || '';
    
    return (
      vehiculo.toLowerCase().includes(searchLower) ||
      transportista.toLowerCase().includes(searchLower)
    );
  });

  const getEntityName = (entityArray, id) => {
    const entity = entityArray.find(item => item.id.toString() === id);
    return entity ? entity.nombre : 'N/A';
  };

  const getZonaName = (id) => {
    const zona = apiData.zonasViaje.find(z => z.id.toString() === id);
    return zona ? `${zona.origen} - ${zona.destino}` : 'N/A';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className={`text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tarifa de Costo' : 'Nueva Tarifa de Costo'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              {/* Tipo de Vehículo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Vehículo *
                </label>
                <select
                  name="tipoVehiculo"
                  value={form.tipoVehiculo}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Seleccionar tipo de vehículo</option>
                  {apiData.tiposVehiculo.map(vehiculo => (
                    <option key={vehiculo.id} value={vehiculo.id}>
                      {vehiculo.nombre} (${vehiculo.costoPorKm}/km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Carga */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Carga *
                </label>
                <select
                  name="tipoCarga"
                  value={form.tipoCarga}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Seleccionar tipo de carga</option>
                  {apiData.tiposCarga.map(carga => (
                    <option key={carga.id} value={carga.id}>
                      {carga.nombre} (x{carga.multiplicador})
                    </option>
                  ))}
                </select>
              </div>

              {/* Zona de Viaje */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Zona de Viaje *
                </label>
                <select
                  name="zonaViaje"
                  value={form.zonaViaje}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Seleccionar zona de viaje</option>
                  {apiData.zonasViaje.map(zona => (
                    <option key={zona.id} value={zona.id}>
                      {zona.origen} - {zona.destino} ({zona.distanciaKm} km)
                    </option>
                  ))}
                </select>
              </div>

              {/* Transportista */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transportista *
                </label>
                <select
                  name="transportista"
                  value={form.transportista}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Seleccionar transportista</option>
                  {apiData.transportistas.map(transportista => (
                    <option key={transportista.id} value={transportista.id}>
                      {transportista.nombre} (Base: ${transportista.tarifaBase})
                    </option>
                  ))}
                </select>
              </div>

              {/* Adicionales */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Adicionales
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdicionalesModal(true)}
                    className={`px-3 py-1 bg-${tabColor}-500 text-white rounded-lg hover:bg-${tabColor}-600 transition-colors text-sm flex items-center gap-1`}
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>
                
                {form.adicionales.length > 0 && (
                  <div className="space-y-2">
                    {form.adicionales.map(adicional => (
                      <div key={adicional.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          {adicional.descripcion} - ${adicional.costo}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAdicional(adicional.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Costo Final */}
              <div className={`bg-${tabColor}-50 p-4 rounded-lg border border-${tabColor}-200`}>
                <label className={`block text-sm font-semibold text-${tabColor}-700 mb-2`}>
                  Costo Final
                </label>
                <input
                  type="number"
                  value={form.costoFinal}
                  onChange={handleCostoFinalChange}
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border-2 border-${tabColor}-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all text-2xl font-bold text-${tabColor}-800`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Costo calculado automáticamente, pero puede modificarse
                </div>
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
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${
                  editingId
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
            Tarifas de Costo Registradas
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por vehículo o transportista..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehículo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Carga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Transportista</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Adicionales</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Costo Final</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-lg font-semibold mb-2">No hay tarifas de costo registradas</h3>
                      <p>Comienza agregando una nueva tarifa usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium">
                      {getEntityName(apiData.tiposVehiculo, item.tipoVehiculo)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getEntityName(apiData.tiposCarga, item.tipoCarga)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getZonaName(item.zonaViaje)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getEntityName(apiData.transportistas, item.transportista)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.adicionales.length > 0 ? (
                        <div className="text-xs">
                          {item.adicionales.map(add => add.descripcion).join(', ')}
                        </div>
                      ) : (
                        <span className="text-gray-400">Sin adicionales</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">
                      ${item.costoFinal.toFixed(2)}
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

      {/* Modal para Adicionales */}
      {showAdicionalesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Agregar Adicional</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={adicionalForm.descripcion}
                  onChange={(e) => setAdicionalForm({...adicionalForm, descripcion: e.target.value})}
                  placeholder="Ej: Seguro adicional, Peaje, etc."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo ($)
                </label>
                <input
                  type="number"
                  value={adicionalForm.costo}
                  onChange={(e) => setAdicionalForm({...adicionalForm, costo: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAdicionalesModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionalSubmit}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifaCosto;
