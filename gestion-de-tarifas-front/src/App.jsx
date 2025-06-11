import { Route } from 'react-router-dom'
import Header from './components/Header/Header'
import { BrowserRouter, Routes } from 'react-router-dom'
import RegistrarTarifa from './components/Form_registro_tarifas/RegistroTarifas'
import HistoricoTarifas from './components/Historico_tarifas/HistoricoTarifas'
import './App.css'
import Entidades_page from './components/Entidades/Entidades_page'

const App = () => {
  return (
    <BrowserRouter>
      <div className='App'>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/registrarTarifa" element={<RegistrarTarifa />} />
            <Route path="/historicoTarifas" element={<HistoricoTarifas />} />
            <Route path="/entidades" element={<Entidades_page />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
