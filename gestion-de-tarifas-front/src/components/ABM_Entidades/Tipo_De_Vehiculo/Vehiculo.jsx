import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';

const TiposVehiculo = ({ showNotification, tabColor, tiposCarga = [] }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ descripcion: '', precioBase: '', tipoCargaId: '' });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({ descripcion: '', precioBase: '', tipoCargaId: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    return form.descripcion && form.precioBase && form.tipoCargaId;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      ...form,
      precioBase: parseFloat(form.precioBase),
      fechaCreacion: editingId ?
        data.find(item => item.id === editingId).fechaCreacion :
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Tipo de vehículo actualizado correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Tipo de vehículo agregado correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        descripcion: entity.descripcion,
        precioBase: entity.precioBase.toString(),
        tipoCargaId: entity.tipoCargaId
      });
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de vehículo?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Tipo de vehículo eliminado correctamente');
    }
  };

  const getTipoCargaNombre = (tipoCargaId) => {
    const tipoCarga = tiposCarga.find(tc => tc.id === tipoCargaId);
    return tipoCarga ? tipoCarga.nombre : 'No especificado';
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const tipoCargaNombre = getTipoCargaNombre(item.tipoCargaId);
    return (
      item.descripcion.toLowerCase().includes(searchLower) ||
      tipoCargaNombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-xl border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del tipo de vehículo"
                  rows="3"
                  className={`w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all resize-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Precio Base *
                </label>
                <input
                  type="number"
                  name="precioBase"
                  value={form.precioBase}
                  onChange={handleInputChange}
                  placeholder="Precio base del vehículo"
                  step="0.01"
                  min="0"
                  className={`w-full p-3 border-2 border-gray-200 text-gray-300 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo de Carga *
                </label>
                <select
                  name="tipoCargaId"
                  value={form.tipoCargaId}
                  onChange={handleInputChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  <option value="">Selecciona un tipo de carga</option>
                  {tiposCarga.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
                {tiposCarga.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    ⚠️ Primero debes crear tipos de carga en la pestaña correspondiente
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 bg-[#444240] text-yellow-500 border border-yellow-500 hover:text-white rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-[#444240] text-red-500 rounded-lg border border-red-500 hover:text-white hover:bg-red-500 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={tiposCarga.length === 0}
                className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${
                  tiposCarga.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : editingId
                      ? `bg-[#444240] text-green-500 border border-green-500 hover:text-white  hover:bg-green-500`
                      : 'bg-[#444240] border border-green-500 text-green-500 hover:text-white hover:bg-green-500'
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
        <div className={`bg-gradient-to-r from-green-700 to-green-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">
            Tipos de Vehículo Registrados
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tipos de vehículo..."
              className="w-full max-w-xs pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto bg-[#444240]">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr className='text-gray-300'>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Precio Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Tipo de Carga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🚛</div>
                      <h3 className="text-lg font-semibold mb-2">No hay tipos de vehículo registrados</h3>
                      <p>Comienza agregando un nuevo tipo de vehículo usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm">{item.descripcion}</td>
                    <td className="px-4 py-3 text-sm font-medium">${item.precioBase?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{getTipoCargaNombre(item.tipoCargaId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEntity(item.id)}
                          className={`p-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors`}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteEntity(item.id)}
                          className="p-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
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

export default TiposVehiculo;