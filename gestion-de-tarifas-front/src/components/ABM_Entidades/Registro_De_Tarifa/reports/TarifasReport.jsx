import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Loader2, BarChart3, History as HistoryIcon, X as CloseIcon } from 'lucide-react';
import Select from 'react-select';
import { getTarifas, getAnalisisTarifas, getHistorialDeTarifa, getTarifaById } from '../../../../services/tarifaCosto.service';

// Funciones compararVersiones y demás componentes auxiliares aquí (igual que antes)...

const compararVersiones = (versionNueva, versionAnterior) => {
    if (!versionAnterior) return [<p key="init" className="text-gray-300">Versión inicial creada.</p>];

    const cambios = [];

    const valorBaseNuevo = Number(versionNueva.valor_base);
    const valorBaseAnterior = Number(versionAnterior.valor_base);

    if (valorBaseNuevo !== valorBaseAnterior) {
        cambios.push(
            <p key="vb">
                Valor Base: <strong className="text-red-400 line-through">${valorBaseAnterior.toFixed(2)}</strong> → <strong className="text-green-400">${valorBaseNuevo.toFixed(2)}</strong>
            </p>
        );
    }

    const adicionalesNuevosMap = new Map((versionNueva.adicionales || []).map(a => [a.idAdicional, a]));
    const adicionalesAnterioresMap = new Map((versionAnterior.adicionales || []).map(a => [a.idAdicional, a]));

    for (const [id, adicionalNuevo] of adicionalesNuevosMap) {
        const adicionalAnterior = adicionalesAnterioresMap.get(id);

        if (!adicionalAnterior) {
            cambios.push(<p key={`add-${id}`}><span className="text-green-400">+ Añadido:</span> {adicionalNuevo.descripcion} (${Number(adicionalNuevo.costo).toFixed(2)})</p>);
        } else {
            const costoNuevo = Number(adicionalNuevo.costo);
            const costoAnterior = Number(adicionalAnterior.costo);
            if (costoNuevo !== costoAnterior) {
                cambios.push(
                    <p key={`mod-${id}`}>
                        <span className="text-yellow-400">~ Modificado:</span> {adicionalNuevo.descripcion} (${costoAnterior.toFixed(2)} → ${costoNuevo.toFixed(2)})
                    </p>
                );
            }
        }
    }

    for (const [id, adicionalAnterior] of adicionalesAnterioresMap) {
        if (!adicionalesNuevosMap.has(id)) {
            cambios.push(<p key={`del-${id}`}><span className="text-red-400">- Eliminado:</span> {adicionalAnterior.descripcion}</p>);
        }
    }

    if (cambios.length === 0) return [<p key="nc" className="text-gray-400">Sin cambios funcionales (solo actualización de metadatos).</p>];
    return cambios;
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="p-4 bg-[#1f1f1f] border border-gray-600 rounded-lg shadow-xl max-w-sm">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">{`Fecha: ${dataPoint.fecha}`}</p>
                    <p className="font-bold text-lg text-purple-400">{`Costo Total: $${dataPoint.Costo}`}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 space-y-1 text-xs text-gray-200">
                    <p className="font-semibold text-gray-300 mb-1">Cambios en esta versión:</p>
                    {dataPoint.cambios.map((cambio, index) => <div key={index}>{cambio}</div>)}
                </div>
            </div>
        );
    }
    return null;
};

