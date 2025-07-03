import React, { useState, useEffect, useMemo } from 'react';
import { Search, Star, TrendingDown, ArrowLeft, RefreshCw, ListTree, Loader2, X } from 'lucide-react';
import { getAdicionalesReport, getTarifasForAdicional } from '../../../../services/adicional.service';
import { useNavigate } from 'react-router-dom';

const categorizarAdicional = (descripcion) => {
  const descLower = descripcion.toLowerCase();
  if (descLower.includes('seguro')) return 'Seguros';
  if (descLower.includes('almacenamiento')) return 'Almacenamiento';
  if (descLower.includes('embalaje')) return 'Embalaje';
  if (descLower.includes('urgente') || descLower.includes('prioritario')) return 'Prioridad';
  if (descLower.includes('refrigerado') || descLower.includes('frágil')) return 'Manejo Especial';
  return 'Otros';
};

const AdicionalesReport = ({ showNotification }) => {
  const [adicionales, setAdicionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uso');
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ adicional: null, tarifas: [] });
  const [isLoadingModal, setIsLoadingModal] = useState(false);

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
        frecuenciaDeUso: parseInt(item.frecuenciaDeUso, 10),
        categoria: categorizarAdicional(item.descripcion)
      }));
      setAdicionales(mappedData);
    } catch (error) {
      console.error('Error al cargar el reporte de adicionales:', error);
      showNotification?.('Error al cargar el reporte', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (adicional) => {
    if (adicional.frecuenciaDeUso === 0) return;
    setIsModalOpen(true);
    setIsLoadingModal(true);
    setModalContent({ adicional, tarifas: [] });
    const tarifasData = await getTarifasForAdicional(adicional.idAdicional);
    setModalContent({ adicional, tarifas: tarifasData });
    setIsLoadingModal(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        case 'menos_uso':
          return a.frecuenciaDeUso - b.frecuenciaDeUso;
        case 'costo':
          return Number(b.costo) - Number(a.costo);
        case 'menor_costo':
          return Number(a.costo) - Number(b.costo);
        case 'alfabetico':
          return a.descripcion.localeCompare(b.descripcion);
        default:
          return 0;
      }
    });
    return filtered;
  }, [adicionales, searchTerm, sortBy]);

  // Agrupamiento por descripción normalizada
  const normalizeText = (text) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const groupedData = useMemo(() => {
    const map = new Map();
    for (const item of filteredData) {
      const normalizedDesc = normalizeText(item.descripcion);
      if (map.has(normalizedDesc)) {
        const existing = map.get(normalizedDesc);
        existing.frecuenciaDeUso += item.frecuenciaDeUso;
      } else {
        map.set(normalizedDesc, {
          ...item,
          descripcionOriginal: item.descripcion,
          descripcion: normalizedDesc,
        });
      }
    }
    return Array.from(map.values());
  }, [filteredData]);

  const masUtilizados = useMemo(() => {
    return [...groupedData].sort((a, b) => b.frecuenciaDeUso - a.frecuenciaDeUso).slice(0, 5);
  }, [groupedData]);

  const menosUtilizados = useMemo(() => {
    return [...groupedData].sort((a, b) => a.frecuenciaDeUso - b.frecuenciaDeUso).slice(0, 5);
  }, [groupedData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
        <span className="text-gray-300 ml-2">Cargando reporte de adicionales...</span>
      </div>
    );
  }

  return (
    <>
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
            <div className="bg-[#444240] p-5 rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Total Adicionales</p>
              <p className="text-2xl font-bold text-gray-100">{stats.totalAdicionales}</p>
            </div>
            <div className="bg-[#444240] p-5 rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Inclusiones en Tarifas</p>
              <p className="text-2xl font-bold text-gray-100">{stats.totalInclusiones}</p>
            </div>
            <div className="bg-[#444240] p-5 rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Promedio Inclusión</p>
              <p className="text-2xl font-bold text-gray-100">{stats.promedioInclusiones}</p>
            </div>
            <div className="bg-[#444240] p-5 rounded-xl border border-gray-700">
              <p className="text-sm font-medium text-gray-400">Más Popular</p>
              <p className="text-xl font-bold text-gray-100 truncate" title={stats.masPopular}>{stats.masPopular}</p>
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl border border-gray-700 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar adicionales..." className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200">
                <option value="uso">Ordenar por más usados</option>
                <option value="menos_uso">Ordenar por menos usados</option>
                <option value="costo">Ordenar por mayor costo</option>
                <option value="menor_costo">Ordenar por menor costo</option>
                <option value="alfabetico">Ordenar alfabéticamente (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#444240] rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-200">Catálogo Detallado ({filteredData.length} adicionales)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Adicional</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Costo Estándar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Frecuencia</th>
                  </tr>
                </thead>
                <tbody className="bg-[#444240] divide-y divide-gray-700">
                  {filteredData.map(item => (
                    <tr key={item.id} onClick={() => handleRowClick(item)} className={`transition-colors ${item.frecuenciaDeUso > 0 ? 'cursor-pointer hover:bg-gray-700' : 'opacity-60'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-200">{item.descripcion}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold text-blue-200 bg-blue-900 rounded-full">{item.categoria}</span></td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-400">${Number(item.costo).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-indigo-400">{item.frecuenciaDeUso} tarifas</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-[#444240] p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center"><Star className="text-yellow-400 mr-2" size={20} /> Más Utilizados</h3>
              <div className="space-y-2">
                {masUtilizados.map(item => (
                  <div key={item.descripcion} className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-gray-300">{item.descripcionOriginal}</span>
                    <span className="font-bold text-indigo-300">{item.frecuenciaDeUso} tarifas</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#444240] p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center"><TrendingDown className="text-red-400 mr-2" size={20} /> Menos Utilizados</h3>
              <div className="space-y-2">
                {menosUtilizados.map(item => (
                  <div key={item.descripcion} className="flex justify-between p-2 bg-gray-800 rounded">
                    <span className="text-gray-300">{item.descripcionOriginal}</span>
                    <span className="font-bold text-indigo-300">{item.frecuenciaDeUso} tarifas</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#2d2d2b] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-indigo-500">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <ListTree className="text-indigo-400" />
                <h3 className="text-lg font-bold text-gray-200">
                  Tarifas que utilizan: "{modalContent.adicional?.descripcion}"
                </h3>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingModal ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                </div>
              ) : (
                <ul className="space-y-3">
                  {modalContent.tarifas.length > 0 ? (
                    modalContent.tarifas.map(tarifa => (
                      <li key={tarifa.id} className="bg-[#444240] p-4 rounded-lg border border-gray-600">
                        <p className="font-semibold text-indigo-300">ID Tarifa: {tarifa.id} | Valor Base: ${Number(tarifa.valor_base).toFixed(2)}</p>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">Transportista:</span> {tarifa.transportista?.nombre || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">Vehículo:</span> {tarifa.tipoVehiculo?.descripcion || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-300">
                          <span className="font-medium">Ruta:</span> {tarifa.zonaDeViaje?.origen} - {tarifa.zonaDeViaje?.destino}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className="text-center text-gray-400">No se encontraron tarifas para este servicio.</p>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdicionalesReport;
