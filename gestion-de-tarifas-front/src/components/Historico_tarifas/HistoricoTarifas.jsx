import { useEffect, useState } from 'react';
import './HistoricoTarifas.css'; 
import { getTarifas} from '../../services/tarifaCosto.service';



const HistoricoTarifas = () => {
  const [historial, setHistorial] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [tarifaEditada, setTarifaEditada] = useState({});

  useEffect(() => {
    getTarifas()
      .then(res => setHistorial(res.data))
      .catch(err => console.error(err));
  }, []);


  const eliminarTarifa = (index) => {
    const nuevoHistorial = [...historial];
    nuevoHistorial.splice(index, 1);
    setHistorial(nuevoHistorial);
    localStorage.setItem('tarifas', JSON.stringify(nuevoHistorial));
  };

  const activarEdicion = (index) => {
    setEditIndex(index);
    setTarifaEditada({ ...historial[index] });
  };

  const cancelarEdicion = () => {
    setEditIndex(null);
    setTarifaEditada({});
  };

  const guardarEdicion = () => {
    const nuevoHistorial = [...historial];
    nuevoHistorial[editIndex] = { ...tarifaEditada };
    setHistorial(nuevoHistorial);
    localStorage.setItem('tarifas', JSON.stringify(nuevoHistorial));
    setEditIndex(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTarifaEditada((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="container">
      <h2>Historial de Tarifas</h2>

      {historial.length === 0 ? (
        <p>No hay tarifas registradas.</p>
      ) : (
        <ul>
         <div className="container-cards">
          {historial.map((tarifa, index) => ( 
            <li key={index} className="historial-item">
            
              {editIndex === index ? (
                <>
                  <p>
                    <strong>Transportista:</strong>
                    <input
                      type="text"
                      name="transportista"
                      value={tarifaEditada.transportista}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Ayudantes:</strong>
                    <input
                      type="number"
                      name="ayudantes"
                      value={tarifaEditada.ayudantes}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Estadía:</strong>
                    <input
                      type="checkbox"
                      name="estadia"
                      checked={tarifaEditada.estadia}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Carga peligrosa:</strong>
                    <input
                      type="checkbox"
                      name="esPeligrosa"
                      checked={tarifaEditada.esPeligrosa}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Otros:</strong>
                    <input
                      type="text"
                      name="otros"
                      value={tarifaEditada.otros}
                      onChange={handleChange}
                    />
                  </p>
                  <p>
                    <strong>Costo total:</strong>
                    <input
                      type="number"
                      name="costoTotal"
                      value={tarifaEditada.costoTotal}
                      onChange={handleChange}
                    />
                  </p>
                  <button onClick={guardarEdicion}>Guardar</button>
                  <button onClick={cancelarEdicion}>Cancelar</button>
                </>
              ) : (
                  <>
                  
                    <p><strong>Fecha:</strong> {tarifa.fecha || new Date().toLocaleDateString() }</p>
                    <p><strong>Transportista:</strong> {tarifa.transportista?.nombre}</p>
                    <p> <strong>Vehículo:</strong> {tarifa.vehiculo?.patente} - {tarifa.vehiculo?.tipoVehiculo?.descripcion} </p>
                    <p><strong>Origen:</strong> {tarifa.zonaDeViaje?.origen}</p>
                    <p><strong>Destino:</strong> {tarifa.zonaDeViaje?.destino}</p>
                    <p><strong>Distancia:</strong> {tarifa.zonaDeViaje?.distancia} km</p>
                    <p><strong>Costo/km:</strong> ${tarifa.zonaDeViaje?.costoKilometro}</p>
                    <p>
                      <strong>Costo base:</strong> ${tarifa.valor_base + tarifa.transportista?.costoServicio + tarifa.vehiculo?.precioBase + (tarifa.zonaDeViaje?.distancia * tarifa.zonaDeViaje?.costoKilometro)}
                    </p>
          
                  </>
              )}
              <hr />
            </li>
          ))}
          </div>
        </ul>
      )}
    </div>
  );
};

export default HistoricoTarifas;
