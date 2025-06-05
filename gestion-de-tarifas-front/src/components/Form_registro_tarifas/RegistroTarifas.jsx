import './RegistroTarifas.css';
import { useState } from 'react';

const RegistroTarifas = () => {
  const [ayudantes, setAyudantes] = useState(2);
  const [esPeligrosa, setEsPeligrosa] = useState(false);
  const [estadia, setEstadia] = useState(false);
  const [otros, setOtros] = useState('');
  const [costoTotal, setCostoTotal] = useState(1); 
  
  const handleSubmit = (e) => {
  e.preventDefault();
  console.log({
    ayudantes,
    esPeligrosa,
    estadia,
    otros,
    costoTotal
  });
};

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="form-box">
        <div className="form-grid">
          <div className="form-group">
            <label>Vehículo</label>
            <select name="vehiculo">
              <option value="">Seleccione el vehículo</option>
            </select>
          </div>

          <div className="form-group">
            <label>Carga</label>
            <select name="carga">
              <option value="">Seleccione el tipo de carga</option>
            </select>
          </div>

          <div className="form-group">
            <label>Zona de viaje</label>
            <select name="zona">
              <option value="">Seleccione la zona de viaje</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transportista</label>
            <select name="transportista">
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
              name="infoCarga"
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
