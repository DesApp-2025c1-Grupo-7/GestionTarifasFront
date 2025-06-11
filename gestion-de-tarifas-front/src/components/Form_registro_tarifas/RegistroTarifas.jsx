import { useState, useEffect } from 'react';
import './RegistroTarifas.css';
import { getTransportista, getVehiculos, getZonas, postTarifa} from '../../services/tarifaCosto.service';

const RegistroTarifas = () => {
  const [vehiculos, setVehiculos] = useState([]);
  // const [cargas, setCargas] = useState([]); no necesario por ahora
  const [zonas, setZonas] = useState([]);
  const [transportistas, setTransportistas] = useState([]);

  const [vehiculo, setVehiculo] = useState('');
  // const [carga, setCarga] = useState('');
  const [zona, setZona] = useState('');
  const [transportista, setTransportista] = useState('');
  const [adicionales, setAdicionales] = useState('');
  // const [infoCarga, setInfoCarga] = useState('');
  // const [ayudantes, setAyudantes] = useState(2);
  // const [esPeligrosa, setEsPeligrosa] = useState(false);
  // const [estadia, setEstadia] = useState(false);
  // const [otros, setOtros] = useState('');
  const [valorBase, setValorBase] = useState(1000);

  useEffect(() => {
      const fetchData = async () => {
        try {
          const [zonasData,vehiculoData,transportistaData] = await Promise.all([
            getZonas(),
            getVehiculos(),
            getTransportista()
          ]);
          setZonas(zonasData);
          setVehiculos(vehiculoData)
          setTransportistas(transportistaData)
        } catch (error) {
          console.error('Error al cargar datos del backend:', error);
        }
      };

      fetchData();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevaTarifa = {
      valorBase,
      vehiculo,
      zonaDeViaje: zona,
      transportista
    };

    try {
      await postTarifa(nuevaTarifa);
      alert('Tarifa registrada con éxito en el backend');

      // Limpiar el formulario
      setVehiculo('');
      setZona('');
      setTransportista('');
      setValorBase(1000);
    } catch (error) {
      console.error('Error al registrar la tarifa:', error);
      alert('Error al registrar tarifa. Intente nuevamente.');
    }
  };
  
// vehiculo tiene que traer y mostrar: patente- tipo de vehiculo - tipo de carga
  return (
    <div className="container">
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <h2>Registrar Tarifa</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Vehículo</label>
              <select value={vehiculo} onChange={e => setVehiculo(Number(e.target.value))} required>
                <option value="">Seleccione vehículo</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.patente} - {v.tipoVehiculo?.tipoCargas?.map(carga => carga.categoria) || `Vehículo ${v.id}`}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Zona de viaje</label>
              <select value={zona} onChange={e => setZona(Number(e.target.value))} required>
                <option value="">Seleccione zona</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>{z.origen} → {z.destino} - ${z.distancia * z.costoKilometro}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Transportista</label>
              <select value={transportista} onChange={e => setTransportista(Number(e.target.value))} required>
                <option value="">Seleccione transportista</option>
                {transportistas.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
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
          
          {/* queda pendiente funcionalidad de calculo del valorBase */}
          {/* valor base: costo de carga + costo vehiculo + costo de zona + costo transportista */}
          {/* <div className="cost-row">
            Costo total estimado: <span className="total-cost">${valorBase}</span>
          </div> */}

          <button type="submit">Registrar tarifa</button>
        </form>
      </div>
    </div>
  );
};

export default RegistroTarifas;

