import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

const ZonasViaje = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ origen: '', destino: '', distanciaKm: '', costoPorKm: '' });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({ origen: '', destino: '', distanciaKm: '', costoPorKm: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    return form.origen && form.destino && form.distanciaKm && form.costoPorKm;
  };

  const calculateTotalCost = (distancia, costoPorKm) => {
    return (distancia * costoPorKm).toFixed(2);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      ...form,
      distanciaKm: parseFloat(form.distanciaKm),
      costoPorKm: parseFloat(form.costoPorKm),
      fechaCreacion: editingId ?
        data.find(item => item.id === editingId).fechaCreacion :
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Zona de viaje actualizada correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Zona de viaje agregada correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        origen: entity.origen,
        destino: entity.destino,
        distanciaKm: entity.distanciaKm.toString(),
        costoPorKm: entity.costoPorKm.toString()
      });
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta zona de viaje?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Zona de viaje eliminada correctamente');
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.origen.toLowerCase().includes(searchLower) ||
      item.destino.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className={`text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Zona de Viaje' : 'Nueva Zona de Viaje'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  name="origen"
                  value={form.origen}
                  onChange={handleInputChange}
                  placeholder="Ciudad o zona de origen"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  name="destino"
                  value={form.destino}
                  onChange={handleInputChange}
                  placeholder="Ciudad o zona de destino"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distancia (Km) *
                </label>
                <input
                  type="number"
                  name="distanciaKm"
                  value={form.distanciaKm}
                  onChange={handleInputChange}
                  placeholder="Distancia en kilómetros"
                  min="0"
                  step="0.1"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo por Km ($) *
                </label>
                <input
                  type="number"
                  name="costoPorKm"
                  value={form.costoPorKm}
                  onChange={handleInputChange}
                  placeholder="Costo por kilómetro"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              {form.distanciaKm && form.costoPorKm && (
                <div className={`bg-${tabColor}-50 p-4 rounded-lg border border-${tabColor}-200`}>
                  <label className={`block text-sm font-semibold text-${tabColor}-700 mb-1`}>
                    Costo Total Estimado
                  </label>
                  <div className={`text-2xl font-bold text-${tabColor}-800`}>
                    ${calculateTotalCost(parseFloat(form.distanciaKm), parseFloat(form.costoPorKm))}
                  </div>
                </div>
              )}
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
            Zonas de Viaje Registradas
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por origen o destino..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Origen</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Destino</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Distancia (Km)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Costo/Km ($)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Costo Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🗺️</div>
                      <h3 className="text-lg font-semibold mb-2">No hay zonas de viaje registradas</h3>
                      <p>Comienza agregando una nueva zona de viaje usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium">{item.origen}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.destino}</td>
                    <td className="px-4 py-3 text-sm">{item.distanciaKm} km</td>
                    <td className="px-4 py-3 text-sm">${item.costoPorKm}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ${calculateTotalCost(item.distanciaKm, item.costoPorKm)}
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

export default ZonasViaje;