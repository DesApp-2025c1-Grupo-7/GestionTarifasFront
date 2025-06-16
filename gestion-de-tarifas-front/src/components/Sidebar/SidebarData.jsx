import { FiFolderPlus } from "react-icons/fi";
import { TiArchive } from "react-icons/ti";
import { FaBuilding } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

export const SidebarData = [
  {
    title: "Tarifa de costo",
    icon: <FiFolderPlus />,
    subRoutes: [
      {
        title: "Alta de tarifa",
        icon: <FiChevronRight />,
        link: "/registrarTarifa"
      },
      {
        title: "Baja de tarifa",
        icon: <FiChevronRight />,
        link: "/"
      },
      {
        title: "Modificación de tarifa",
        icon: <FiChevronRight />,
        link: "/"
      }
    ]
  },
  {
    title: "Historial",
    icon: <TiArchive />,
    subRoutes: [
      {
        title: "Historial de tarifas",
        icon: <FiChevronRight />,
        link: "/historicoTarifas"
      }
    ]
  },
  {
    title: "Entidades",
    icon: <FaBuilding />,
    subRoutes: [
      {
        title: "Vehículo",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
      {
        title: "Zona de viaje",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
      {
        title: "Tipo de carga",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
      {
        title: "Tipo de vehiculo",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
      {
        title: "Transportista",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
      {
        title: "Adicional",
        icon: <FiChevronRight />,
        link: "/entidades"
      },
    ]
  }
];


