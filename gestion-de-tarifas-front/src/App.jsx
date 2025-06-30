import React from 'react';
import Entidades from './components/ABM_Entidades/ABM_Entidades';
import ReportesAdicionales from './components/ABM_Entidades/Adicionales/Reports/AdicionalesReport';
import Adicionales from './components/ABM_Entidades/Adicionales/Adicionales'
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Entidades />} />
      <Route
        path="/adicionales"
        element={<Adicionales key={window.location.pathname} />}
      />
      <Route path="/reports/adicionales" element={<ReportesAdicionales />} />
    </Routes>
  );
};

export default App;
