import * as AlertDialog from '@radix-ui/react-alert-dialog';

const Entidad_form = ({ entidad, handleSubmit }) => {
  const entidades = JSON.parse(localStorage.getItem("entidades") || "[]");

  const tipoDeCargaArray = entidades.filter((e) => e.tipo === "TipoDeCarga");
  const zonaDeViajeArray = entidades.filter((e) => e.tipo === "ZonaDeViaje");
  const tipoDeVehiculoArray = entidades.filter((e) => e.tipo === "TipoDeVehiculo");
  const transportistaArray = entidades.filter((e) => e.tipo === "Transportista");
  const vehiculoArray = entidades.filter((e) => e.tipo === "Vehiculo");
  const adicional = entidades.filter((e) => e.tipo === "Adicional");

  const getNombreLegible = (entidad) => {
    const { tipo, datos, id } = entidad;
    switch (tipo) {
      case "TipoDeCarga":
        return `Tipo de carga [ID: ${datos.id}]`;
      case "ZonaDeViaje":
        return `Zona de viaje [ID: ${datos.id}]`;
      case "TipoDeVehiculo":
        return `Tipo de vehiculo[ID: ${datos.id}]`;
      case "Vehiculo":
        return `Vehiculo [ID: ${datos.id}]`;
      case "Transportista":
        return `Transportista [ID: ${datos.id}]`;
      case "Adicional":
        return `Adicional [ID: ${datos.id}]`;
      default:
        return `Entidad sin nombre [ID: ${id}]`;
    }
  };

  return (
    <>
      {entidad === "TipoDeCarga" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="categoria">Categoría:</label>
            <input type="text" name="categoria" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="requisitos_especiales">Requisitos Especiales:</label>
            <input type="text" name="requisitos_especiales" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="peso_total">Peso Total:</label>
            <input type="number" step="any" name="peso_total" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="volumen_total">Volumen Total:</label>
            <input type="number" step="any" name="volumen_total" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="valor_base">Valor Base:</label>
            <input type="number" step="any" name="valor_base" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="es_peligrosa">¿Es peligrosa?</label>
            <input type="checkbox" name="es_peligrosa" style={{ marginLeft: "10px" }} />
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}

      {entidad === "ZonaDeViaje" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="origen">Origen:</label>
            <input type="text" name="origen" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="destino">Destino:</label>
            <input type="text" name="destino" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="distancia">Distancia (km):</label>
            <input type="number" step="any" name="distancia" required style={inputStyle} />
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}

      {entidad === "TipoDeVehiculo" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="descripcion">Descripción:</label>
            <input type="text" name="descripcion" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="TipoDeCarga">Tipo de carga (ID):</label>
            <select name="id_tipo_carga" required style={inputStyle}>
              {tipoDeCargaArray.map((tipoDeCarga) => (
                <option key={tipoDeCarga.id} value={tipoDeCarga.id}>
                  {getNombreLegible(tipoDeCarga)}
                </option>
              ))}
            </select>
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}

      {entidad === "Vehiculo" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="patente">Patente:</label>
            <input type="text" name="patente" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="precio_base">Precio base:</label>
            <input type="number" step="any" name="precio_base" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="id_tipo_vehiculo">Tipo de vehículo:</label>
            <select name="id_tipo_vehiculo" style={inputStyle}>
              {tipoDeVehiculoArray.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {getNombreLegible(tipo)}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="id_transportista">Transportista:</label>
            <select name="id_transportista" style={inputStyle}>
              <option>Ninguno</option>
              {transportistaArray.map((t) => (
                <option key={t.id} value={t.id}>
                  {getNombreLegible(t)}
                </option>
              ))}
            </select>
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}

      {entidad === "Transportista" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="nombre">Nombre:</label>
            <input type="text" name="nombre" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="id_vehiculo">Vehículo:</label>
            <select name="id_vehiculo" style={inputStyle}>
              <option>Ninguno</option>
              {vehiculoArray.map((v) => (
                <option key={v.id} value={v.id}>
                  {getNombreLegible(v)}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="id_zona_viaje">Zona de viaje:</label>
            <select name="id_zona_viaje" style={inputStyle}>
              {zonaDeViajeArray.map((z) => (
                <option key={z.id} value={z.id}>
                  {getNombreLegible(z)}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="costo_servicio">Costo de servicio:</label>
            <input type="number" step="any" name="costo_servicio" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="contacto">Contacto:</label>
            <input type="text" name="contacto" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="telefono">Teléfono:</label>
            <input type="text" name="telefono" required style={inputStyle} />
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}

      {entidad === "Adicional" && (
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label htmlFor="descripcion">Descripción:</label>
            <input type="text" name="descripcion" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="costo_default">Costo default:</label>
            <input type="number" step="any" name="costo_default" required style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="id_tarifa_costo">ID Tarifa Costo:</label>
            <select name="id_tarifa_costo" style={inputStyle}>
              <option>Ninguno</option>
              {adicional.map((a) => (
                <option key={a.id} value={a.id}>
                  {getNombreLegible(a)}
                </option>
              ))}
            </select>
          </div>
          <div style={fieldStyle}>
            <label htmlFor="es_obligatorio">¿Es obligatorio?</label>
            <input type="checkbox" name="es_obligatorio" style={inputStyle} />
          </div>
          <div style={buttonGroupStyle}>
            <AlertDialog.Cancel asChild>
              <button type="button" style={cancelButtonStyle}>Cancelar</button>
            </AlertDialog.Cancel>
            <button type="submit" style={submitButtonStyle}>Crear</button>
          </div>
        </form>
      )}
    </>
  );
};

// Estilos
const fieldStyle = {
  marginBottom: '10px',
  display: 'flex',
  flexDirection: 'column',
};

const inputStyle = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonGroupStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '15px',
};

const cancelButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const submitButtonStyle = {
  padding: '8px 14px',
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Entidad_form;
