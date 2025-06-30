import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getCargas } from '../../../services/tipoCarga.service';
import { getZonas } from '../../../services/zona.service';
import { getTransportista } from '../../../services/transportista.service';
import { getTarifas, deleteTarifa, updateTarifaCosto, createTarifa } from '../../../services/tarifaCosto.service';
import Swal from 'sweetalert2';

const TarifaCosto = ({ showNotification, tabColor }) => {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [tiposCarga, setTiposCargas] = useState([]);
  const [zonasDeViaje, setZonasDeViaje] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [tarifas, setTarifasCosto] = useState([]);
  

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    tipoVehiculo: '',
    tipoCarga: '',
    zonaDeViaje: '',
    transportista: '',
    valorBase: '',
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vehiculoData, cargaData, zonasData, transportistaData, tarifasData] = await Promise.all([
          getVehiculos(),
          getCargas(),
          getZonas(),
          getTransportista(),
          getTarifas()
        ]);
        setTiposVehiculo(vehiculoData);
        setTiposCargas(cargaData);
        setZonasDeViaje(zonasData);
        setTransportistas(transportistaData);
        setTarifasCosto(tarifasData.data);
      } catch (error) {
        showNotification('Error al cargar datos', 'error');
      }
    };
    fetchAll();
  }, []);

  const clearForm = () => {
    setForm({
      tipoVehiculo: '',
      tipoCarga: '',
      zonaDeViaje: '',
      transportista: '',
      valorBase: '',
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleValorBaseChange = (e) => {
    const value = parseFloat(e.target.value);
    setForm({ ...form, valorBase: value });
  };

  const validateForm = () => {
    return form.tipoVehiculo && form.tipoCarga && form.zonaDeViaje && form.transportista && form.valorBase;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const payload = {
      valorBase: Number(form.valorBase),
      tipoVehiculo: Number(form.tipoVehiculo),
      zonaDeViaje: Number(form.zonaDeViaje),
      transportista: Number(form.transportista),
      tipoCarga: Number(form.tipoCarga),
    };

    try {
      if (editingId) {
        await updateTarifaCosto(editingId, payload);
        showNotification('Tarifa de costo actualizada correctamente');
      } else {
        await createTarifa(payload);
        showNotification('Tarifa de costo agregada correctamente');
      }
      const tarifasActualizadas = await getTarifas();
      setTarifasCosto(tarifasActualizadas.data);
      clearForm();
    } catch (error) {
      console.error('Error al guardar tarifa:', error);
      showNotification('Error al guardar la tarifa', 'error');
    }
  };

  const editEntity = (id) => {
    const tarifa = tarifas.find(item => item.id === id);
    if (tarifa) {
      setForm({
        tipoVehiculo: tarifa.tipoVehiculo?.id?.toString() || '',
        tipoCarga: tarifa.tipoCarga?.id?.toString() || '',
        zonaDeViaje: tarifa.zonaDeViaje?.id?.toString() || '',
        transportista: tarifa.transportista?.id?.toString() || '',
        valorBase: tarifa.valor_base?.toString() || '',
      });
      setEditingId(id);
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarifa de costo definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteTarifa(id);
        const tarifasActualizadas = await getTarifas();
        setTarifasCosto(tarifasActualizadas.data);
        showNotification('Tarifa de costo eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar tarifa:', error);
        showNotification('Error al eliminar tarifa', 'error');
      }
    }
  };

  const filteredData = tarifas.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const vehiculoDesc = item.tipoVehiculo?.descripcion?.toLowerCase() || '';
    const transportistaNom = item.transportista?.nombre?.toLowerCase() || '';
    return (
      vehiculoDesc.includes(searchLower) ||
      transportistaNom.includes(searchLower)
    );
  });

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-${tabColor}-500`}>
            {editingId ? 'Editar Tarifa de Costo' : 'Nueva Tarifa de Costo'}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo de Vehículo *
              </label>
              <select
                name="tipoVehiculo"
                value={form.tipoVehiculo}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="" className="text-gray-900">Seleccionar tipo de vehículo</option>
                {tiposVehiculo.map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id} className="text-gray-900">
                    {vehiculo.descripcion} (${vehiculo.precioBase}/km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo de Carga *
              </label>
              <select
                name="tipoCarga"
                value={form.tipoCarga}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="" className="text-gray-900">Seleccionar tipo de carga</option>
                {tiposCarga.map(carga => (
                  <option key={carga.id} value={carga.id} className="text-gray-900">
                    {carga.categoria} (${carga.valorBase})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Zona de Viaje *
              </label>
              <select
                name="zonaDeViaje"
                value={form.zonaDeViaje}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="" className="text-gray-900">Seleccionar zona de viaje</option>
                {zonasDeViaje.map(zona => (
                  <option key={zona.id} value={zona.id} className="text-gray-900">
                    {zona.origen} - {zona.destino} | {zona.distancia} km (${zona.distancia * zona.costoKilometro})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Transportista *
              </label>
              <select
                name="transportista"
                value={form.transportista}
                onChange={handleInputChange}
                className={`w-full p-3 border-2 border-gray-200 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}
              >
                <option value="" className="text-gray-900">Seleccionar transportista</option>
                {transportistas.map(transportista => (
                  <option key={transportista.id} value={transportista.id} className="text-gray-900">
                    {transportista.nombre} (Base: ${transportista.costoServicio})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                Valor Base
              </label>
              <input
                type="number"
                value={form.valorBase}
                onChange={handleValorBaseChange}
                min="0"
                step="0.01"
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-400 focus:outline-none transition-all text-xl font-bold text-blue-600"
              />
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

      {/* Tabla */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-${tabColor}-700 to-${tabColor}-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tarifas de Costo Registradas</h2>
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
            <thead className="bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vehículo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Carga</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Transportista</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Valor Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr key={item.id} className={`border-b border-gray-100 hover:bg-${tabColor}-50/50 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-200">
                      {item.tipoVehiculo?.descripcion || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.tipoCarga?.categoria || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.zonaDeViaje ? `${item.zonaDeViaje.origen} - ${item.zonaDeViaje.destino}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.transportista?.nombre || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                      ${Number(item.valor_base).toFixed(2)}
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
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-lg font-semibold mb-2">No hay tarifas de costo registradas</h3>
                      <p>Comienza agregando una nueva tarifa usando el formulario</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TarifaCosto;
