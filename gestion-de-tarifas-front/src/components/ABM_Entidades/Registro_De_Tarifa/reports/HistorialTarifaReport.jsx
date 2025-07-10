import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Loader2, ArrowLeft, Calendar, User, Truck, MapPin } from 'lucide-react';
import { getTarifaById, getHistorialDeTarifa } from '../../../../services/tarifaCosto.service';


const compararVersiones = (versionNueva, versionAnterior) => {
    if (!versionAnterior) return [<p key="init">Versión inicial creada.</p>];
    
    const cambios = [];

    const valorBaseNuevo = Number(versionNueva.valor_base);
    const valorBaseAnterior = Number(versionAnterior.valor_base);

    if (valorBaseNuevo !== valorBaseAnterior) {
        cambios.push(
            <p key="vb">
                Valor Base cambió de <strong className="text-red-400 line-through">${valorBaseAnterior.toFixed(2)}</strong> a <strong className="text-green-400">${valorBaseNuevo.toFixed(2)}</strong>.
            </p>
        );
    }
    
    const adicionalesNuevosMap = new Map((versionNueva.adicionales || []).map(a => [a.idAdicional, a]));
    const adicionalesAnterioresMap = new Map((versionAnterior.adicionales || []).map(a => [a.idAdicional, a]));

    
    for (const [id, adicionalNuevo] of adicionalesNuevosMap) {
        const adicionalAnterior = adicionalesAnterioresMap.get(id);
        
        if (!adicionalAnterior) {
            
            cambios.push(<p key={`add-${id}`}>+ Se agregó: <strong className="text-green-400">{adicionalNuevo.descripcion}</strong> (Costo: ${Number(adicionalNuevo.costo).toFixed(2)})</p>);
        } else {
           
            const costoNuevo = Number(adicionalNuevo.costo);
            const costoAnterior = Number(adicionalAnterior.costo);
            if (costoNuevo !== costoAnterior) {
                cambios.push(
                    <p key={`mod-${id}`}>
                        ~ Costo de <strong className="text-yellow-400">{adicionalNuevo.descripcion}</strong> cambió de 
                        <strong className="text-red-400 line-through"> ${costoAnterior.toFixed(2)}</strong> a 
                        <strong className="text-green-400"> ${costoNuevo.toFixed(2)}</strong>.
                    </p>
                );
            }
        }
    }

    for (const [id, adicionalAnterior] of adicionalesAnterioresMap) {
        if (!adicionalesNuevosMap.has(id)) {
            cambios.push(<p key={`del-${id}`}>- Se eliminó: <strong className="text-red-400">{adicionalAnterior.descripcion}</strong></p>);
        }
    }

    if (cambios.length === 0) return [<p key="nc">Sin cambios funcionales (solo actualización de metadatos).</p>];
    return cambios;
};


const HistorialTarifaReport = () => {
  const [historial, setHistorial] = useState([]);
  const [tarifa, setTarifa] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const [tarifaData, historialData] = await Promise.all([
          getTarifaById(id),
          getHistorialDeTarifa(id)
        ]);
        
        setTarifa(tarifaData);
        
        const versionActual = {
          version: (historialData[0]?.version || 0) + 1,
          fecha_modificacion: tarifaData.updatedAt,
          usuario_modificacion: 'usuario.actual',
          valor_base: Number(tarifaData.valor_base),
          adicionales: tarifaData.tarifaAdicionales?.map(ta => ({
              idAdicional: ta.adicional?.idAdicional,
              descripcion: ta.adicional?.descripcion,
              costo: ta.costoPersonalizado // Se incluye el costo
          })).filter(a => a.idAdicional) || []
        };
        setHistorial([versionActual, ...historialData]);

      } catch (error) {
        console.error("Error al cargar el historial", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#242423] p-8 text-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => navigate('/tarifas')} className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft size={20} />
            Volver a Tarifas
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-purple-400" size={40} /></div>
        ) : !tarifa ? (
            <div className="text-center text-red-400">No se pudo cargar la información de la tarifa.</div>
        ) : (
          <>
            <div className="bg-[#444240] p-6 rounded-2xl border border-gray-700 mb-8">
              <h1 className="text-3xl font-bold mb-2">Historial de la Tarifa <span className="text-purple-400">#{tarifa.id}</span></h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2"><Truck size={16} className="text-gray-500"/><span>{tarifa.transportista?.nombre}</span></div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-500"/><span>{tarifa.zonaDeViaje?.origen} - {tarifa.zonaDeViaje?.destino}</span></div>
              </div>
            </div>

            <div className="relative pl-8 border-l-2 border-gray-700">
              {historial.map((version, index) => {
                const cambios = compararVersiones(version, historial[index + 1]);
                const esVersionActual = index === 0;
                return (
                  <div key={version.version} className="mb-10 relative">
                    <div className={`absolute -left-[18px] top-1 w-8 h-8 rounded-full flex items-center justify-center ${esVersionActual ? 'bg-purple-500 ring-8 ring-purple-500/20' : 'bg-gray-600'}`}>
                      <HistoryIcon size={16} />
                    </div>
                    <div className="bg-[#444240] p-5 rounded-xl border border-gray-700 ml-4">
                        <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-xl text-gray-100">
                            Versión {version.version} {esVersionActual && <span className="text-xs ml-2 bg-purple-500 text-white px-2 py-1 rounded-full align-middle">ACTUAL</span>}
                            </p>
                            <div className="text-xs text-gray-400 flex items-center gap-4">
                                <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{new Date(version.fecha_modificacion).toLocaleString('es-AR')}</span></div>
                                <div className="flex items-center gap-1.5"><User size={14} /><span>{version.usuario_modificacion}</span></div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-300 space-y-2 pl-2 border-l-2 border-gray-600">
                            {cambios.map((cambio, i) => <div key={i}>{cambio}</div>)}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialTarifaReport;