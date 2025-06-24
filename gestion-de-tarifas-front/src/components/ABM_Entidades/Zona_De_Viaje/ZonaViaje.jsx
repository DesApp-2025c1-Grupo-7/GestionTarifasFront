import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { getZonas, createZona, updateZona, deleteZona } from '../../../services/zona.service';

const ZonasViaje = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ origen: '', destino: '', distanciaKm: '', costoPorKm: '' });
  console.log(tabColor)


  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const zonas = await getZonas();

        const zonasAdaptadas = zonas.map(zona => ({
          ...zona,
          distanciaKm: zona.distancia,
          costoPorKm: zona.costoKilometro
        }));

        setData(zonasAdaptadas);
      } catch (error) {
        console.error('Error al obtener zonas de viaje:', error);
        showNotification('Error al cargar las zonas de viaje', 'error');
      }
    };

    fetchZonas();
  }, []);


  
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
    return (distancia * costoPorKm);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const entityData = {
      origen: form.origen,
      destino: form.destino,
      distancia: parseFloat(form.distanciaKm),
      costoKilometro: parseFloat(form.costoPorKm),
    };

    try {
      if (editingId) {
        const updatedZona = await updateZona(editingId, entityData);
        setData(data.map(item =>
          item.id === editingId
            ? {
                ...updatedZona,
                distanciaKm: updatedZona.distancia,
                costoPorKm: updatedZona.costoKilometro
              }
            : item
        ));
        showNotification('Zona de viaje actualizada correctamente');
      } else {
        const nuevaZona = await createZona(entityData);
        setData([...data, {
          ...nuevaZona,
          distanciaKm: nuevaZona.distancia,
          costoPorKm: nuevaZona.costoKilometro
        }]);
        showNotification('Zona de viaje agregada correctamente');
      }
      clearForm();
    } catch (error) {
      console.error('Error al guardar zona:', error);
      const mensaje = error?.response?.data?.message || 'Error al guardar la zona de viaje';
      showNotification(mensaje, 'error');
    }
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

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la zona de viaje definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteZona(id);
        setData(data.filter(item => item.id !== id));
        showNotification('Zona de viaje eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar zona:', error);
        const mensaje = error?.response?.data?.message || 'Error al eliminar la zona de viaje';
        showNotification(mensaje, 'error');
      }
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
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-xl   border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Zona de Viaje' : 'Nueva Zona de Viaje'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Origen *
                </label>
                <input
                  type="text"
                  name="origen"
                  value={form.origen}
                  onChange={handleInputChange}
                  placeholder="Ciudad o zona de origen"
                  className={`w-full p-3 border-2 text-gray-300 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Destino *
                </label>
                <input
                  type="text"
                  name="destino"
                  value={form.destino}
                  onChange={handleInputChange}
                  placeholder="Ciudad o zona de destino"
                  className={`w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                  className={`w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
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
                  className={`w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all`}
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
                className="px-6 py-3 bg-[#444240] border border-yellow-500 text-yellow-500 hover:text-white rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
              >
                Limpiar
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-[#444240] border border-red-500 text-red-500 hover:text-white rounded-lg hover:bg-red-500 transition-colors font-semibold"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={handleSubmit}
                className={`px-6 py-3 rounded-lg transition-colors font-semibold ${
                  editingId
                    ? `bg-[#444240] hover:bg-purple-500 border border-purple-500 text-purple-500 hover:text-white`
                    : 'hover:bg-green-500 hover:text-white border border-green-500 text-green-500'
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
        <div className={`bg-gradient-to-r from-purple-700 to-purple-800 text-white p-6`}>
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

        <div className="max-h-96 overflow-y-auto bg-[#444240] ">
          <table className="w-full">
            <thead className=" bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Origen</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Destino</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Distancia (Km)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Costo/Km ($)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Costo Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-300">
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
                          className={`p-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors`}
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

export default ZonasViaje;