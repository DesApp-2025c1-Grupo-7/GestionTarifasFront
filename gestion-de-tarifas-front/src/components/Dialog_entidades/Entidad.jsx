import * as AlertDialog from '@radix-ui/react-alert-dialog';
const Entidad = ({entidad,handleSubmit}) => {
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
                  <input type="text" name="TipoDeCarga" required style={inputStyle} />
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
                  <label htmlFor="id_tipo_vehiculo">Tipo de vehículo (ID):</label>
                  <input type="number" name="id_tipo_vehiculo" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="id_transportista">Transportista (ID):</label>
                  <input type="number" name="id_transportista" required style={inputStyle} />
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
                  <label htmlFor="id_vehiculo">Vehículo (ID):</label>
                  <input type="number" name="id_vehiculo" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="id_zona_viaje">Zona de viaje (ID):</label>
                  <input type="number" name="id_zona_viaje" required style={inputStyle} />
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
            {entidad === "TarifaDeCosto" && (
              <form onSubmit={handleSubmit}>
                <div style={fieldStyle}>
                  <label htmlFor="id_tipo_vehiculo">Tipo de vehículo (ID):</label>
                  <input type="number" name="id_tipo_vehiculo" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="id_tipo_carga">Tipo de carga (ID):</label>
                  <input type="number" name="id_tipo_carga" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="id_zona_viaje">Zona de viaje (ID):</label>
                  <input type="number" name="id_zona_viaje" required style={inputStyle} />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="id_transportista">Transportista (ID):</label>
                  <input type="number" name="id_transportista" required style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label htmlFor="Adicional">Adicional (ID):</label>
                  <input type="number" name="Adicional" required style={inputStyle} />
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
                  <input type="number" name="id_tarifa_costo" required style={inputStyle} />
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
}

// Estilos
const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

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

 
export default Entidad;