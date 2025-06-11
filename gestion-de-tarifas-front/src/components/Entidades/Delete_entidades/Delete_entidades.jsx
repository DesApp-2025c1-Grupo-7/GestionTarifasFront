const Delete_entidades = ({ entidad, id }) => {
  const handleDelete = () => {
    const entidades = JSON.parse(localStorage.getItem("entidades") || "[]");
    const nuevasEntidades = entidades.filter(
      (e) => !(e.tipo === entidad && e.datos.id === id)
    );

    localStorage.setItem("entidades", JSON.stringify(nuevasEntidades));
    alert(`Entidad de tipo ${entidad} con ID ${id} eliminada`);
    window.dispatchEvent(new Event("entidades_actualizadas"));
  };

  return (
    <button onClick={handleDelete} style={botonStyle}>
      X
    </button>
  );
};

const botonStyle = {
  backgroundColor: "red",
  color: "white",
  padding: "10px 20px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "10px",
};


export default Delete_entidades;
