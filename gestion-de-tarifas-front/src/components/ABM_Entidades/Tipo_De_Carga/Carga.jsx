import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import { createCarga, deleteCarga, getCargas, updateCarga } from '../../../services/tipoCarga.service';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { useOutletContext } from 'react-router-dom';

// Estilos para los componentes Select de los filtros
const customSelectStyles = {
    control: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', width: '100%', minWidth: '180px', fontSize: '0.875rem' }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
};

// Estilos para remover las flechas de los inputs number
const numberInputStyles = {
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
};

const TiposCarga = () => { 
  const { showNotification, tabColor } = useOutletContext(); 

  const [data, setData] = useState([]); // Lista original de cargas del backend
  const [filteredData, setFilteredData] = useState([]); // Lista que se muestra en la tabla
  const [editingId, setEditingId] = useState(null);
  
  // Estado para el formulario de creación/edición
  const [form, setForm] = useState({ categoria: '', pesoTotal: '', volumenTotal: '', esEspecial: false, requisitoEspecial: '' });
  
  // Estado separado para los filtros de la tabla
  const [filters, setFilters] = useState({ categoria: '', esEspecial: null });

  // Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const cargas = await getCargas();
        setData(cargas);
        setFilteredData(cargas); 
      } catch (error) {
        showNotification('Error al cargar los tipos de carga', 'error');
      }
    };
    fetchData();
  }, []);

 
  useEffect(() => {
    let dataToFilter = [...data];

    if (filters.categoria) {
      dataToFilter = dataToFilter.filter(item => item.categoria.toLowerCase().includes(filters.categoria.toLowerCase()));
    }
    if (filters.esEspecial !== null) {
      dataToFilter = dataToFilter.filter(item => item.esEspecial === filters.esEspecial);
    }
    
    setFilteredData(dataToFilter);
  }, [data, filters]);

  
  const clearForm = () => {
    setForm({ categoria: '', pesoTotal: '', volumenTotal: '', esEspecial: false, requisitoEspecial: '' });
    setEditingId(null);
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    
    if (name === 'esEspecial') {
      const isChecked = checked;
      setForm(prev => ({
        ...prev,
        esEspecial: isChecked,
       
        requisitoEspecial: !isChecked ? '' : prev.requisitoEspecial
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const validateForm = () => {
    const { categoria, pesoTotal, volumenTotal, esEspecial, requisitoEspecial } = form;
    if (!categoria.trim() || !pesoTotal || !volumenTotal) return false;
    if (esEspecial && !requisitoEspecial.trim()) return false;
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification('Por favor, completa todos los campos requeridos.', 'error');
      return;
    }
    const entityData = {
      categoria: form.categoria.trim(),
      requisitoEspecial: form.esEspecial ? form.requisitoEspecial.trim() : '',
      pesoTotal: parseFloat(form.pesoTotal),
      volumenTotal: parseFloat(form.volumenTotal),
      esEspecial: form.esEspecial,
    };
    try {
      let newData;
      if (editingId) {
        const updated = await updateCarga(editingId, entityData);
        newData = data.map(item => (item.id === editingId ? { ...item, ...updated } : item));
        showNotification('Tipo de carga actualizado correctamente');
      } else {
        const created = await createCarga(entityData);
        newData = [...data, created];
        showNotification('Tipo de carga agregado correctamente');
      }
      setData(newData);
      clearForm();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error al guardar el tipo de carga';
      showNotification(msg, 'error');
    }
  };

  const editEntity = (id) => {
    const carga = data.find(item => item.id === id);
    if (carga) {
      setForm({
        categoria: carga.categoria || '',
        pesoTotal: carga.pesoTotal.toString(),
        volumenTotal: carga.volumenTotal.toString(),
        esEspecial: carga.esEspecial,
        requisitoEspecial: carga.requisitoEspecial || '',
      });
      setEditingId(id);
    }
  };

  const deleteEntity = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará el tipo de carga definitivamente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCarga(id);
        setData(data.filter(item => item.id !== id));
        showNotification('Tipo de carga eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar tipo de carga:', error);
        const mensaje = error?.response?.data?.message || 'Error al eliminar el tipo de carga';
        showNotification(mensaje, 'error');
      }
    }
  };

  // --- FUNCIONES AUXILIARES Y OPCIONES PARA SELECTS ---
  const formatWeight = (weight) => `${weight} kg`;
  const formatVolume = (volume) => `${volume} m³`;
  
  const opcionesCategoria = useMemo(() => [
    { value: '', label: 'Todas las Categorías' },
    ...[...new Set(data.map(c => c.categoria))].map(cat => ({ value: cat, label: cat }))
  ], [data]);

  const opcionesEspecial = [
    { value: null, label: 'Ambos (Especial/Regular)' },
    { value: true, label: 'Sí' },
    { value: false, label: 'No' },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Estilos CSS para remover las flechas y mejorar el scroll */}
      <style jsx>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type=number] {
          -moz-appearance: textfield;
        }

        /* Estilos personalizados para la barra de scroll */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d2d2d;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 4px;
          border: 1px solid #2d2d2d;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: #9ca3af;
        }

        /* Para Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4a5568 #2d2d2d;
        }
      `}</style>

      {/* Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-[#444240] p-8 rounded-2xl shadow-lg border border-gray-900">
          <h2 className={`text-2xl font-bold text-gray-300 mb-6 pb-3 border-b-4 border-blue-500`}>
            {editingId ? 'Editar Tipo de Carga' : 'Nuevo Tipo de Carga'}
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Categoría *</label>
                <input 
                  type="text" 
                  name="categoria" 
                  value={form.categoria} 
                  onChange={handleInputChange} 
                  placeholder="Ej: Electrodomésticos, Productos químicos..." 
                  className="w-full p-3 border-2 border-gray-600 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Peso Total Estimado (kg) *</label>
                <input 
                  type="number" 
                  name="pesoTotal" 
                  value={form.pesoTotal} 
                  onChange={handleInputChange} 
                  placeholder="Peso estimado en kilogramos" 
                  min="0" 
                  step="0.1" 
                  style={numberInputStyles}
                  className="w-full p-3 border-2 border-gray-600 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Volumen Total Estimado (m³) *</label>
                <input 
                  type="number" 
                  name="volumenTotal" 
                  value={form.volumenTotal} 
                  onChange={handleInputChange} 
                  placeholder="Volumen estimado en metros cúbicos" 
                  min="0" 
                  step="0.1" 
                  style={numberInputStyles}
                  className="w-full p-3 border-2 border-gray-600 text-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-all" 
                />
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg">
                <input 
                  type="checkbox" 
                  id="esEspecial" 
                  name="esEspecial" 
                  checked={form.esEspecial} 
                  onChange={handleInputChange} 
                  className={`w-5 h-5 text-${tabColor}-600 border-gray-300 rounded focus:ring-${tabColor}-500`} 
                />
                <div>
                  <label htmlFor="esEspecial" className="text-sm font-semibold text-gray-300 cursor-pointer">¿Es carga especial?</label>
                  <p className="text-xs text-gray-300">Marca si requiere manejo o transporte especial</p>
                </div>
              </div>
              {form.esEspecial && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Requisito Especial *</label>
                  <textarea 
                    name="requisitoEspecial" 
                    value={form.requisitoEspecial} 
                    onChange={handleInputChange} 
                    placeholder="Describe los requisitos especiales..." 
                    rows="3" 
                    className="w-full p-3 border-2 text-gray-300 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all resize-none" 
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 w-full">  
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

      {/* Table Section */}
      <div className="lg:col-span-2 bg-[#444240] rounded-2xl shadow-lg border border-gray-900 overflow-hidden">
        <div className={`bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6`}>
          <h2 className="text-2xl font-bold mb-4">Tipos de Carga Registrados</h2>
          <div className='flex gap-4 items-center'>
            <Select
              options={opcionesCategoria}
              isClearable
              placeholder="Filtrar por categoría..."
              onChange={(opt) => setFilters(f => ({ ...f, categoria: opt ? opt.value : '' }))}
              styles={customSelectStyles}
            />
            <Select
              options={opcionesEspecial}
              defaultValue={opcionesEspecial[0]}
              placeholder="¿Es especial?"
              onChange={(opt) => setFilters(f => ({ ...f, esEspecial: opt ? opt.value : null }))}
              styles={customSelectStyles}
            />
          </div>
        </div>

        {/* Contenedor de la tabla con scroll mejorado */}
        <div className="relative">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-[#242423] sticky top-0 z-10">
                <tr className="text-gray-300">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Especificaciones</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm text-neutral-200">{item.categoria}</div>
                        {item.esEspecial && item.requisitoEspecial && (
                          <div className="text-xs text-orange-400 mt-1 max-w-xs">{item.requisitoEspecial}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1 text-neutral-300">
                          <div><strong>Peso:</strong> {formatWeight(item.pesoTotal)}</div>
                          <div><strong>Volumen:</strong> {formatVolume(item.volumenTotal)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.esEspecial ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                          {item.esEspecial ? 'Especial' : 'Regular'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => editEntity(item.id)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Edit size={14} /></button>
                          <button onClick={() => deleteEntity(item.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-300">No se encontraron tipos de carga</h3>
                        <p>Intenta ajustar los filtros o agrega un nuevo tipo de carga.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Indicador de scroll si hay muchos elementos */}
            {filteredData.length > 8 && (
              <div className="absolute bottom-2 right-2 bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span>↕</span>
                <span>{filteredData.length} registros</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposCarga;