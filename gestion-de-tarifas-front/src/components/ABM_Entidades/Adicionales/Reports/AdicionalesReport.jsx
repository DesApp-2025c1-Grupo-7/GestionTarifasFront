import React, { useState, useEffect, useMemo } from 'react';
import { Star, TrendingDown, ArrowLeft, RefreshCw } from 'lucide-react';
import { getAdicionalesReport } from '../../../../services/adicional.service';
import { useNavigate } from 'react-router-dom';

const AdicionalesReport = ({ showNotification }) => {
  const [adicionales, setAdicionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uso');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdicionales();
  }, []);

  const fetchAdicionales = async () => {
    try {
      setLoading(true);
      const data = await getAdicionalesReport();

      const mappedData = data.map(item => ({
        ...item,
        id: item.idAdicional,
        costo: parseFloat(item.costo), 
      }));

      setAdicionales(mappedData);
    } catch (error) {
      console.error('Error al cargar el reporte de adicionales:', error);
      showNotification?.('Error al cargar el reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (adicionales.length === 0) return { totalAdicionales: 0, totalInclusiones: 0, promedioInclusiones: 0, masPopular: 'N/A' };

    const totalAdicionales = adicionales.length;
    const totalInclusiones = adicionales.reduce((sum, item) => sum + item.frecuenciaDeUso, 0);
    const promedioInclusiones = totalAdicionales > 0 ? (totalInclusiones / totalAdicionales) : 0;
    const masPopularItem = adicionales.reduce((max, item) => (item.frecuenciaDeUso > max.frecuenciaDeUso ? item : max), adicionales[0]);

    return {
      totalAdicionales,
      totalInclusiones,
      promedioInclusiones: promedioInclusiones.toFixed(1),
      masPopular: masPopularItem?.descripcion || 'N/A'
    };
  }, [adicionales]);

  const filteredData = useMemo(() => {
    let filtered = adicionales.filter(item =>
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'uso':
          return b.frecuenciaDeUso - a.frecuenciaDeUso;
        case 'costo':
          return b.costo - a.costo;
        case 'alfabetico':
          return a.descripcion.localeCompare(b.descripcion);
        default:
          return 0;
      }
    });

    return filtered;
  }, [adicionales, searchTerm, sortBy]);

  const agruparYSumar = (items) => {
    const map = new Map();

    items.forEach(item => {
      const key = item.descripcion;
      if (!map.has(key)) {
        map.set(key, { 
          ...item, 
          frecuenciaDeUso: item.frecuenciaDeUso, 
          apariciones: 1 
        });
      } else {
        const existing = map.get(key);
        existing.frecuenciaDeUso += item.frecuenciaDeUso;
        existing.apariciones += 1;
        map.set(key, existing);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.frecuenciaDeUso - a.frecuenciaDeUso);
  };

  const adicionalesAgrupados = useMemo(() => agruparYSumar(filteredData), [filteredData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
        <span className="text-gray-300 ml-2">Cargando reporte de adicionales...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#242423] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-gray-300 hover:text-gray-200" />
            <h1 className="text-3xl font-bold text-gray-200">Reporte de Adicionales</h1>
          </div>
          <button onClick={fetchAdicionales} className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#444240] p-5 rounded-xl shadow-sm border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Total Adicionales</p>
            <p className="text-2xl font-bold text-gray-100">{stats.totalAdicionales}</p>
          </div>
          <div className="bg-[#444240] p-5 rounded-xl shadow-sm border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Inclusiones en Tarifas</p>
            <p className="text-2xl font-bold text-gray-100">{stats.totalInclusiones}</p>
          </div>
          <div className="bg-[#444240] p-5 rounded-xl shadow-sm border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Promedio Inclusión</p>
            <p className="text-2xl font-bold text-gray-100">{stats.promedioInclusiones}</p>
          </div>
          <div className="bg-[#444240] p-5 rounded-xl shadow-sm border border-gray-700">
            <p className="text-sm font-medium text-gray-400">Más Popular</p>
            <p className="text-xl font-bold text-gray-100 truncate" title={stats.masPopular}>{stats.masPopular}</p>
          </div>
        </div>

        <div className="bg-[#444240] rounded-xl shadow-sm border border-gray-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-200">Catálogo Detallado ({filteredData.length} adicionales)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Adicional</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Estándar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Frecuencia (en Tarifas)</th>
                </tr>
              </thead>
              <tbody className="bg-[#444240] divide-y divide-gray-700">
                {filteredData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-200">{item.descripcion}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-400">${item.costo.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-400">{item.frecuenciaDeUso} tarifas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border border-gray-700">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
              <Star className="text-yellow-400 mr-2" size={20} /> Más Utilizados
            </h3>
            <div className="space-y-2">
              {adicionalesAgrupados.slice(0, 5).map(item => (
                <div key={item.id} className="flex justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300">{item.descripcion}</span>
                  <span className="font-bold text-indigo-300">{item.frecuenciaDeUso} tarifas</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border border-gray-700">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
              <TrendingDown className="text-red-400 mr-2" size={20} /> Menos Utilizados
            </h3>
            <div className="space-y-2">
              {adicionalesAgrupados.slice(-5).reverse().map(item => (
                <div key={item.id} className="flex justify-between p-2 bg-gray-800 rounded">
                  <span className="text-gray-300">{item.descripcion}</span>
                  <span className="font-bold text-indigo-300">{item.frecuenciaDeUso} tarifas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdicionalesReport;


