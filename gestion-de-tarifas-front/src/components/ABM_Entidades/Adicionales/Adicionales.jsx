import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAdicionales, createAdicional, updateAdicional, deleteAdicional } from '../../../services/adicional.service';
import Select from 'react-select';

const Adicionales = ({ showNotification, tabColor }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ descripcion: '', costo: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adicionales = await getAdicionales();
        const mapped = adicionales.map(a => ({ ...a, id: a.idAdicional }));
        setData(mapped);
      } catch (error) {
        showNotification('Error al cargar los adicionales', 'error');
      }
    };
    fetchData();
  }, []);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      descripcion: form.descripcion,
      costo: parseFloat(form.costo),
    };

    try {
      if (editingId) {
        const updatedAdicional = await updateAdicional(editingId, entityData);
        setData(data.map(item =>
          item.id === editingId ? { ...item, ...updatedAdicional } : item
        ));
        showNotification('Adicional actualizado correctamente');
      } else {
        const nuevoAdicional = await createAdicional(entityData);
        setData([...data, nuevoAdicional]);
        showNotification('Adicional agregado correctamente');
      }

      clearForm();
    } catch (error) {
      console.error('Error al guardar adicional:', error);
      const mensaje = error?.response?.data?.message || 'Error al guardar el adicional';
      showNotification(mensaje, 'error');
    }
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

  const deleteEntity = async (id) => {
    const idNumber = Number(id);
    if (!idNumber || isNaN(idNumber)) {
      showNotification('ID inválido para eliminar', 'error');
      return;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el adicional definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteAdicional(idNumber);
        setData(data.filter(item => item.id !== idNumber));
        showNotification('Adicional eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar adicional:', error);
        const mensaje = error?.response?.data?.message || 'Error al eliminar el adicional';
        showNotification(mensaje, 'error');
      }
    }
  };

  const handleViewReport = () => {
    navigate('/reports/adicionales');
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return item.descripcion.toLowerCase().includes(searchLower);
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-indigo-500`}>
            {editingId ? 'Editar Adicional' : 'Nuevo Adicional'}
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
                  placeholder="Describe el servicio adicional"
                  rows="3"
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-indigo-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-indigo-500 focus:outline-none transition-all`}
                />
              </div>

              {form.costo && (
                <div className={`bg-indigo-50 p-4 rounded-lg border border-indigo-200`}>
                  <label className={`block text-sm font-semibold text-indigo-700 mb-1`}>
                    Costo del Servicio
                  </label>
                  <div className={`text-2xl font-bold text-indigo-800`}>
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

      {/* Tabla de registros */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Adicionales Registrados</h2>
            <button
              onClick={handleViewReport}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm border border-white/30"
              title="Ver reportes y análisis de adicionales"
            >
              <BarChart3 size={18} />
              <span className="font-medium">Ver Reportes</span>
            </button>
          </div>

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
            <thead className="bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Costo ($)</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🛎️</div>
                      <h3 className="text-lg font-semibold mb-2">No hay servicios adicionales registrados</h3>
                      <p>Comienza agregando un nuevo servicio adicional usando el formulario</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-indigo-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium max-w-xs">
                      <div className="truncate text-neutral-200" title={item.descripcion}>
                        {item.descripcion}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ${Number(item.costo).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => editEntity(item.id)}
                          className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteEntity(item.idAdicional)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
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
