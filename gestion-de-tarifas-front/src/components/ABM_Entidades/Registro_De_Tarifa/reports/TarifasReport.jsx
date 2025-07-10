import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Se importa LineChart y se quitan los componentes de BarChart que no se usarán
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Loader2, DollarSign, ArrowDownUp, TrendingUp, TrendingDown, BarChart3, X as CloseIcon } from 'lucide-react';
import Select from 'react-select';
import { getTarifas, getAnalisisTarifas, getHistorialDeTarifa } from '../../../../services/tarifaCosto.service';

// --- Componente de Modal para el Gráfico Individual ---
const TarifaEvolucionModal = ({ tarifa, onClose }) => {
    const [historialData, setHistorialData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorialCompleto = async () => {
            if (!tarifa) return;
            setLoading(true);
            try {
                const historial = await getHistorialDeTarifa(tarifa.id_tarifa);
                
                // Añadir la versión actual a los datos del historial para una línea de tiempo completa
                const versionActual = {
                    version: (historial[0]?.version || 0) + 1,
                    costo_total: tarifa.costo_final,
                    fecha_modificacion: new Date().toISOString(), // Usar una fecha actual o la de la tarifa si está disponible
                };

                // Combinar, ordenar cronológicamente y formatear para el gráfico
                const datosCompletos = [...historial, versionActual]
                    .sort((a, b) => a.version - b.version)
                    .map(v => ({
                        name: `Ver. ${v.version}`,
                        Costo: Number(v.costo_total).toFixed(2),
                        fecha: new Date(v.fecha_modificacion).toLocaleDateString('es-AR'),
                    }));
                
                setHistorialData(datosCompletos);
            } catch (error) {
                console.error("Error al cargar el historial para el gráfico", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistorialCompleto();
    }, [tarifa]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-[#2d2d2b] rounded-2xl w-full max-w-3xl border border-purple-500 shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div>
                        <h3 className="text-lg font-bold text-gray-200">Evolución de la Tarifa</h3>
                        <p className="text-sm text-gray-400">{tarifa.descripcion}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                        <CloseIcon size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-purple-400" size={32} /></div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={historialData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" tickFormatter={(value) => `$${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                                <Legend />
                                <Line type="monotone" dataKey="Costo" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};


const TarifasReport = () => {
  const [tarifas, setTarifas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [analisisData, setAnalisisData] = useState([]);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // --- NUEVO ESTADO PARA EL MODAL DEL GRÁFICO ---
  const [selectedTarifaForChart, setSelectedTarifaForChart] = useState(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchTarifas = async () => {
    // ... (tu lógica de fetchTarifas)
  };

  useEffect(() => {
    fetchTarifas();
  }, []);
  
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

  return (
    <>
      <div className="min-h-screen bg-[#242423] p-8">
        <div className="max-w-7xl mx-auto">
            {/* ... (Tu cabecera y sección de estadísticas existentes se mantienen igual) ... */}

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

            {loadingAnalisis ? (
                 <div className="text-center p-8"><Loader2 className="animate-spin text-purple-400 mx-auto" size={32}/></div>
            ) : analisisData.length > 0 && (
                <div className="bg-[#444240] rounded-xl border border-gray-700 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-gray-200">Resultados del Análisis</h2>
                        <p className="text-sm text-gray-400">Haz clic en una fila para ver la evolución gráfica del costo.</p>
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
                                    // --- CAMBIO: La fila ahora es clickeable ---
                                    <tr key={item.id_tarifa} onClick={() => setSelectedTarifaForChart(item)} className="cursor-pointer hover:bg-gray-700/50 transition-colors">
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
            
            {/* --- SE ELIMINA EL GRÁFICO GENERAL DE AQUÍ --- */}
        </div>
      </div>
      
      {/* --- SE RENDERIZA EL MODAL DEL GRÁFICO INDIVIDUAL --- */}
      {selectedTarifaForChart && (
        <TarifaEvolucionModal 
            tarifa={selectedTarifaForChart}
            onClose={() => setSelectedTarifaForChart(null)}
        />
      )}

      {notification.show && (
        <div className={`fixed top-5 right-5 px-6 py-4 rounded-lg text-white font-semibold shadow-lg z-50 transition-all ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
          {notification.message}
        </div>
      )}
    </>
  );
};

export default TarifasReport;