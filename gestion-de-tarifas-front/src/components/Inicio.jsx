import React from "react";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">MiApp</div>
        <ul className="nav-links">
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Servicios</a></li>
          <li><a href="#">Contacto</a></li>
        </ul>
      </nav>
      
      <main className="main-content">
        <h1>Bienvenido a MiApp</h1>
        <p>Una aplicación moderna creada con React y CSS puro.</p>
      </main>
    </div>
  );
}

export default App;
