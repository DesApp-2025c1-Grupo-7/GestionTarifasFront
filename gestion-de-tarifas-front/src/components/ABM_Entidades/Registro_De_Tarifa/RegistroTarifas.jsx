import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import Select from 'react-select';
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
  const [filteredTarifas, setFilteredTarifas] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  
  // Estado para los filtros avanzados
  const [filters, setFilters] = useState({
    tipoVehiculo: null,
    tipoCarga: null,
    zonaDeViaje: null,
    transportista: null,
  });

  const [form, setForm] = useState({
    tipoVehiculo: '',
    tipoCarga: '',
    zonaDeViaje: '',
    transportista: '',
    valorBase: '',
  });

  // Carga inicial de datos para los formularios y la tabla
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
        setFilteredTarifas(tarifasData.data); // Inicialmente mostrar todas las tarifas
      } catch (error) {
        showNotification('Error al cargar datos', 'error');
      }
    };
    fetchAll();
  }, []);

  // Lógica de filtrado que se ejecuta cuando cambian los filtros o las tarifas
  useEffect(() => {
    let dataToFilter = [...tarifas];

    if (filters.tipoVehiculo) {
      dataToFilter = dataToFilter.filter(item => item.tipoVehiculo?.id === filters.tipoVehiculo.value);
    }
    if (filters.transportista) {
      dataToFilter = dataToFilter.filter(item => item.transportista?.id === filters.transportista.value);
    }
    if (filters.zonaDeViaje) {
      dataToFilter = dataToFilter.filter(item => item.zonaDeViaje?.id === filters.zonaDeViaje.value);
    }
    if (filters.tipoCarga) {
      dataToFilter = dataToFilter.filter(item => item.tipoCarga?.id === filters.tipoCarga.value);
    }

    setFilteredTarifas(dataToFilter);
  }, [filters, tarifas]);


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

  // --- Opciones para los Selectores de Filtro ---
  const vehiculoOptions = tiposVehiculo.map(v => ({ value: v.id, label: v.descripcion }));
  const transportistaOptions = transportistas.map(t => ({ value: t.id, label: t.nombre }));
  const zonaOptions = zonasDeViaje.map(z => ({ value: z.id, label: `${z.origen} - ${z.destino}` }));
  const cargaOptions = tiposCarga.map(c => ({ value: c.id, label: c.categoria }));

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderColor: 'rgba(255,255,255,0.3)',
      color: 'white',
      minWidth: '160px',
      fontSize: '0.875rem',
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423',
      color: 'white'
    }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
  };
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Formulario */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-emerald-500`}>
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
                className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-emerald-500 focus:outline-none transition-all`}
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
                className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-emerald-500 focus:outline-none transition-all`}
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
                className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-emerald-500 focus:outline-none transition-all`}
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
                className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-emerald-500 focus:outline-none transition-all`}
              >
                <option value="" className="text-gray-900">Seleccionar transportista</option>
                {transportistas.map(transportista => (
                  <option key={transportista.id} value={transportista.id} className="text-gray-900">
                    {transportista.nombre} (Base: ${transportista.costoServicio})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400">
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Valor Base
              </label>
              <input
                type="number"
                name="valorBase"
                value={form.valorBase}
                onChange={handleValorBaseChange}
                min="0"
                step="0.01"
                className="w-full p-3 bg-transparent border-2 border-blue-400 rounded-lg focus:border-blue-300 focus:outline-none transition-all text-xl font-bold text-blue-300"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-700">
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
                    ? `bg-emerald-500 hover:bg-emerald-600`
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla y Filtros */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tarifas de Costo Registradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              options={vehiculoOptions}
              placeholder="Filtrar por Vehículo"
              isClearable
              value={filters.tipoVehiculo}
              onChange={selectedOption => setFilters({ ...filters, tipoVehiculo: selectedOption })}
              styles={customSelectStyles}
            />
            <Select
              options={transportistaOptions}
              placeholder="Filtrar por Transportista"
              isClearable
              value={filters.transportista}
              onChange={selectedOption => setFilters({ ...filters, transportista: selectedOption })}
              styles={customSelectStyles}
            />
            <Select
              options={zonaOptions}
              placeholder="Filtrar por Zona"
              isClearable
              value={filters.zonaDeViaje}
              onChange={selectedOption => setFilters({ ...filters, zonaDeViaje: selectedOption })}
              styles={customSelectStyles}
            />
            <Select
              options={cargaOptions}
              placeholder="Filtrar por Carga"
              isClearable
              value={filters.tipoCarga}
              onChange={selectedOption => setFilters({ ...filters, tipoCarga: selectedOption })}
              styles={customSelectStyles}
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
              {filteredTarifas.length > 0 ? (
                filteredTarifas.map(item => (
                  <tr key={item.id} className={`border-b border-gray-700 hover:bg-emerald-500/10 transition-colors`}>
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
                    <td className="px-4 py-3 text-sm font-bold text-blue-400">
                      ${Number(item.valor_base).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editEntity(item.id)}
                          className={`p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors`}
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
                      <h3 className="text-lg font-semibold mb-2">No se encontraron tarifas</h3>
                      <p>Intenta ajustar los filtros o agrega una nueva tarifa.</p>
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
