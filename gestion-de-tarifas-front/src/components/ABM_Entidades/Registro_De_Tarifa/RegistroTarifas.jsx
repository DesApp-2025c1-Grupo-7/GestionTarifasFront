import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, Edit, Trash2, Plus, X, ChevronDown, ChevronUp, Eye, BarChart3, MoreVertical, History as HistoryIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Select from 'react-select';
import Swal from 'sweetalert2';

import { getVehiculos } from '../../../services/tipoVehiculo.service';
import { getCargas } from '../../../services/tipoCarga.service';
import { getZonas } from '../../../services/zona.service';
import { getTransportista } from '../../../services/transportista.service';
import { getTarifas, deleteTarifa, updateTarifaCosto, createTarifa } from '../../../services/tarifaCosto.service';
import { getAdicionales, createAdicional as createAdicionalService } from '../../../services/adicional.service';

import { useOutletContext } from 'react-router-dom';


const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};



const TarifaCosto = () => {
  const { showNotification, tabColor = 'emerald' } = useOutletContext();
  const navigate = useNavigate();

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

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const [filters, setFilters] = useState({
    tipoVehiculo: [], //Le saque null asi busca por varios transportistas, no por uno solo.
    tipoCarga: [],
    zonaDeViaje: [],
    transportista: [],
  });

  const formRef = useRef(null); 
  const tableHeaderRef = useRef(null); 
  const [tableBodyHeight, setTableBodyHeight] = useState('auto'); 

  const [form, setForm] = useState({
    tipoVehiculo: '',
    tipoCarga: '',
    zonaDeViaje: '',
    transportista: '',
    valorBase: '',
    adicionalesSeleccionados: [],
  });

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [selectedTarifa, setSelectedTarifa] = useState(null);
  const [orden, setOrden] = useState('costo_desc');

  // Estilos para el scrollbar personalizado
  const scrollbarStyles = {
    overflowY: 'auto',
    height: tableBodyHeight,
    maxHeight: tableBodyHeight !== 'auto' ? tableBodyHeight : '500px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#4a5568 #2d3748',
  };

  // Crear estilos globales para webkit
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #2d3748;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4a5568;
        border-radius: 4px;
        border: 1px solid #2d3748;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #718096;
      }
      @media (max-width: 768px) {
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

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
    let dataToFilter = [...(tarifas || [])].filter(item => item.deletedAt === null);

    if (filters.tipoVehiculo.length > 0) {
      const selectedIds = filters.tipoVehiculo.map(v => v.value);
      dataToFilter = dataToFilter.filter(item => selectedIds.includes(item.tipoVehiculo?.id));
    }
    if (filters.transportista.length > 0) {
      const selectedIds = filters.transportista.map(t => t.value);
      dataToFilter = dataToFilter.filter(item => selectedIds.includes(item.transportista?.id));
    }
    if (filters.zonaDeViaje.length > 0) {
      const selectedIds = filters.zonaDeViaje.map(z => z.value);
      dataToFilter = dataToFilter.filter(item => selectedIds.includes(item.zonaDeViaje?.id));
    }
    if (filters.tipoCarga.length > 0) {
      const selectedIds = filters.tipoCarga.map(c => c.value);
      dataToFilter = dataToFilter.filter(item => selectedIds.includes(item.tipoCarga?.id));
    }

    dataToFilter.sort((a, b) => {
      const [criterio, direccion] = orden.split('_');
      const dir = direccion === 'asc' ? 1 : -1;

      switch (criterio) {
        case 'costo':
          const costoA = parseFloat(a.valor_base) || 0;
          const costoB = parseFloat(b.valor_base) || 0;
          return (costoA - costoB) * dir;
        case 'creacion':
          const fechaA = new Date(a.createdAt).getTime();
          const fechaB = new Date(b.createdAt).getTime();
          return (fechaA - fechaB) * dir;
        case 'modificacion':
          const fechaModA = new Date(a.updatedAt).getTime();
          const fechaModB = new Date(b.updatedAt).getTime();
          return (fechaModA - fechaModB) * dir;
        default:
          return 0;
      }
  });

    setFilteredTarifas(dataToFilter);
  }, [filters, tarifas, orden]);


  useLayoutEffect(() => {
    const updateHeight = () => {
      if (formRef.current && tableHeaderRef.current) {
        const formHeight = formRef.current.offsetHeight;
        const headerHeight = tableHeaderRef.current.offsetHeight;
        const calculatedHeight = formHeight - headerHeight;

        // Nos aseguramos de que sea un valor positivo antes de aplicarlo
        if (calculatedHeight > 0) {
          setTableBodyHeight(`${calculatedHeight}px`);
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, [tarifas]);

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
      vigenciaDesde: form.vigenciaDesde || null,
      vigenciaHasta: form.vigenciaHasta || null,
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
      const errorMessage = error.response?.data?.message || 'Error al guardar la tarifa';
      showNotification(errorMessage, 'error');
    }
  };

  const editEntity = (id) => {
    const tarifa = tarifas.find(item => item.id === id);
    if (tarifa) {
      const adicionalesParaForm = tarifa.tarifaAdicionales
        ? tarifa.tarifaAdicionales.map(ta => ({
          ...(ta.adicional || {}),
          costo: ta.costoPersonalizado
        })).filter(ad => ad && ad.idAdicional)
        : [];

      // Formatear las fechas que vienen del backend para el input
      const vigenciaDesdeFormato = tarifa.vigenciaDesde ? new Date(tarifa.vigenciaDesde).toISOString().split('T')[0] : '';
      const vigenciaHastaFormato = tarifa.vigenciaHasta ? new Date(tarifa.vigenciaHasta).toISOString().split('T')[0] : '';

      setForm({
        tipoVehiculo: tarifa.tipoVehiculo?.id?.toString() || '',
        tipoCarga: tarifa.tipoCarga?.id?.toString() || '',
        zonaDeViaje: tarifa.zonaDeViaje?.id?.toString() || '',
        transportista: tarifa.transportista?.id?.toString() || '',
        valorBase: tarifa.valor_base?.toString() || '',
        adicionalesSeleccionados: adicionalesParaForm,
        vigenciaDesde: vigenciaDesdeFormato,
        vigenciaHasta: vigenciaHastaFormato,
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
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white', zIndex: 9999 }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
  };

  const customInputStyles = {
    control: (styles) => ({
    ...styles,
    backgroundColor: '#444240',
    borderColor: '#4B5563',
    color: '#D1D5DB',
    paddingTop: '2px',
    paddingBottom: '2px',
  }),
  singleValue: (styles) => ({ ...styles, color: '#D1D5DB' }),
  menu: (styles) => ({ ...styles, backgroundColor: '#242423' }),
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? 'rgba(255,255,255,0.2)' : '#242423',
    color: '#D1D5DB',
  }),
  input: (styles) => ({ ...styles, color: '#D1D5DB' }),
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 bg-[#242423]">

      {/* Formulario */}
      <div className="lg:col-span-1">
        <div ref={formRef} className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-emerald-500`}>
            {editingId ? 'Editar Tarifa de Costo' : 'Nueva Tarifa de Costo'}
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Vehículo *</label>
              <Select
                name="tipoVehiculo"
                value={tiposVehiculo.find(v => v.id == form.tipoVehiculo) ? {
                  value: form.tipoVehiculo,
                  label: tiposVehiculo.find(v => v.id == form.tipoVehiculo)?.descripcion 
                } : null}
                onChange={(selected) =>
                  handleInputChange({ target: { name: 'tipoVehiculo', value: selected?.value || '' } })
                }
                options={tiposVehiculo.map(v => ({
                  value: v.id,
                  label: `${v.descripcion}`
                }))}
                styles={customInputStyles}
                placeholder="Seleccionar tipo de vehículo"
                isClearable
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Carga *</label>
              <Select
                name="tipoCarga"
                value={tiposCarga.find(c => c.id == form.tipoCarga) ? {
                  value: form.tipoCarga,
                  label: tiposCarga.find(c => c.id == form.tipoCarga)?.categoria 
                } : null}
                onChange={(selected) =>
                  handleInputChange({ target: { name: 'tipoCarga', value: selected?.value || '' } })
                }
                options={tiposCarga.map(c => ({
                  value: c.id,
                  label: `${c.categoria}`
                }))}
                styles={customInputStyles}
                placeholder="Seleccionar tipo de carga"
                isClearable
              />
              
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Zona de Viaje *</label>
              <Select
                name="zonaDeViaje"
                value={zonasDeViaje.find(z => z.id == form.zonaDeViaje) ? {
                  value: form.zonaDeViaje,
                  label: zonasDeViaje.find(z => z.id == form.zonaDeViaje)?.origen + ' - ' + zonasDeViaje.find(z => z.id === form.zonaDeViaje)?.destino 
                } : null}
                onChange={(selected) =>
                  handleInputChange({ target: { name: 'zonaDeViaje', value: selected?.value || '' } })
                }
                options={(zonasDeViaje || []).map(z => ({
                  value: z.id,
                  label: `${z.origen} - ${z.destino} `
                }))}
                styles={customInputStyles}
                placeholder="Seleccionar zona de viaje"
                isClearable
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Transportista *</label>
              <Select
                name="transportista"
                value={transportistas.find(t => t.id == form.transportista) ? {
                  value: form.transportista,
                  label: transportistas.find(t => t.id == form.transportista)?.nombre 
                } : null}
                onChange={(selected) =>
                  handleInputChange({ target: { name: 'transportista', value: selected?.value || '' } })
                }
                options={(transportistas || []).map(t => ({
                  value: t.id,
                  label: `${t.nombre}`
                }))}
                styles={customInputStyles}
                placeholder="Seleccionar transportista"
                isClearable
              />
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

            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-700 w-full">
              <button type="button" onClick={clearForm} className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold">Limpiar</button>
              {editingId && (<button type="button" onClick={clearForm} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">Cancelar</button>)}
              <button onClick={handleSubmit} className={`px-6 py-3 text-white rounded-lg transition-colors font-semibold ${editingId ? `bg-${tabColor}-500 hover:bg-${tabColor}-600` : 'bg-green-500 hover:bg-green-600'}`}>{editingId ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla y Filtros */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div ref={tableHeaderRef} className={`bg-gradient-to-r from-emerald-700 to-emerald-800 text-white p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Tarifas de Costo Registradas</h2>
            <button
              onClick={() => navigate('/reports/tarifas')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              title="Ver reporte de tarifas"
            >
              <BarChart3 size={18} />
              <span>Reportes</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Filtros de búsqueda, los cambie para permitir selecionar varios */}
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={vehiculoOptions}
              placeholder="Filtrar por Vehículo(s)"
              value={filters.tipoVehiculo}
              onChange={selectedOptions => setFilters(prev => ({ ...prev, tipoVehiculo: selectedOptions || [] }))}
              styles={customSelectStyles}
            />
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={transportistaOptions}
              placeholder="Filtrar por Transportista(s)"
              value={filters.transportista}
              onChange={selectedOptions => setFilters(prev => ({ ...prev, transportista: selectedOptions || [] }))}
              styles={customSelectStyles}
            />
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={zonaOptions}
              placeholder="Filtrar por Zona(s)"
              value={filters.zonaDeViaje}
              onChange={selectedOptions => setFilters(prev => ({ ...prev, zonaDeViaje: selectedOptions || [] }))}
              styles={customSelectStyles}
            />
            <Select
              isMulti
              closeMenuOnSelect={false}
              options={cargaOptions}
              placeholder="Filtrar por Carga(s)"
              value={filters.tipoCarga}
              onChange={selectedOptions => setFilters(prev => ({ ...prev, tipoCarga: selectedOptions || [] }))}
              styles={customSelectStyles}
            />
            <Select
                    options={[
                      { value: 'costo_desc', label: 'Costo Base ↓' },
                      { value: 'costo_asc', label: 'Costo Base ↑' },
                      { value: 'creacion_desc', label: 'Fecha Creación ↓' },
                      { value: 'creacion_asc', label: 'Fecha Creación ↑' },
                      { value: 'modificacion_desc', label: 'Ultima Modificación ↓' },
                      { value: 'modificacion_asc', label: 'Ultima Modificación ↑' },
                    ]}
                    placeholder="Ordenar por"
                    isClearable
                    value={
                      [
                        { value: 'costo_desc', label: 'Costo Base ↓' },
                        { value: 'costo_asc', label: 'Costo Base ↑' },
                        { value: 'creacion_desc', label: 'Fecha Creación ↓' },
                        { value: 'creacion_asc', label: 'Fecha Creación ↑' },
                        { value: 'modificacion_desc', label: 'Fecha Modificación ↓' },
                        { value: 'modificacion_asc', label: 'Fecha Modificación ↑' },
                      ].find(opt => opt.value === orden)
                    }
                    onChange={selected => setOrden(selected ? selected.value : 'costo_desc')}
                    styles={customSelectStyles}
                  />
          </div>
        </div>

        {/* Contenedor de la tabla con scroll */}
        <div
          className="custom-scrollbar overflow-y-auto"
          style={{
            height: tableBodyHeight,
            maxHeight: tableBodyHeight !== 'auto' ? tableBodyHeight : '500px'
          }}

        >
          <table className="w-full">
            <thead className="bg-[#242423] sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-gray-600">Vehículo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-gray-600">Zona</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-gray-600">Transportista</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-gray-600">Valor Base</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 border-b border-gray-600">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300 border-b border-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTarifas.length > 0 ? (
                filteredTarifas.map((item, index) => (
                  <tr key={item.id} className={`border-b border-gray-700 hover:bg-gray-600 transition-colors ${index % 2 === 0 ? 'bg-gray-800/20' : 'bg-gray-900/20'}`}>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.tipoVehiculo ? (
                        !item.tipoVehiculo.deletedAt
                          ? item.tipoVehiculo.descripcion
                          : <span className="italic text-red-400">{item.tipoVehiculo.descripcion} (Eliminado)</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.zonaDeViaje ? (
                        !item.zonaDeViaje.deletedAt
                          ? `${item.zonaDeViaje.origen} - ${item.zonaDeViaje.destino}`
                          : <span className="italic text-red-400">{item.zonaDeViaje.origen} - {item.zonaDeViaje.destino} (Zona eliminada)</span>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-200">
                      {item.transportista ? (
                        !item.transportista.deletedAt
                          ? item.transportista.nombre
                          : <span className="italic text-red-400">{item.transportista.nombre} (Eliminado)</span>
                      ) : ('N/A')}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-400">${Number(item.valor_base).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-yellow-400">${Number(item.costo_total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block text-left" ref={openMenuId === item.id ? menuRef : null}>
                        <button
                          type="button"
                          className="p-2 rounded-full text-gray-300 hover:bg-gray-600 focus:outline-none"
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        >
                          <MoreVertical size={20} />
                        </button>
                        {openMenuId === item.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#3a3a3a] ring-1 ring-black ring-opacity-5 z-20">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              <button
                                onClick={() => { verDetalleTarifa(item); setOpenMenuId(null); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                              >
                                <Eye size={16} className="text-blue-400" />
                                Ver Detalle
                              </button>
                              <button
                                onClick={() => { navigate(`/tarifas/historial/${item.id}`); setOpenMenuId(null); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                              >
                                <HistoryIcon size={16} className="text-purple-400" />
                                Ver Historial
                              </button>
                              <button
                                onClick={() => { editEntity(item.id); setOpenMenuId(null); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
                              >
                                <Edit size={16} className="text-emerald-400" />
                                Editar
                              </button>
                              <div className="border-t border-gray-600 my-1"></div>
                              <button
                                onClick={() => { deleteEntity(item.id); setOpenMenuId(null); }}
                                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
                              >
                                <Trash2 size={16} />
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-semibold mb-2 text-gray-300">No hay tarifas de costos registradas</h3>
                      <p>Comienza agregando una nueva tarifa de costo usando el formulario</p>
                    </div>
                  </td>
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
                    className={`p-2 rounded cursor-pointer text-sm transition-colors ${isSelected ? 'bg-green-500/30 border border-green-400' : 'hover:bg-gray-500/20'
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

      {showDetalleModal && selectedTarifa && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center">
          <div className="bg-[#444240] p-6 rounded-xl shadow-xl border border-gray-700 max-w-md w-full relative">
            <button className="absolute top-2 right-2 text-gray-300 hover:text-white" onClick={() => setShowDetalleModal(false)}>
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-200 mb-4">Detalle de Tarifa</h2>
            <div className="space-y-2 text-sm text-gray-300">
              <div>
                <strong>Vehículo:</strong>{' '}
                {selectedTarifa.tipoVehiculo ? (
                  !selectedTarifa.tipoVehiculo.deletedAt
                    ? selectedTarifa.tipoVehiculo.descripcion
                    : <span className="italic text-red-400">{selectedTarifa.tipoVehiculo.descripcion} (Eliminado)</span>
                ) : (
                  'N/A'
                )}
              </div>
              <div>
                <strong>Zona:</strong>{' '}
                {selectedTarifa.zonaDeViaje ? (
                  !selectedTarifa.zonaDeViaje.deletedAt
                    ? `${selectedTarifa.zonaDeViaje.origen} - ${selectedTarifa.zonaDeViaje.destino}`
                    : <span className="italic text-red-400">{`${selectedTarifa.zonaDeViaje.origen} - ${selectedTarifa.zonaDeViaje.destino}`} (Eliminada)</span>
                ) : (
                  'N/A'
                )}
              </div>
              <div>
                <strong>Transportista:</strong>{' '}
                {selectedTarifa.transportista ? (
                  !selectedTarifa.transportista.deletedAt
                    ? selectedTarifa.transportista.nombre
                    : <span className="italic text-red-400">{selectedTarifa.transportista.nombre} (Eliminado)</span>
                ) : (
                  <span className="text-red-400 italic">Transportista inactivo</span>
                )}
              </div>
              <div>
                <strong>Tipo de Carga: </strong>
                {selectedTarifa.tipoCarga?.categoria ? (
                  !selectedTarifa.tipoCarga.deletedAt
                    ? selectedTarifa.tipoCarga?.categoria
                    : <span className='text-red-400 italic'>{selectedTarifa.tipoCarga.categoria} (Eliminada)</span>
                ) : (
                  <span className='text-red-400 italic'>Tipo de carga eliminada</span>
                )}
              </div>
              <div><strong>Valor Base:</strong> ${Number(selectedTarifa.valor_base).toFixed(2)}</div>

              <div className="border-t border-gray-600 pt-2 mt-2">
                <strong>Fecha de Creación:</strong>
                <span className='pl-2'>{selectedTarifa.createdAt ? new Date(selectedTarifa.createdAt).toLocaleDateString('es-AR') : 'No definida'}</span>
              </div>
              {/* adicionales */}
              <div>
                <strong>Adicionales:</strong>
                {selectedTarifa.tarifaAdicionales?.length > 0 ? (
                  <ul className="list-disc list-inside pl-2">
                    {selectedTarifa.tarifaAdicionales
                      .filter(ta => ta.adicional)
                      .map(ta => (
                        <li key={ta.id}>
                          {ta.adicional.descripcion}: ${Number(ta.costoPersonalizado).toFixed(2)}
                        </li>
                      ))}
                  </ul>
                ) : 'Ninguno'}
              </div>
              <div className="pt-2 mt-2 border-t border-gray-600">
                <strong>Costo Total:</strong> ${Number(selectedTarifa.costo_total).toFixed(2)}
              </div>
            </div>
            <button onClick={() => setShowDetalleModal(false)} className="mt-6 w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifaCosto;