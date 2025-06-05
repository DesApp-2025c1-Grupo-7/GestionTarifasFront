import React from 'react'
import './Header.css'
import { RxCountdownTimer } from "react-icons/rx";
import { VscNewFolder } from "react-icons/vsc";
import { TbTruckDelivery } from "react-icons/tb";
import FormAlertDialog from '../Dialog_entidades/Dialog-entidades';
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <nav>
        <h1>Logistica <strong>Acme<TbTruckDelivery /></strong></h1>
        <hr></hr>
        <ul>


            <li><Link to="/registrarTarifa" className='boton'><strong><VscNewFolder /></strong>  Registrar tarifa </Link></li>
            <li><Link to="/historicoTarifas" className='boton'><strong><RxCountdownTimer /></strong>  Historico de tarifas </Link></li>
            <li><FormAlertDialog/></li>

        </ul>
      
    </nav>
  )
}

export default Header
