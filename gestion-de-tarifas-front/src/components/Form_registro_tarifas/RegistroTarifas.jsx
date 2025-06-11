import './RegistroTarifas.css';
import { useState } from 'react';

const RegistroTarifas = () => {
  const [vehiculo, setVehiculo] = useState('');
  const [carga, setCarga] = useState('');
  const [zona, setZona] = useState('');
  const [transportista, setTransportista] = useState('');
  const [adicionales, setAdicionales] = useState('');
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
      adicionales,
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
    setAdicionales('');
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
              <option value="camion1">patente- tipo de vehiculo - tipo de carga</option>
              <option value="camion2">patente- tipo de vehiculo - tipo de carga</option>
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

          <div className="form-group">
            <label>Adicionales</label>
            <select value={adicionales} onChange={(e) => setAdicionales(e.target.value)}>
              <option value="">Seleccione un adicional</option>
              <option value="litoral">Carga peligrosa</option>
              <option value="rapidos">Ayudantes</option>
              <option value="pr">estadia</option>
            </select>
          </div>
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

