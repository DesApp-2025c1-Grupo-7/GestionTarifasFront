import React, { useEffect, useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { createVehiculo, deleteVehiculo, getVehiculos, updateVehiculo } from '../../../services/tipoVehiculo.service';
import Swal from 'sweetalert2';
import { getCargas } from '../../../services/tipoCarga.service';

const TiposVehiculo = ({ showNotification, tabColor }) => {
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Modificado: Se quita precioBase del estado inicial del formulario
  const [form, setForm] = useState({ descripcion: '', tipoCargaIds: [] });
  const [tiposCarga, setTiposCarga] = useState([]);

  useEffect(() => {
    const fetchTiposCarga = async () => {
      try {
        const cargas = await getCargas();
        setTiposCarga(cargas);
      } catch (error) {
        showNotification('Error al cargar los tipos de carga', 'error');
      }
    };
    fetchTiposCarga();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vehiculos = await getVehiculos();
        setData(vehiculos);
      } catch (error) {
        console.error('Error al cargar tipos de vehículo', error);
        showNotification('Error al cargar tipos de vehículo', 'error');
      }
    };
    fetchData();
  }, []);

  const clearForm = () => {
    // Modificado: Se quita precioBase al limpiar el formulario
    setForm({ descripcion: '', tipoCargaIds: [] });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleTipoCargaChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setForm({ ...form, tipoCargaIds: selected });
    console.log("Tipo de carga seleccionados:", selected);
  };

  // Modificado: Se quita la validación de precioBase
  const validateForm = () => {
    return form.descripcion && form.tipoCargaIds.length > 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Modificado: Se quita precioBase de los datos a enviar
    const entityData = {
      descripcion: form.descripcion.trim(),
      tipoCargas: form.tipoCargaIds.map(id => parseInt(id))
    };

    try {
      if (editingId) {
        const updated = await updateVehiculo(editingId, entityData);
        setData(data.map(item => item.id === editingId ? updated : item));
        showNotification('Tipo de vehículo actualizado correctamente');
      } else {
        const creado = await createVehiculo(entityData);
        setData([...data, creado]);
        showNotification('Tipo de vehículo agregado correctamente');
      }
      clearForm();
    } catch (error) {
      console.error('Error al guardar tipo de vehículo', error);
      const msg = error?.response?.data?.message || 'Error al guardar tipo de vehículo';
      showNotification(msg, 'error');
    }
  };

  const editEntity = (id) => {
    const entity = data.find(item => item.id === id);
    if (entity) {
      // Modificado: Se quita precioBase al popular el formulario para edición
      setForm({
        descripcion: entity.descripcion,
        tipoCargaIds: (entity.tipoCargas || []).map(tc => tc.id.toString())
      });
      setEditingId(id);
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de vehículo definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteVehiculo(id);
        setData(data.filter(item => item.id !== id));
        showNotification('Tipo de vehículo eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar tipo de vehículo:', error);
        const mensaje = error?.response?.data?.message || 'Error al eliminar el tipo de vehículo';
        showNotification(mensaje, 'error');
      }
    }
  };

  const getTipoCargaNombre = (tipoCargaArr) => {
    if (Array.isArray(tipoCargaArr) && tipoCargaArr.length > 0) {
      return tipoCargaArr.map(tc => tc.categoria).join(', ');
    }
    return 'No especificado';
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const tipoCargaNombre = getTipoCargaNombre(item.tipoCargas);
    return (
      item.descripcion.toLowerCase().includes(searchLower) ||
      tipoCargaNombre.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-xl border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tipo de Vehículo' : 'Nuevo Tipo de Vehículo'}
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Descripción *</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del tipo de vehículo"
                  rows="3"
                  className={`w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-${tabColor}-500 focus:outline-none transition-all resize-none`}
                />
              </div>
              {/* Eliminado: Bloque del input para Precio Base */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Carga *</label>
                <select
                  multiple
                  name="tipoCargaIds"
                  value={form.tipoCargaIds}
                  onChange={handleTipoCargaChange}
                  className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
                >
                  {tiposCarga.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.categoria}
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
                    ? `bg-[#444240] text-green-500 border border-green-500 hover:text-white hover:bg-green-500`
                    : 'bg-[#444240] border border-green-500 text-green-500 hover:text-white hover:bg-green-500'
                }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-green-700 to-green-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tipos de Vehículo Registrados</h2>
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
                {/* Eliminado: Cabecera de la tabla para Precio Base */}
                <th className="px-4 py-3 text-left text-sm font-semibold ">Tipo de Carga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold ">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  {/* Modificado: colSpan cambia de 4 a 3 */}
                  <td colSpan="3" className="px-4 py-12 text-center text-gray-300">
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
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.descripcion}</td>
                    {/* Eliminado: Celda de la tabla para mostrar el precioBase */}
                    <td className="px-4 py-3 text-sm text-neutral-200">{getTipoCargaNombre(item.tipoCargas)}</td>
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