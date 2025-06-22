import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

const Adicionales = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ descripcion: '', costo: '' });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({ descripcion: '', costo: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    return form.descripcion && form.costo;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      descripcion: form.descripcion,
      costo: parseFloat(form.costo),
      fechaCreacion: editingId ?
        data.find(item => item.id === editingId).fechaCreacion :
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Adicional actualizado correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Adicional agregado correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        descripcion: entity.descripcion,
        costo: entity.costo.toString()
      });
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este adicional?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Adicional eliminado correctamente');
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return item.descripcion.toLowerCase().includes(searchLower);
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className={`text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Adicional' : 'Nuevo Adicional'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Describe el servicio adicional"
                  rows="3"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Costo ($) *
                </label>
                <input
                  type="number"
                  name="costo"
                  value={form.costo}
                  onChange={handleInputChange}
                  placeholder="Costo del servicio adicional"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              {form.costo && (
                <div className={`bg-${tabColor}-50 p-4 rounded-lg border border-${tabColor}-200`}>
                  <label className={`block text-sm font-semibold text-${tabColor}-700 mb-1`}>
                    Costo del Servicio
                  </label>
                  <div className={`text-2xl font-bold text-${tabColor}-800`}>
                    ${parseFloat(form.costo).toFixed(2)}
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
            Servicios Adicionales Registrados
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descripción..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Costo ($)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha Creación</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🛎️</div>
                      <h3 className="text-lg font-semibold mb-2">No hay servicios adicionales registrados</h3>
                      <p>Comienza agregando un nuevo servicio adicional usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium max-w-xs">
                      <div className="truncate" title={item.descripcion}>
                        {item.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ${item.costo.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(item.fechaCreacion).toLocaleDateString('es-ES')}
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

export default Adicionales;