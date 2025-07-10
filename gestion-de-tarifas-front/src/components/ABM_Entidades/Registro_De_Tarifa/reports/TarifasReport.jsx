import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Se importan los componentes para el gráfico y nuevos íconos
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, RefreshCw, Loader2, DollarSign, ArrowDownUp, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import Select from 'react-select';
// 2. Se importa la nueva función de servicio (asegúrate de crearla en el siguiente paso)
import { getTarifas, getAnalisisTarifas } from '../../../../services/tarifaCosto.service';

// Estilos para el Select (puedes reutilizarlos o definirlos aquí)
const customSelectStyles = {
  control: (base) => ({ ...base, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', minWidth: '200px', fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, color: 'white' }),
  menu: (base) => ({ ...base, backgroundColor: '#242423', color: 'white' }),
  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'rgba(255,255,255,0.2)' : '#242423', color: 'white' }),
  placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.7)' }),
};

const TarifasReport = () => {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS PARA EL ANÁLISIS ---
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [analisisData, setAnalisisData] = useState([]);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchTarifas = async () => {
    try {
      setLoading(true);
      const data = await getTarifas();
      setTarifas(data || []);
    } catch (error) {
      console.error('Error al cargar el reporte de tarifas:', error);
      showNotification('Error al cargar el reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarifas();
  }, []);
  
  // --- Lógica para el análisis comparativo ---
  const handleGenerarAnalisis = async () => {
    if (!fechaInicio || !fechaFin) {
        showNotification('Por favor, selecciona ambas fechas.');
        return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
        showNotification('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return;
    }
    setLoadingAnalisis(true);
    try {
        const data = await getAnalisisTarifas(fechaInicio, fechaFin);
        setAnalisisData(data);
        if (data.length === 0) {
            showNotification('No se encontraron variaciones de tarifas en el período seleccionado.', 'info');
        }
    } catch (error) {
        console.error("Error al generar análisis", error);
        showNotification('No se pudo generar el análisis.');
    } finally {
        setLoadingAnalisis(false);
    }
  };

  // ... (tus useMemos para stats, filtros y datos de la tabla principal se mantienen igual)

  return (
    <>
      <div className="min-h-screen bg-[#242423] p-8">
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/tarifas')}>
                    <ArrowLeft size={24} className="text-gray-300 hover:text-gray-200" />
                    <h1 className="text-3xl font-bold text-gray-200">Reporte de Tarifas</h1>
                </div>
                <button onClick={fetchTarifas} disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-800">
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    <span>Actualizar Datos</span>
                </button>
            </div>

            {/* --- NUEVA SECCIÓN: ANÁLISIS COMPARATIVO --- */}
            <div className="bg-[#444240] p-6 rounded-xl border border-gray-700 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="text-purple-400" size={24} />
                    <h2 className="text-xl font-bold text-gray-200">Análisis Comparativo de Aumentos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="text-sm font-medium text-gray-400 block mb-1">Fecha de Inicio</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full mt-1 p-2 bg-white/10 border border-white/30 rounded-lg text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400 block mb-1">Fecha de Fin</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full mt-1 p-2 bg-white/10 border border-white/30 rounded-lg text-white" />
                    </div>
                    <button onClick={handleGenerarAnalisis} disabled={loadingAnalisis} className="h-[42px] px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-800 flex items-center justify-center">
                        {loadingAnalisis ? <Loader2 className="animate-spin" /> : 'Generar Análisis'}
                    </button>
                </div>
            </div>

            {/* --- Tabla de Resultados del Análisis --- */}
            {loadingAnalisis ? (
                 <div className="text-center p-8"><Loader2 className="animate-spin text-purple-400 mx-auto" size={32}/></div>
            ) : analisisData.length > 0 && (
                <div className="bg-[#444240] rounded-xl border border-gray-700 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-gray-200">Resultados del Análisis</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarifa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Inicial</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Final</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Aumento ($)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Aumento (%)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#444240] divide-y divide-gray-700">
                                {analisisData.map(item => (
                                    <tr key={item.id_tarifa}>
                                        <td className="px-6 py-4 text-sm text-gray-300">{item.descripcion}</td>
                                        <td className="px-6 py-4 text-sm text-gray-400">${item.costo_inicial.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-200 font-semibold">${item.costo_final.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-green-400 font-bold">+${item.variacion_absoluta.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-green-400 font-bold">{item.variacion_porcentual.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- Gráfico de Tendencias --- */}
            {analisisData.length > 0 && !loadingAnalisis && (
                <div className="bg-[#444240] p-6 rounded-xl border border-gray-700">
                     <h2 className="text-xl font-bold text-gray-200 mb-4">Tendencia de Aumentos (%)</h2>
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={analisisData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                            <XAxis dataKey="descripcion" stroke="#888" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} interval={0} />
                            <YAxis stroke="#888" tickFormatter={(value) => `${value}%`} />
                            <Tooltip cursor={{fill: 'rgba(136, 132, 216, 0.1)'}} contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="variacion_porcentual" name="Aumento %">
                                {analisisData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.variacion_porcentual >= 0 ? '#82ca9d' : '#f87171'} />
                                ))}
                            </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                </div>
            )}
            
            {/* ... (Tu tabla y estadísticas originales pueden ir aquí si lo deseas) ... */}
        </div>
      </div>
      {/* ... (tu JSX de notificación) ... */}
    </>
  );
};

export default TarifasReport;

