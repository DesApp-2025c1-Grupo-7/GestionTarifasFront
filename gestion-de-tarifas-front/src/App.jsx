import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importamos el Layout principal
import Entidades from './components/ABM_Entidades/ABM_Entidades';

// Importamos TODOS los componentes para las rutas anidadas
import Adicionales from './components/ABM_Entidades/Adicionales/Adicionales';
import TiposCarga from './components/ABM_Entidades/Tipo_De_Carga/Carga';
import TiposVehiculo from './components/ABM_Entidades/Tipo_De_Vehiculo/Vehiculo';
import ZonasViaje from './components/ABM_Entidades/Zona_De_Viaje/ZonaViaje';
import Transportistas from './components/ABM_Entidades/Transportista/Transportista';
import RegistroTarifas from './components/ABM_Entidades/Registro_De_Tarifa/RegistroTarifas';
import ReportesAdicionales from './components/ABM_Entidades/Adicionales/Reports/AdicionalesReport';

import TarifasReport from './components/ABM_Entidades/Registro_De_Tarifa/reports/TarifasReport';

import HistorialTarifaReport from './components/ABM_Entidades/Registro_De_Tarifa/reports/HistorialTarifaReport';

const App = () => {
  return (
    <Routes>
      {/* La ruta padre renderiza el Layout (ABMEntidades) */}
      <Route path="/" element={<Entidades />}>
        
        {/* Ruta por defecto: Tipos de Carga */}
        <Route index element={<TiposCarga />} />

        {/* Ruta para cada entidad */}
        <Route path="tipos-de-carga" element={<TiposCarga />} />
        <Route path="tipos-de-vehiculo" element={<TiposVehiculo />} />
        <Route path="zonas" element={<ZonasViaje />} />
        <Route path="transportistas" element={<Transportistas />} />
        <Route path="adicionales" element={<Adicionales />} />
        <Route path="tarifas" element={<RegistroTarifas />} />
        </Route>
        {/* Ruta para el reporte, anidada para mantener la consistencia */}
        <Route path="reports/adicionales" element={<ReportesAdicionales />} />
        <Route path="/reports/tarifas" element={<TarifasReport />} />
        <Route path="/tarifas/historial/:id" element={<HistorialTarifaReport />} />

        <Route path="/reporte-tarifas" element={<TarifasReport />} />
        <Route path="/historial-tarifa/:id" element={<HistorialTarifaReport />} />
    </Routes>
  );
};

export default App;