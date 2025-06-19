import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, AlertTriangle } from 'lucide-react';

const TiposCarga = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ 
    nombre: '', 
    descripcion: '',
    categoria: '', 
    pesoTotalEstimado: '', 
    volumenTotalEstimado: '', 
    valorBase: '', 
    esEspecial: false,
    requisitoEspecial: ''
  });

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const clearForm = () => {
    setForm({ 
      nombre: '', 
      descripcion: '',
      categoria: '', 
      pesoTotalEstimado: '', 
      volumenTotalEstimado: '', 
      valorBase: '', 
      esEspecial: false,
      requisitoEspecial: ''
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setForm({ 
        ...form, 
        [name]: checked,
        // Si no es especial, limpiar el requisito especial
        requisitoEspecial: name === 'esEspecial' && !checked ? '' : form.requisitoEspecial
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const basicValidation = form.nombre && 
                          form.descripcion &&
                          form.categoria && 
                          form.pesoTotalEstimado && 
                          form.volumenTotalEstimado && 
                          form.valorBase;
    
    if (!basicValidation) return false;
    
    // Si es especial, debe tener requisito especial
    if (form.esEspecial && !form.requisitoEspecial.trim()) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      if (form.esEspecial && !form.requisitoEspecial.trim()) {
        showNotification('Para cargas especiales, debes especificar el requisito especial', 'error');
      } else {
        showNotification('Por favor completa todos los campos requeridos', 'error');
      }
      return;
    }

    const entityData = {
      id: editingId || generateId(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria.trim(),
      pesoTotalEstimado: parseFloat(form.pesoTotalEstimado),
      volumenTotalEstimado: parseFloat(form.volumenTotalEstimado),
      valorBase: parseFloat(form.valorBase),
      esEspecial: form.esEspecial,
      requisitoEspecial: form.requisitoEspecial.trim(),
      fechaCreacion: editingId ? 
        data.find(item => item.id === editingId).fechaCreacion : 
        new Date().toISOString()
    };

    if (editingId) {
      setData(data.map(item => item.id === editingId ? entityData : item));
      showNotification('Tipo de carga actualizado correctamente');
    } else {
      setData([...data, entityData]);
      showNotification('Tipo de carga agregado correctamente');
    }

    clearForm();
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      setForm({
        nombre: entity.nombre,
        descripcion: entity.descripcion,
        categoria: entity.categoria,
        pesoTotalEstimado: entity.pesoTotalEstimado.toString(),
        volumenTotalEstimado: entity.volumenTotalEstimado.toString(),
        valorBase: entity.valorBase.toString(),
        esEspecial: entity.esEspecial,
        requisitoEspecial: entity.requisitoEspecial
      });
      setEditingId(id);
    }
  };

  const deleteEntity = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tipo de carga?')) {
      setData(data.filter(item => item.id !== id));
      showNotification('Tipo de carga eliminado correctamente');
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(searchLower) ||
      item.descripcion.toLowerCase().includes(searchLower) ||
      item.categoria.toLowerCase().includes(searchLower) ||
      item.requisitoEspecial.toLowerCase().includes(searchLower) ||
      item.pesoTotalEstimado.toString().includes(searchTerm) ||
      item.volumenTotalEstimado.toString().includes(searchTerm) ||
      item.valorBase.toString().includes(searchTerm)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatWeight = (weight) => {
    return `${weight} kg`;
  };

  const formatVolume = (volume) => {
    return `${volume} m³`;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h2 className={`text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tipo de Carga' : 'Nuevo Tipo de Carga'}
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
                  placeholder="Nombre del tipo de carga"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del tipo de carga"
                  rows="2"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleInputChange}
                  placeholder="Ej: Electrodomésticos, Productos químicos..."
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Peso Total Estimado (kg) *
                </label>
                <input
                  type="number"
                  name="pesoTotalEstimado"
                  value={form.pesoTotalEstimado}
                  onChange={handleInputChange}
                  placeholder="Peso estimado en kilogramos"
                  min="0"
                  step="0.1"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Volumen Total Estimado (m³) *
                </label>
                <input
                  type="number"
                  name="volumenTotalEstimado"
                  value={form.volumenTotalEstimado}
                  onChange={handleInputChange}
                  placeholder="Volumen estimado en metros cúbicos"
                  min="0"
                  step="0.1"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valor Base ($) *
                </label>
                <input
                  type="number"
                  name="valorBase"
                  value={form.valorBase}
                  onChange={handleInputChange}
                  placeholder="Valor base del servicio"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all`}
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="esEspecial"
                  name="esEspecial"
                  checked={form.esEspecial}
                  onChange={handleInputChange}
                  className={`w-5 h-5 text-${tabColor}-600 border-gray-300 rounded focus:ring-${tabColor}-500`}
                />
                <div>
                  <label htmlFor="esEspecial" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    ¿Es carga especial?
                  </label>
                  <p className="text-xs text-gray-500">Marca si requiere manejo o transporte especial</p>
                </div>
              </div>

              {form.esEspecial && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requisito Especial *
                  </label>
                  <textarea
                    name="requisitoEspecial"
                    value={form.requisitoEspecial}
                    onChange={handleInputChange}
                    placeholder="Describe los requisitos especiales para el manejo de esta carga..."
                    rows="3"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-red-600 mt-1">
                    <AlertTriangle size={12} className="inline mr-1" />
                    Este campo es obligatorio para cargas especiales
                  </p>
                </div>
              )}
              
              {/* Mostrar valor base formateado */}
              {form.valorBase && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <label className="block text-sm font-semibold text-green-700 mb-1">
                    Valor Base Formateado
                  </label>
                  <div className="text-2xl font-bold text-green-800">
                    {formatCurrency(parseFloat(form.valorBase))}
                  </div>
                </div>
              )}

              {/* Mostrar resumen de especificaciones */}
              {(form.pesoTotalEstimado || form.volumenTotalEstimado) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Especificaciones
                  </label>
                  <div className="space-y-1 text-sm text-blue-800">
                    {form.pesoTotalEstimado && (
                      <p><strong>Peso:</strong> {formatWeight(parseFloat(form.pesoTotalEstimado))}</p>
                    )}
                    {form.volumenTotalEstimado && (
                      <p><strong>Volumen:</strong> {formatVolume(parseFloat(form.volumenTotalEstimado))}</p>
                    )}
                    {form.pesoTotalEstimado && form.volumenTotalEstimado && (
                      <p><strong>Densidad:</strong> {(parseFloat(form.pesoTotalEstimado) / parseFloat(form.volumenTotalEstimado)).toFixed(2)} kg/m³</p>
                    )}
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
            Tipos de Carga Registrados
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, categoría, peso, volumen, valor o requisito..."
              className="w-full max-w-md pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:bg-white/20"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre / Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Especificaciones</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-lg font-semibold mb-2">No hay tipos de carga registrados</h3>
                      <p>Comienza agregando un nuevo tipo de carga usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{item.nombre}</div>
                      <div className="text-sm text-gray-600">{item.categoria}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.descripcion}</div>
                      {item.esEspecial && item.requisitoEspecial && (
                        <div className="text-xs text-orange-600 mt-1 bg-orange-50 px-2 py-1 rounded max-w-xs">
                          <AlertTriangle size={10} className="inline mr-1" />
                          {item.requisitoEspecial.length > 50 
                            ? `${item.requisitoEspecial.substring(0, 50)}...`
                            : item.requisitoEspecial
                          }
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        <div><strong>Peso:</strong> {formatWeight(item.pesoTotalEstimado)}</div>
                        <div><strong>Volumen:</strong> {formatVolume(item.volumenTotalEstimado)}</div>
                        <div className="text-xs text-gray-500">
                          Densidad: {(item.pesoTotalEstimado / item.volumenTotalEstimado).toFixed(2)} kg/m³
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {formatCurrency(item.valorBase)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.esEspecial 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.esEspecial && <AlertTriangle size={12} className="mr-1" />}
                        {item.esEspecial ? 'Especial' : 'Regular'}
                      </span>
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

export default TiposCarga;