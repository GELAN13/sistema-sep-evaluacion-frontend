import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLES_INFO, rutaInicioDeRol } from '../../models/rolesModel';
import { Icon } from '../ui/Icon';

const enlacesPorRol = {
  [ROLES.PRINCIPAL]: [
    { to: '/sep/dashboard', label: 'Indicadores globales', icon: 'chart' },
    { to: '/sep/usuarios', label: 'Usuarios', icon: 'users' }
  ],
  [ROLES.SUBSISTEMA]: [
    { to: '/subsistema/dashboard', label: 'Panel universitario', icon: 'chart' }
  ],
  [ROLES.INSTITUCION]: [
    { to: '/institucion/evaluacion', label: 'Autoevaluación', icon: 'clipboard' }
  ]
};

export const NavbarGobierno = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const infoRol = usuario ? ROLES_INFO[usuario.rol] : null;
  const enlaces = usuario ? enlacesPorRol[usuario.rol] || [] : [];
  const ambito = usuario?.institucion_nombre || usuario?.subsistema_nombre || 'Secretaría de Educación de Veracruz';

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <header className="site-header">
      <div className="gov-strip">
        <div className="container gov-strip__inner">
          <span>Gobierno del Estado de Veracruz · Secretaría de Educación de Veracruz</span>
          <span className="gov-strip__right">Sistema de Evaluación Institucional</span>
        </div>
      </div>

      <div className="container masthead">
        <Link to={usuario ? rutaInicioDeRol(usuario.rol) : '/login'} className="brand">
          <img src="/logosev.png" alt="Logo SEV Veracruz" className="brand__emblem" />
          <span className="brand__text">
            <span className="brand__eyebrow">Secretaría de Educación de Veracruz</span>
            <strong className="brand__title">Evaluación Institucional</strong>
            <span className="brand__sub">Indicadores para la mejora educativa</span>
          </span>
        </Link>

        {usuario && (
          <div className="masthead__user">
            <div className="user-chip">
              <span className="user-chip__avatar" aria-hidden="true">
                <Icon name="user" size={19} />
              </span>
              <span className="user-chip__info">
                <strong>{usuario.nombre || usuario.nombre_completo}</strong>
                <small>{ambito}</small>
              </span>
            </div>
            <button type="button" className="btn btn--ghost btn--sm logout-btn" onClick={salir}>
              <Icon name="logout" size={17} />
              <span>Salir</span>
            </button>
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuAbierto((abierto) => !abierto)}
              aria-expanded={menuAbierto}
              aria-controls="menu-principal"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              <Icon name={menuAbierto ? 'close' : 'menu'} size={22} />
            </button>
          </div>
        )}
      </div>

      {usuario && (
        <div className={`main-nav ${menuAbierto ? 'main-nav--abierto' : ''}`}>
          <div className="container main-nav__inner">
            <nav id="menu-principal" className="main-nav__links" aria-label="Menú principal">
              {enlaces.map((enlace) => (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  className={({ isActive }) => `nav-link ${isActive ? 'nav-link--activo' : ''}`}
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icon name={enlace.icon} size={17} />
                  {enlace.label}
                </NavLink>
              ))}
            </nav>
            <div className="main-nav__role">
              <span className={`role-tag role-tag--${usuario.rol.toLowerCase()}`}>
                {infoRol?.etiqueta}
              </span>
              <span className="main-nav__scope">{ambito}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
