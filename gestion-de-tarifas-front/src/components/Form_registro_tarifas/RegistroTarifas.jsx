import './RegistroTarifas.css';
import { useState } from 'react';

const RegistroTarifas = () => {
  const [vehiculo, setVehiculo] = useState('');
  const [carga, setCarga] = useState('');
  const [zona, setZona] = useState('');
  const [transportista, setTransportista] = useState('');
  const [infoCarga, setInfoCarga] = useState('');
  const [ayudantes, setAyudantes] = useState(2);
  const [esPeligrosa, setEsPeligrosa] = useState(false);
  const [estadia, setEstadia] = useState(false);
  const [otros, setOtros] = useState('');
  const [costoTotal, setCostoTotal] = useState(1000); // valor base inicial

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevaTarifa = {
      fecha: new Date().toLocaleString(),
      vehiculo,
      carga,
      zona,
      transportista,
      infoCarga,
      ayudantes,
      esPeligrosa,
      estadia,
      otros,
      costoTotal
    };

    const historialAnterior = JSON.parse(localStorage.getItem('tarifas')) || [];
    const nuevoHistorial = [nuevaTarifa, ...historialAnterior];
    localStorage.setItem('tarifas', JSON.stringify(nuevoHistorial));

    // Reset
    setVehiculo('');
    setCarga('');
    setZona('');
    setTransportista('');
    setInfoCarga('');
    setAyudantes(2);
    setEsPeligrosa(false);
    setEstadia(false);
    setOtros('');
    setCostoTotal(1000);
  };

  return (
    <form className="container" onSubmit={handleSubmit}>
      <h2>Registrar Tarifa</h2>
      <div className="form-box">
        <div className="form-grid">
          <div className="form-group">
            <label>Vehículo</label>
            <select value={vehiculo} onChange={(e) => setVehiculo(e.target.value)}>
              <option value="">Seleccione el vehículo</option>
              <option value="camion1">Camión 1</option>
              <option value="camion2">Camión 2</option>
            </select>
          </div>

          <div className="form-group">
            <label>Carga</label>
            <select value={carga} onChange={(e) => setCarga(e.target.value)}>
              <option value="">Seleccione el tipo de carga</option>
              <option value="granel">Granel</option>
              <option value="contenedor">Contenedor</option>
              <option value="refrigerada">Refrigerada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Zona de viaje</label>
            <select value={zona} onChange={(e) => setZona(e.target.value)}>
              <option value="">Seleccione la zona</option>
              <option value="norte">Zona Norte</option>
              <option value="sur">Zona Sur</option>
              <option value="centro">Zona Centro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transportista</label>
            <select value={transportista} onChange={(e) => setTransportista(e.target.value)}>
              <option value="">Seleccione el transportista</option>
              <option value="litoral">Logística del Litoral SA</option>
              <option value="rapidos">Transportes Rápidos SRL</option>
              <option value="pr">PR Transportes</option>
            </select>
          </div>

          <div className="form-group wide">
            <label>Información de carga</label>
            <input
              type="text"
              value={infoCarga}
              onChange={(e) => setInfoCarga(e.target.value)}
              placeholder="Escriba aquí la información de carga..."
            />
          </div>
        </div>

        <div className="checkbox-row">
          <label>
            <input
              type="checkbox"
              checked={esPeligrosa}
              onChange={() => setEsPeligrosa(!esPeligrosa)}
            />
            Es carga peligrosa
          </label>

          <label>
            Ayudantes
            <input
              type="number"
              value={ayudantes}
              onChange={(e) => setAyudantes(Number(e.target.value))}
              min="0"
            />
          </label>

          <label>
            <input
              type="checkbox"
              checked={estadia}
              onChange={() => setEstadia(!estadia)}
            />
            Estadía
          </label>

          <label>
            Otros
            <input
              type="text"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
            />
          </label>
        </div>

        <div className="cost-row">
          <span>Costo base: ${costoTotal.toLocaleString()}</span>
          <span className="total-cost">Costo total: ${costoTotal.toLocaleString()}</span>
        </div>
      </div>

      <button type="submit" className='boton'>Registrar tarifa</button>
    </form>
  );
};

export default RegistroTarifas;

