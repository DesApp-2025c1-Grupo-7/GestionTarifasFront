import { Route } from 'react-router-dom'
import Header from './components/Header/Header'
import { BrowserRouter, Routes } from 'react-router-dom'
import RegistrarTarifa from './components/Form_registro_tarifas/RegistroTarifas'
import HistoricoTarifas from './components/Historico_tarifas/HistoricoTarifas'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <div className='App'>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/registrarTarifa" element={<RegistrarTarifa />} />
            <Route path="/historicoTarifas" element={<HistoricoTarifas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
