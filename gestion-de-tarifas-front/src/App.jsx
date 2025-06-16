import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import RegistrarTarifa from './components/Form_registro_tarifas/RegistroTarifas'
import HistoricoTarifas from './components/Historico_tarifas/HistoricoTarifas'
import './App.css'
import Entidades_page from './components/Entidades/Entidades_page'
import Sidebar from './components/Sidebar/Sidebar'

const App = () => {
  return (
    <BrowserRouter>
      <div className='App'>
        {/*<Header />*/}
        <Sidebar />
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