const TarifaEvolucionModal = ({ tarifa, onClose }) => {
    const [historialData, setHistorialData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorialCompleto = async () => {
            if (!tarifa) return;
            setLoading(true);
            try {
                const [tarifaActualData, historial] = await Promise.all([
                    getTarifaById(tarifa.id_tarifa),
                    getHistorialDeTarifa(tarifa.id_tarifa)
                ]);

                const valorBaseActual = Number(tarifaActualData.valor_base) || 0;
                const adicionalesActuales = tarifaActualData.tarifaAdicionales?.map(ta => ({
                    idAdicional: ta.adicional?.idAdicional,
                    descripcion: ta.adicional?.descripcion,
                    costo: ta.costoPersonalizado
                })).filter(a => a.idAdicional) || [];

                const costoAdicionalesActual = adicionalesActuales.reduce((sum, ad) => sum + (Number(ad.costo) || 0), 0);
                const costoTotalCalculado = valorBaseActual + costoAdicionalesActual;

                const versionActual = {
                    version: (historial[0]?.version || 0) + 1,
                    costo_total: costoTotalCalculado,
                    fecha_modificacion: tarifaActualData.updatedAt,
                    valor_base: valorBaseActual,
                    adicionales: adicionalesActuales
                };

                const historialCompleto = [versionActual, ...historial];

                const datosParaGrafico = historialCompleto
                    .map((version, index) => {
                        const versionAnterior = historialCompleto[index + 1] || null;
                        const cambios = compararVersiones(version, versionAnterior);

                        return {
                            name: `Ver. ${version.version}`,
                            Costo: Number(version.costo_total).toFixed(2),
                            fecha: new Date(version.fecha_modificacion).toLocaleDateString('es-AR'),
                            cambios: cambios,
                        };
                    })
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

                setHistorialData(datosParaGrafico);
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
            <div className="bg-[#2d2d2b] rounded-2xl w-full max-w-4xl border border-purple-500 shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <div>
                        <h3 className="text-lg font-bold text-gray-200">Evolución Detallada de la Tarifa</h3>
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
                            <LineChart data={historialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" tickFormatter={(value) => `$${value}`} />
                                <Tooltip content={<CustomTooltip />} />
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
    const [selectedTarifaForChart, setSelectedTarifaForChart] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [promedioPorTransportista, setPromedioPorTransportista] = useState([]);
    const [ordenPromedioTransportista, setOrdenPromedioTransportista] = useState('asc');
    const [promedioPorZona, setPromedioPorZona] = useState([]);
    const [ordenPromedioZona, setOrdenPromedioZona] = useState('asc');


    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => { clearInterval(timerId); };
    }, []);

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

    useEffect(() => {
        if (!tarifas.length) {
            setPromedioPorZona([]);
            return;
        }

        const agrupado = {};

        tarifas.forEach(tarifa => {
            const origen = tarifa.zonaDeViaje?.origen;
            const destino = tarifa.zonaDeViaje?.destino;
            if (!origen || !destino) return;

            const clave = `${origen} → ${destino}`;

            if (!agrupado[clave]) {
                agrupado[clave] = { suma: 0, cantidad: 0 };
            }

            agrupado[clave].suma += Number(tarifa.valor_base) || 0;
            agrupado[clave].cantidad += 1;
        });

        const resultado = Object.entries(agrupado).map(([zona, { suma, cantidad }]) => ({
            zona,
            promedio: cantidad ? suma / cantidad : 0,
            cantidad,
        }));

        resultado.sort((a, b) =>
            ordenPromedioZona === 'asc' ? a.promedio - b.promedio : b.promedio - a.promedio
        );

        setPromedioPorZona(resultado);
    }, [tarifas, ordenPromedioZona]);

    useEffect(() => {
        if (!tarifas) return;

        const tarifasValidas = tarifas.filter(t => t.deletedAt === null && t.transportista);

        const agrupadas = {};

        tarifasValidas.forEach(t => {
            const nombre = t.transportista.nombre;
            if (!agrupadas[nombre]) {
                agrupadas[nombre] = { total: 0, cantidad: 0 };
            }
            agrupadas[nombre].total += parseFloat(t.valor_base);
            agrupadas[nombre].cantidad += 1;
        });

        let resumen = Object.entries(agrupadas).map(([nombre, { total, cantidad }]) => ({
            transportista: nombre,
            promedio: total / cantidad,
            cantidad,
        }));

        resumen.sort((a, b) =>
            ordenPromedioTransportista === 'asc'
                ? a.promedio - b.promedio
                : b.promedio - a.promedio
        );

        setPromedioPorTransportista(resumen);
    }, [tarifas, ordenPromedioTransportista]);

    const handleGenerarAnalisis = async () => {
        if (!fechaInicio || !fechaFin) {
            showNotification('Por favor, selecciona ambas fechas.');
            return;
        }
        if (new Date(fechaFin) < new Date(fechaInicio)) {
            showNotification('La fecha de fin no puede ser anterior a la fecha de inicio.');
            return;
        }

        const [startYear, startMonth, startDay] = fechaInicio.split('-').map(Number);
        const fechaInicioLocal = new Date(startYear, startMonth - 1, startDay);
        fechaInicioLocal.setHours(0, 0, 0, 0);
        const fechaInicioParaAPI = fechaInicioLocal.toISOString();

        const [endYear, endMonth, endDay] = fechaFin.split('-').map(Number);
        const fechaFinLocal = new Date(endYear, endMonth - 1, endDay);
        fechaFinLocal.setHours(23, 59, 59, 999);
        const fechaFinParaAPI = fechaFinLocal.toISOString();

        setLoadingAnalisis(true);
        try {
            const data = await getAnalisisTarifas(fechaInicioParaAPI, fechaFinParaAPI);

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

    const handleViewHistory = (e, tarifaId) => {
        e.stopPropagation();
        navigate(`/historial-tarifa/${tarifaId}`);
    };

    return (
        <>
            <div className="min-h-screen bg-[#242423] p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/tarifas')}>
                            <ArrowLeft size={24} className="text-gray-300 hover:text-gray-200" />
                            <h1 className="text-3xl font-bold text-gray-200">Reporte de Tarifas</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 text-lg font-mono text-emerald-400">
                                <span>{currentTime.toLocaleDateString('es-AR')}</span>
                                <span>{currentTime.toLocaleTimeString('es-AR')}</span>
                            </div>
                            <button onClick={fetchTarifas} disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-800">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                <span>Actualizar Datos</span>
                            </button>
                        </div>
                    </div>

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
                        <div className="text-center p-8"><Loader2 className="animate-spin text-purple-400 mx-auto" size={32} /></div>
                    ) : analisisData.length > 0 && (
                        <div className="bg-[#444240] rounded-xl border border-gray-700 overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-700">
                                <h2 className="text-xl font-bold text-gray-200">Resultados del Análisis</h2>
                                <p className="text-sm text-gray-400">Haz clic en una fila para ver la evolución gráfica o en el ícono de historial para ver el detalle completo.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Tarifa</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Inicial</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Final</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Variación ($)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Variación (%)</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Historial</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#444240] divide-y divide-gray-700">
                                        {analisisData.map(item => {
                                            const esPositivo = item.variacion_absoluta >= 0;
                                            return (
                                                <tr key={item.id_tarifa} onClick={() => setSelectedTarifaForChart(item)} className="cursor-pointer hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-300">{item.descripcion}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-400">${item.costo_inicial.toFixed(2)}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-200 font-semibold">${item.costo_final.toFixed(2)}</td>
                                                    <td className={`px-6 py-4 text-sm font-semibold ${esPositivo ? 'text-green-400' : 'text-red-400'}`}>
                                                        {esPositivo ? '+' : ''}{item.variacion_absoluta.toFixed(2)}
                                                    </td>
                                                    <td className={`px-6 py-4 text-sm font-semibold ${esPositivo ? 'text-green-400' : 'text-red-400'}`}>
                                                        {esPositivo ? '+' : ''}{item.variacion_porcentual.toFixed(2)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={(e) => handleViewHistory(e, item.id_tarifa)} title="Ver Historial" className="text-purple-400 hover:text-purple-600">
                                                            <HistoryIcon size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tabla con promedio por zona */}
                    <div className="bg-[#444240] p-6 rounded-xl border border-gray-700 mb-8">
                        <h2 className="text-xl font-bold text-gray-200 mb-4">Costos por Zona (Valor Base)</h2>
                        <div className="mb-4 w-64">
                            <Select
                                options={[
                                    { value: 'asc', label: 'Menor a Mayor ↑' },
                                    { value: 'desc', label: 'Mayor a Menor ↓' },
                                ]}
                                value={
                                    ordenPromedioZona === 'asc'
                                        ? { value: 'asc', label: 'Menor a Mayor ↑' }
                                        : { value: 'desc', label: 'Mayor a Menor ↓' }
                                }
                                onChange={(selected) => setOrdenPromedioZona(selected?.value || 'asc')}
                                isClearable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: '#242423',
                                        borderColor: '#555',
                                        color: '#fff',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: '#fff',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: '#333',
                                        color: '#fff',
                                    }),
                                }}
                            />
                        </div>

                        <table className="w-full text-gray-300 text-sm table-fixed">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-2 w-1/3">Zona (Origen → Destino)</th>
                                    <th className="text-center py-2 w-1/3">Promedio Valor Base</th>
                                    <th className="text-right py-2 w-1/3">Cantidad de Tarifas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promedioPorZona.map(({ zona, promedio, cantidad }) => (
                                    <tr key={zona} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-default">
                                        <td className="py-2">{zona}</td>
                                        <td className="py-2 text-center">${promedio.toFixed(2)}</td>
                                        <td className="py-2 text-right">{cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-[#444240] p-6 rounded-xl border border-gray-700 mb-8">
                        <h2 className="text-xl font-bold text-gray-200 mb-4">Promedio por Transportista (Valor Base)</h2>

                        <div className="mb-4 w-64">
                            <Select
                                options={[
                                    { value: 'asc', label: 'Más económico primero ↑' },
                                    { value: 'desc', label: 'Más caro primero ↓' },
                                ]}
                                value={
                                    ordenPromedioTransportista === 'asc'
                                        ? { value: 'asc', label: 'Más económico primero ↑' }
                                        : { value: 'desc', label: 'Más caro primero ↓' }
                                }
                                onChange={(selected) => setOrdenPromedioTransportista(selected?.value || 'asc')}
                                isClearable={false}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: '#242423',
                                        borderColor: '#555',
                                        color: '#fff',
                                    }),
                                    singleValue: (base) => ({
                                        ...base,
                                        color: '#fff',
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: '#333',
                                        color: '#fff',
                                    }),
                                }}
                            />
                        </div>

                        <table className="w-full text-gray-300 text-sm table-fixed">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-2 w-1/3">Transportista</th>
                                    <th className="text-center py-2 w-1/3">Promedio Costo Total</th>
                                    <th className="text-right py-2 w-1/3">Cantidad de Tarifas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promedioPorTransportista.map(({ transportista, promedio, cantidad }) => (
                                    <tr key={transportista} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-default">
                                        <td className="py-2">{transportista}</td>
                                        <td className="py-2 text-center">${promedio.toFixed(2)}</td>
                                        <td className="py-2 text-right">{cantidad}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>




                    {selectedTarifaForChart && (
                        <TarifaEvolucionModal tarifa={selectedTarifaForChart} onClose={() => setSelectedTarifaForChart(null)} />
                    )}

                    {notification.show && (
                        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
                            {notification.message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TarifasReport;
