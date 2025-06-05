import React from 'react'
import './Header.css'
import { RxCountdownTimer } from "react-icons/rx";
import { VscNewFolder } from "react-icons/vsc";
import { TbTruckDelivery } from "react-icons/tb";
import FormAlertDialog from '../Dialog_entidades/Dialog-entidades';


const Header = () => {
  return (
    <nav>
        <h1>Logistica <strong>Acme<TbTruckDelivery /></strong></h1>
        <hr></hr>
        <ul>
           
            <li><button className='boton'><strong><VscNewFolder /></strong>  Registrar tarifa </button></li>
            <li><button className='boton'><strong><RxCountdownTimer /></strong>  Historico de tarifas </button></li>
            <li><FormAlertDialog/></li>
        </ul>
      
    </nav>
  )
}

export default Header
