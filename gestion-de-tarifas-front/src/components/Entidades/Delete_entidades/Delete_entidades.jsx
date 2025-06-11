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
    <button onClick={handleDelete} className="boton">
      Eliminar
    </button>
  );
};


export default Delete_entidades;
