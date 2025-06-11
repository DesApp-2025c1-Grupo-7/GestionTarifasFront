import { useState, useEffect } from 'react';
import './RegistroTarifas.css'

const RegistroTarifas = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargas, setCargas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [transportistas, setTransportistas] = useState([]);

  const [vehiculo, setVehiculo] = useState('');
  const [zona, setZona] = useState('');
  const [transportista, setTransportista] = useState('');
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

    alert('Tarifa registrada con éxito');

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
    <form onSubmit={handleSubmit}>
      <h2>Registrar Tarifa</h2>

      <label>Vehículo</label>
      <select value={vehiculo} onChange={e => setVehiculo(e.target.value)} required>
        <option value="">Seleccione vehículo</option>
        {vehiculos.map(v => (
          <option key={v.id} value={v.id}>{v.patente || `Vehículo ${v.id}`}</option>
        ))}
      </select>

      <label>Tipo de carga</label>
      <select value={carga} onChange={e => setCarga(e.target.value)} required>
        <option value="">Seleccione carga</option>
        {cargas.map(c => (
          <option key={c.id} value={c.id}>{c.categoria || `Carga ${c.id}`}</option>
        ))}
      </select>

      <label>Zona de viaje</label>
      <select value={zona} onChange={e => setZona(e.target.value)} required>
        <option value="">Seleccione zona</option>
        {zonas.map(z => (
          <option key={z.id} value={z.id}>{z.origen} → {z.destino}</option>
        ))}
      </select>

      <label>Transportista</label>
      <select value={transportista} onChange={e => setTransportista(e.target.value)} required>
        <option value="">Seleccione transportista</option>
        {transportistas.map(t => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      <label>Información de carga</label>
      <input
        type="text"
        value={infoCarga}
        onChange={e => setInfoCarga(e.target.value)}
      />

      <label>Ayudantes</label>
      <input
        type="number"
        min="0"
        value={ayudantes}
        onChange={e => setAyudantes(Number(e.target.value))}
      />

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

      <label>Otros</label>
      <input
        type="text"
        value={otros}
        onChange={e => setOtros(e.target.value)}
      />

      <div>
        Costo total estimado: ${costoTotal}
      </div>

      <button type="submit">Registrar tarifa</button>
    </form>
  );
};

export default RegistroTarifas;
