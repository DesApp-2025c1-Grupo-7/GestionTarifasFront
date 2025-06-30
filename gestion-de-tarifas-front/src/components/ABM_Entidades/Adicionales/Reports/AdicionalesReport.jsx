import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, Package, BarChart3, PieChart, Calendar, Filter, RefreshCw } from 'lucide-react';
import { getAdicionales, getAdicionalesReport } from '../../../../services/adicional.service';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdicionalesReport = ({ showNotification, tabColor = 'indigo' }) => {
  const [adicionales, setAdicionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('costo');
  const navigate = useNavigate();

  const [usageData, setUsageData] = useState({});

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
        categoria: categorizarAdicional(item.descripcion)
      }));

      setAdicionales(mappedData);

      const usage = {};
      mappedData.forEach(item => {
        usage[item.id] = {
          usosMensuales: item.usosMensuales,
          tarifasMasUsadas: item.tarifasMasUsadas
        };
      });
      setUsageData(usage);

    } catch (error) {
      console.error('Error al cargar adicionales:', error);
      showNotification?.('Error al cargar los adicionales', 'error');
    } finally {
      setLoading(false);
    }
  };


  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

  const stats = useMemo(() => {
    if (adicionales.length === 0) return { totalAdicionales: 0, totalUsosMes: 0, promedioUso: 0, ingresosTotales: 0 };

    const totalAdicionales = adicionales.length;
    const totalUsosMes = adicionales.reduce((sum, item) => {
      const usage = usageData[item.id];
      return sum + (usage?.usosMensuales?.[5] || 0);
    }, 0);
    const promedioUso = totalUsosMes / totalAdicionales;
    const ingresosTotales = adicionales.reduce((sum, item) => {
      const usage = usageData[item.id];
      const usos = usage?.usosMensuales?.[5] || 0;
      return sum + (item.costo * usos);
    }, 0);

    return {
      totalAdicionales,
      totalUsosMes,
      promedioUso: promedioUso.toFixed(1),
      ingresosTotales
    };
  }, [adicionales, usageData]);

  // Filtrar y ordenar datos
  const filteredData = useMemo(() => {
    let filtered = adicionales.filter(item => {
      const matchesSearch = item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.categoria === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenar según criterio seleccionado
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'uso':
          const usageA = usageData[a.id]?.usosMensuales?.[5] || 0;
          const usageB = usageData[b.id]?.usosMensuales?.[5] || 0;
          return usageB - usageA;
        case 'costo':
          return b.costo - a.costo;
        case 'ingresos':
          const ingresosA = a.costo * (usageData[a.id]?.usosMensuales?.[5] || 0);
          const ingresosB = b.costo * (usageData[b.id]?.usosMensuales?.[5] || 0);
          return ingresosB - ingresosA;
        case 'alfabetico':
          return a.descripcion.localeCompare(b.descripcion);
        default:
          return 0;
      }
    });

    return filtered;
  }, [adicionales, usageData, searchTerm, selectedCategory, sortBy]);

  const categorias = useMemo(() => {
    return [...new Set(adicionales.map(item => item.categoria))];
  }, [adicionales]);

  const categoriaStats = useMemo(() => {
    const stats = {};
    adicionales.forEach(item => {
      const categoria = item.categoria;
      const usage = usageData[item.id];
      const usos = usage?.usosMensuales?.[5] || 0;

      if (!stats[categoria]) {
        stats[categoria] = { count: 0, totalUsos: 0, ingresos: 0 };
      }
      stats[categoria].count++;
      stats[categoria].totalUsos += usos;
      stats[categoria].ingresos += item.costo * usos;
    });
    return Object.entries(stats).map(([categoria, data]) => ({
      categoria,
      ...data
    }));
  }, [adicionales, usageData]);

  const getTrendIcon = (id) => {
    const usage = usageData[id];
    if (!usage?.usosMensuales) return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;

    const lastMonth = usage.usosMensuales[5];
    const previousMonth = usage.usosMensuales[4];
    if (lastMonth > previousMonth) {
      return <TrendingUp className="text-green-500" size={16} />;
    } else if (lastMonth < previousMonth) {
      return <TrendingDown className="text-red-500" size={16} />;
    }
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
  };

  const getUsageColor = (uso) => {
    if (uso >= 70) return 'text-green-600 bg-green-50';
    if (uso >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="animate-spin text-blue-500" size={24} />
              <span className="text-gray-300">Cargando reporte de adicionales...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#242423] p-8 shadow-lg border border-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(-1)}>
              <ArrowLeft size={24} className="text-gray-300 hover:text-gray-200" />
              <h1 className="text-3xl font-bold text-gray-200 mb-0">
                Reporte de Adicionales Disponibles
              </h1>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={fetchAdicionales}
                className={`flex items-center space-x-2 px-4 py-2 bg-${tabColor}-500 text-white rounded-lg hover:bg-${tabColor}-600 transition-colors`}
              >
                <RefreshCw size={16} />
                <span>Actualizar</span>
              </button>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Adicionales</p>
                <p className="text-2xl font-bold text-gray-200">{stats.totalAdicionales}</p>
              </div>
              <Package className="text-blue-500" size={24} />
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Usos Este Mes</p>
                <p className="text-2xl font-bold text-gray-200">{stats.totalUsosMes}</p>
              </div>
              <BarChart3 className="text-green-500" size={24} />
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Promedio de Uso</p>
                <p className="text-2xl font-bold text-gray-200">{stats.promedioUso}</p>
              </div>
              <PieChart className="text-purple-500" size={24} />
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Ingresos Mensuales</p>
                <p className="text-2xl font-bold text-gray-200">${stats.ingresosTotales.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#444240] p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar adicionales..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-4">

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-400 "
              >
                <option value="costo">Ordenar por costo</option>
                <option value="uso">Ordenar por uso</option>
                <option value="ingresos">Ordenar por ingresos</option>
                <option value="alfabetico">Ordenar alfabéticamente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#444240] rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-300">
              Catálogo Detallado ({filteredData.length} adicionales)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#444240]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Adicional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Costo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Uso Mensual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tendencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tarifas Populares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#444240] divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-300">
                      <div className="flex flex-col items-center">
                        <Package className="text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-semibold mb-2">No se encontraron adicionales</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const usage = usageData[item.id];
                    const usoMensual = usage?.usosMensuales?.[5] || 0;
                    const ingresoMensual = item.costo * usoMensual;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-200 max-w-xs">
                            {item.descripcion}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-200">
                            ${item.costo.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUsageColor(usoMensual)}`}>
                            {usoMensual} usos
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getTrendIcon(item.id)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(usage?.tarifasMasUsadas || []).map(tarifa => (
                              <span key={tarifa} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-300">
                                {tarifa}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-green-600">
                            ${ingresoMensual.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Más Utilizados</h3>
            <div className="space-y-3">
              {[...filteredData].sort((a, b) => {
                const usageA = usageData[a.id]?.usosMensuales?.[5] || 0;
                const usageB = usageData[b.id]?.usosMensuales?.[5] || 0;
                return usageB - usageA;
              }).slice(0, 5).map((item, index) => {
                const usage = usageData[item.id];
                const usoMensual = usage?.usosMensuales?.[5] || 0;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200 text-sm">{item.descripcion}</p>
                        <p className="text-xs text-gray-300">${item.costo.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{usoMensual}</p>
                      <p className="text-xs text-gray-300">usos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#444240] p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-bold text-gray-300 mb-4">Mayor Ingreso</h3>
            <div className="space-y-3">
              {[...filteredData].sort((a, b) => {
                const ingresosA = a.costo * (usageData[a.id]?.usosMensuales?.[5] || 0);
                const ingresosB = b.costo * (usageData[b.id]?.usosMensuales?.[5] || 0);
                return ingresosB - ingresosA;
              }).slice(0, 5).map((item, index) => {
                const usage = usageData[item.id];
                const usoMensual = usage?.usosMensuales?.[5] || 0;
                const ingresoMensual = item.costo * usoMensual;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200 text-sm">{item.descripcion}</p>
                        <p className="text-xs text-gray-300">{usoMensual} usos × ${item.costo.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${ingresoMensual.toFixed(2)}</p>
                      <p className="text-xs text-gray-300">ingresos</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdicionalesReport;