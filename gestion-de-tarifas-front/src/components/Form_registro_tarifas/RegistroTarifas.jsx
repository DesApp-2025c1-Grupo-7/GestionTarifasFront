import { useState, useEffect } from 'react';
import './RegistroTarifas.css';

const RegistroTarifas = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [transportistas, setTransportistas] = useState([]);

  const [vehiculo, setVehiculo] = useState('');
  const [carga, setCarga] = useState('');
  const [zona, setZona] = useState('');
  const [transportista, setTransportista] = useState('');
  const [adicionales, setAdicionales] = useState('');
  const [ayudantes, setAyudantes] = useState(2);
  const [esPeligrosa, setEsPeligrosa] = useState(false);
  const [estadia, setEstadia] = useState(false);
  const [otros, setOtros] = useState('');
  const [costoTotal, setCostoTotal] = useState(1000);

  useEffect(() => {
    setVehiculos(JSON.parse(localStorage.getItem('Vehiculo')) || []);
    setCargas(JSON.parse(localStorage.getItem('TipoDeCarga')) || []);
    setZonas(JSON.parse(localStorage.getItem('ZonaDeViaje')) || []);
    setTransportistas(JSON.parse(localStorage.getItem('Transportista')) || []);
  }, []);

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

    alert('Tarifa registrada con éxito');

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
    <div className="container">
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <h2>Registrar Tarifa</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Vehículo</label>
              <select value={vehiculo} onChange={e => setVehiculo(e.target.value)} required>
                <option value="">Seleccione vehículo</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.patente || `Vehículo ${v.id}`}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de carga</label>
              <select value={carga} onChange={e => setCarga(e.target.value)} required>
                <option value="">Seleccione carga</option>
                {cargas.map(c => (
                  <option key={c.id} value={c.id}>{c.categoria || `Carga ${c.id}`}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Zona de viaje</label>
              <select value={zona} onChange={e => setZona(e.target.value)} required>
                <option value="">Seleccione zona</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>{z.origen} → {z.destino}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Transportista</label>
              <select value={transportista} onChange={e => setTransportista(e.target.value)} required>
                <option value="">Seleccione transportista</option>
                {transportistas.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Información de carga</label>
              <input
                type="text"
                value={infoCarga}
                onChange={e => setInfoCarga(e.target.value)}
                placeholder="Detalles adicionales"
              />
            </div>

            <div className="form-group">
              <label>Ayudantes</label>
              <input
                type="number"
                min="0"
                value={ayudantes}
                onChange={e => setAyudantes(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Otros</label>
              <input
                type="text"
                value={otros}
                onChange={e => setOtros(e.target.value)}
                placeholder="Costo adicional, comentarios..."
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
              <input
                type="checkbox"
                checked={estadia}
                onChange={() => setEstadia(!estadia)}
              />
              Estadía
            </label>
          </div>

          <div className="cost-row">
            Costo total estimado: <span className="total-cost">${costoTotal}</span>
          </div>

          <button type="submit">Registrar tarifa</button>
        </form>
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
    </div>
  );
};

export default RegistroTarifas;

