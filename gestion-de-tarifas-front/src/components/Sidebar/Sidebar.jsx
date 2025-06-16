import './Sidebar.css'
import { SidebarData } from './SidebarData'
import { useNavigate, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className='Sidebar'>
      <div className="logo">
        <span className="logo-text">Logistica <strong>ACME</strong></span>
      </div>
      <ul className="sidebar-menu">
        {SidebarData.map((section, index) => {
          const isParentActive = section.subRoutes.some(sub => location.pathname === sub.link)

          return (
            <li key={index} className='sidebar-item'>
              <div className={`parent ${isParentActive ? 'active' : ''}`}>
                <div className="icon">{section.icon}</div>
                <span className="title">{section.title}</span>
              </div>

              <ul className="sub-menu">
                {section.subRoutes.map((sub, subIndex) => {
                  const isActive = location.pathname === sub.link
                  return (
                    <li
                      key={subIndex}
                      className={`sub-item ${isActive ? 'active' : ''}`}
                      onClick={() => navigate(sub.link)}
                    >
                      <div className="icon">{sub.icon}</div>
                      <span className="title">{sub.title}</span>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Sidebar


