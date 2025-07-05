import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, ChevronDown, ChevronUp,  Eye } from 'lucide-react';
import Select from 'react-select';
import Swal from 'sweetalert2';

import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getCargas } from '../../../services/tipoCarga.service';
import { getZonas } from '../../../services/zona.service';
import { getTransportista } from '../../../services/transportista.service';
import { getTarifas, deleteTarifa, updateTarifaCosto, createTarifa } from '../../../services/tarifaCosto.service';
import { getAdicionales, createAdicional as createAdicionalService } from '../../../services/adicional.service';

const TarifaCosto = ({ showNotification, tabColor = 'emerald' }) => {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [tiposCarga, setTiposCargas] = useState([]);
  const [zonasDeViaje, setZonasDeViaje] = useState([]);
  const [transportistas, setTransportistas] = useState([]);
  const [tarifas, setTarifasCosto] = useState([]);
  const [filteredTarifas, setFilteredTarifas] = useState([]);
  const [adicionales, setAdicionales] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [showAdicionalesForm, setShowAdicionalesForm] = useState(false);
  const [showAdicionalesSelector, setShowAdicionalesSelector] = useState(false);
  const [adicionalSearch, setAdicionalSearch] = useState('');
  const [nuevoAdicional, setNuevoAdicional] = useState({ descripcion: '', costo: '' });

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
    adicionalesSeleccionados: [],
  });

  // MODAL detalle
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vehiculoData, cargaData, zonasData, transportistaData, tarifasData, adicionalesData] = await Promise.all([
          getVehiculos(),
          getCargas(),
          getZonas(),
          getTransportista(),
          getTarifas(),
          getAdicionales()
        ]);
        setTiposVehiculo(vehiculoData || []);
        setTiposCargas(cargaData || []);
        setZonasDeViaje(zonasData || []);
        setTransportistas(transportistaData || []);
        setTarifasCosto(tarifasData || []);
        setFilteredTarifas(tarifasData || []);
        setAdicionales(adicionalesData || []);
      } catch (error) {
        showNotification('Error al cargar datos iniciales', 'error');
        console.error(error);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    let dataToFilter = [...(tarifas || [])];
    if (filters.tipoVehiculo) dataToFilter = dataToFilter.filter(item => item.tipoVehiculo?.id === filters.tipoVehiculo.value);
    if (filters.transportista) dataToFilter = dataToFilter.filter(item => item.transportista?.id === filters.transportista.value);
    if (filters.zonaDeViaje) dataToFilter = dataToFilter.filter(item => item.zonaDeViaje?.id === filters.zonaDeViaje.value);
    if (filters.tipoCarga) dataToFilter = dataToFilter.filter(item => item.tipoCarga?.id === filters.tipoCarga.value);
    setFilteredTarifas(dataToFilter);
  }, [filters, tarifas]);

  const clearForm = () => {
    setForm({
      tipoVehiculo: '',
      tipoCarga: '',
      zonaDeViaje: '',
      transportista: '',
      valorBase: '',
      adicionalesSeleccionados: [],
    });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  // --- FUNCIÓN CORREGIDA ---
  const handleValorBaseChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setForm({ ...form, valorBase: value });
  };
  
  const handleAdicionalCostoChange = (idAdicional, nuevoCosto) => {
    const costoNumerico = parseFloat(nuevoCosto) || 0;
    const adicionalesActualizados = form.adicionalesSeleccionados.map(ad => {
      if (ad.idAdicional === idAdicional) {
        return { ...ad, costo: costoNumerico };
      }
      return ad;
    });
    setForm(prevForm => ({ ...prevForm, adicionalesSeleccionados: adicionalesActualizados }));
  };

  const agregarAdicional = async () => {
    if (!nuevoAdicional.descripcion || !nuevoAdicional.costo) {
      showNotification('Complete descripción y costo del adicional', 'error');
      return;
    }
    try {
      const payload = {
        descripcion: nuevoAdicional.descripcion,
        costo: parseFloat(nuevoAdicional.costo)
      };
      await createAdicionalService(payload);
      const adicionalesActualizados = await getAdicionales();
      setAdicionales(adicionalesActualizados);
      setNuevoAdicional({ descripcion: '', costo: '' });
      setShowAdicionalesForm(false);
      showNotification('Adicional agregado correctamente');
    } catch (error) {
      console.error(error);
      showNotification('Error al guardar el nuevo adicional', 'error');
    }
  };

  const seleccionarAdicional = (adicional) => {
    const yaSeleccionado = form.adicionalesSeleccionados.find(a => a.idAdicional === adicional.idAdicional);
    if (yaSeleccionado) {
      setForm({
        ...form,
        adicionalesSeleccionados: form.adicionalesSeleccionados.filter(a => a.idAdicional !== adicional.idAdicional)
      });
    } else {
      setForm({
        ...form,
        adicionalesSeleccionados: [...form.adicionalesSeleccionados, adicional]
      });
    }
  };

  const removerAdicionalSeleccionado = (idAdicional) => {
    setForm({
      ...form,
      adicionalesSeleccionados: form.adicionalesSeleccionados.filter(a => a.idAdicional !== idAdicional)
    });
  };

  const adicionalesFiltrados = (adicionales || []).filter(adicional =>
    adicional.descripcion.toLowerCase().includes(adicionalSearch.toLowerCase())
  );

  const calcularCostoTotal = () => {
    const base = parseFloat(form.valorBase) || 0;
    const adicional = form.adicionalesSeleccionados.reduce((sum, item) => sum + parseFloat(item.costo), 0);
    return base + adicional;
  };

  const validateForm = () => {
    return form.tipoVehiculo && form.tipoCarga && form.zonaDeViaje && form.transportista && form.valorBase !== '';
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
      adicionales: form.adicionalesSeleccionados.map(a => ({
          idAdicional: a.idAdicional,
          costo: parseFloat(a.costo)
      })),
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
      setTarifasCosto(tarifasActualizadas);
      setFilteredTarifas(tarifasActualizadas);
      clearForm();
    } catch (error) {
      console.error(error);
      showNotification('Error al guardar la tarifa', 'error');
    }
  };

  const editEntity = (id) => {
    const tarifa = tarifas.find(item => item.id === id);
    if (tarifa) {
      const adicionalesParaForm = tarifa.tarifaAdicionales 
        ? tarifa.tarifaAdicionales.map(ta => ({
            ...(ta.adicional || {}),
            costo: ta.costo
          })).filter(ad => ad && ad.idAdicional)
        : [];

      setForm({
        tipoVehiculo: tarifa.tipoVehiculo?.id?.toString() || '',
        tipoCarga: tarifa.tipoCarga?.id?.toString() || '',
        zonaDeViaje: tarifa.zonaDeViaje?.id?.toString() || '',
        transportista: tarifa.transportista?.id?.toString() || '',
        valorBase: tarifa.valor_base?.toString() || '',
        adicionalesSeleccionados: adicionalesParaForm,
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
        setTarifasCosto(tarifasActualizadas);
        showNotification('Tarifa de costo eliminada correctamente');
      } catch (error) {
        console.error(error);
        showNotification('Error al eliminar tarifa', 'error');
      }
    }
  };

  const verDetalleTarifa = (tarifa) => {
    setSelectedTarifa(tarifa);
    setShowDetalleModal(true);
  };

  const vehiculoOptions = (tiposVehiculo || []).map(v => ({ value: v.id, label: v.descripcion }));
  const transportistaOptions = (transportistas || []).map(t => ({ value: t.id, label: t.nombre }));
  const zonaOptions = (zonasDeViaje || []).map(z => ({ value: z.id, label: `${z.origen} - ${z.destino}` }));
  const cargaOptions = (tiposCarga || []).map(c => ({ value: c.id, label: c.categoria }));
  const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', minWidth: '160px', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
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
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Vehículo *</label>
              <select name="tipoVehiculo" value={form.tipoVehiculo} onChange={handleInputChange} className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}>
                <option value="">Seleccionar tipo de vehículo</option>
                {(tiposVehiculo || []).map(vehiculo => (<option key={vehiculo.id} value={vehiculo.id}>{vehiculo.descripcion} {vehiculo.precioBase}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Carga *</label>
              <select name="tipoCarga" value={form.tipoCarga} onChange={handleInputChange} className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}>
                <option value="">Seleccionar tipo de carga</option>
                {(tiposCarga || []).map(carga => (<option key={carga.id} value={carga.id}>{carga.categoria} {carga.valorBase}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Zona de Viaje *</label>
              <select name="zonaDeViaje" value={form.zonaDeViaje} onChange={handleInputChange} className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}>
                <option value="">Seleccionar zona de viaje</option>
                {(zonasDeViaje || []).map(zona => (<option key={zona.id} value={zona.id}>{zona.origen} - {zona.destino} | {zona.distancia} km</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Transportista *</label>
              <select name="transportista" value={form.transportista} onChange={handleInputChange} className={`w-full p-3 bg-[#242423] border-2 border-gray-600 rounded-lg text-gray-300 focus:border-${tabColor}-500 focus:outline-none transition-all`}>
                <option value="">Seleccionar transportista</option>
                {(transportistas || []).map(transportista => (<option key={transportista.id} value={transportista.id}>{transportista.nombre} {transportista.costoServicio}</option>))}
              </select>
            </div>
            
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-400">
              <label className="block text-sm font-semibold text-blue-300 mb-2">Valor Base *</label>
              <input type="number" value={form.valorBase} onChange={handleValorBaseChange} min="0" step="0.01" className="w-full p-3 bg-transparent border-2 border-blue-400 rounded-lg focus:border-blue-300 focus:outline-none transition-all text-xl font-bold text-blue-300" placeholder="0.00"/>
            </div>

            <div className="bg-green-900/20 p-4 rounded-lg border border-green-400">
              <label className="block text-sm font-semibold text-green-300 mb-2">Servicios Adicionales</label>
              <button
                type="button"
                onClick={() => setShowAdicionalesSelector(true)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-center font-semibold"
              >
                Agregar Adicional
              </button>
              {form.adicionalesSeleccionados.length > 0 && (
                <div className="mt-4 space-y-2">
                  {form.adicionalesSeleccionados.map(adicional => (
                    <div key={adicional.idAdicional} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                      <span className="text-sm text-gray-200 flex-grow pr-2">{adicional.descripcion}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm text-green-300">$</span>
                          <input
                              type="number"
                              value={adicional.costo}
                              onChange={(e) => handleAdicionalCostoChange(adicional.idAdicional, e.target.value)}
                              className="w-24 p-1 rounded bg-[#242423] text-white text-right border border-gray-600 focus:outline-none focus:border-green-400"
                              min="0"
                              step="0.01"
                          />
                          <button
                              type="button"
                              onClick={() => removerAdicionalSeleccionado(adicional.idAdicional)}
                              className="text-red-400 hover:text-red-500"
                          >
                              <X size={16} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-400">
              <label className="block text-sm font-semibold text-yellow-300 mb-2">Costo Total</label>
              <div className="text-2xl font-bold text-yellow-300">${calcularCostoTotal().toFixed(2)}</div>
              <div className="text-xs text-yellow-400 mt-1">
                Base: ${(parseFloat(form.valorBase) || 0).toFixed(2)} + 
                Adicionales: ${form.adicionalesSeleccionados.reduce((sum, item) => sum + parseFloat(item.costo), 0).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-700">
              <button type="button" onClick={clearForm} className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">Limpiar</button>
              {editingId && (<button type="button" onClick={clearForm} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">Cancelar</button>)}
              <button onClick={handleSubmit} className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${editingId ? `bg-${tabColor}-500 hover:bg-${tabColor}-600` : 'bg-green-500 hover:bg-green-600'}`}>{editingId ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla y Filtros */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tarifas de Costo Registradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select options={vehiculoOptions} placeholder="Filtrar por Vehículo" isClearable value={filters.tipoVehiculo} onChange={selectedOption => setFilters({ ...filters, tipoVehiculo: selectedOption })} styles={customSelectStyles} />
            <Select options={transportistaOptions} placeholder="Filtrar por Transportista" isClearable value={filters.transportista} onChange={selectedOption => setFilters({ ...filters, transportista: selectedOption })} styles={customSelectStyles} />
            <Select options={zonaOptions} placeholder="Filtrar por Zona" isClearable value={filters.zonaDeViaje} onChange={selectedOption => setFilters({ ...filters, zonaDeViaje: selectedOption })} styles={customSelectStyles} />
            <Select options={cargaOptions} placeholder="Filtrar por Carga" isClearable value={filters.tipoCarga} onChange={selectedOption => setFilters({ ...filters, tipoCarga: selectedOption })} styles={customSelectStyles} />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Vehículo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Transportista</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Valor Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTarifas.length > 0 ? (
                filteredTarifas.map(item => (
                  <tr key={item.id} className={`border-b border-gray-700 hover:bg-${tabColor}-500/10 transition-colors`}>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-200">{item.tipoVehiculo?.descripcion || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.zonaDeViaje ? `${item.zonaDeViaje.origen} - ${item.zonaDeViaje.destino}` : 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-200">{item.transportista?.nombre || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-400">${Number(item.valor_base).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-yellow-400">${Number(item.costo_total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => verDetalleTarifa(item)} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" title="Ver detalle"><Eye size={14} /></button>
                        <button onClick={() => editEntity(item.id)} className={`p-2 bg-${tabColor}-500 text-white rounded-lg hover:bg-${tabColor}-600 transition-colors`}><Edit size={14} /></button>
                        <button onClick={() => deleteEntity(item.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">No se encontraron tarifas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* modal adicional */}
      {showAdicionalesSelector && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#444240] p-6 rounded-xl shadow-xl border border-gray-700 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
              onClick={() => {
                setShowAdicionalesSelector(false);
                setShowAdicionalesForm(false);
                setAdicionalSearch('');
              }}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-green-300 mb-4">Gestionar Adicionales</h2>

            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowAdicionalesForm(true)}
                className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors text-sm"
              >
                Crear nuevo adicional
              </button>
            </div>

            {showAdicionalesForm && (
              <div className="border border-green-500 rounded-lg p-3 bg-[#242423] mb-4">
                <h4 className="font-semibold text-green-300 mb-2">Nuevo Adicional</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={nuevoAdicional.descripcion}
                    onChange={(e) => setNuevoAdicional({ ...nuevoAdicional, descripcion: e.target.value })}
                    placeholder="Descripción del adicional"
                    className="w-full p-2 border border-gray-600 rounded bg-[#444240] text-gray-300 text-sm focus:outline-none focus:border-green-400"
                  />
                  <input
                    type="number"
                    value={nuevoAdicional.costo}
                    onChange={(e) => setNuevoAdicional({ ...nuevoAdicional, costo: e.target.value })}
                    placeholder="Costo"
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-600 rounded bg-[#444240] text-gray-300 text-sm focus:outline-none focus:border-green-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={agregarAdicional}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdicionalesForm(false)}
                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={adicionalSearch}
                onChange={(e) => setAdicionalSearch(e.target.value)}
                placeholder="Buscar adicionales..."
                className="w-full pl-8 pr-3 py-2 border border-gray-600 rounded bg-[#444240] text-gray-300 text-sm focus:outline-none focus:border-green-400"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {adicionalesFiltrados.map(adicional => {
                const isSelected = form.adicionalesSeleccionados.find(a => a.idAdicional === adicional.idAdicional);
                return (
                  <div
                    key={adicional.idAdicional}
                    onClick={() => seleccionarAdicional(adicional)}
                    className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                      isSelected ? 'bg-green-500/30 border border-green-400' : 'hover:bg-gray-500/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={isSelected ? 'font-medium text-green-200' : 'text-gray-300'}>
                        {adicional.descripcion}
                      </span>
                      <span className={`font-bold ${isSelected ? 'text-green-300' : 'text-gray-400'}`}>
                        ${parseFloat(adicional.costo).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAdicionalesSelector(false);
                  setShowAdicionalesForm(false);
                  setAdicionalSearch('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* MODAL detalle */}
      {showDetalleModal && selectedTarifa && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center">
          <div className="bg-[#444240] p-6 rounded-xl shadow-xl border border-gray-700 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-300 hover:text-white" onClick={() => setShowDetalleModal(false)}><X size={20} /></button>
            <h2 className="text-xl font-bold text-gray-200 mb-4">Detalle de Tarifa</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div><strong>Vehículo:</strong> {selectedTarifa.tipoVehiculo?.descripcion || 'N/A'}</div>
              <div><strong>Zona:</strong> {selectedTarifa.zonaDeViaje ? `${selectedTarifa.zonaDeViaje.origen} - ${selectedTarifa.zonaDeViaje.destino}` : 'N/A'}</div>
              <div><strong>Transportista:</strong> {selectedTarifa.transportista?.nombre || 'N/A'}</div>
              <div><strong>Tipo de Carga:</strong> {selectedTarifa.tipoCarga?.categoria || 'N/A'}</div>
              <div><strong>Valor Base:</strong> ${Number(selectedTarifa.valor_base).toFixed(2)}</div>
              <div>
                  <strong>Adicionales:</strong>
                  {selectedTarifa.tarifaAdicionales?.length > 0 ? (
                      <ul className="list-disc list-inside pl-2">
                          {selectedTarifa.tarifaAdicionales.map(ta => (
                              <li key={ta.adicional.idAdicional}>
                                  {ta.adicional.descripcion}: ${Number(ta.costo).toFixed(2)}
                              </li>
                          ))}
                      </ul>
                  ) : 'Ninguno'}
              </div>
              <div className="pt-2 mt-2 border-t border-gray-600">
                <strong>Costo Total:</strong> ${Number(selectedTarifa.costo_total).toFixed(2)}
              </div>
            </div>
            <button  onClick={() => setShowDetalleModal(false)} className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifaCosto;