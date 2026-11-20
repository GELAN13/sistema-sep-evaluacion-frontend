import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rutaInicioDeRol } from '../models/rolesModel';

/**
 * Guardia de rutas: exige sesión y, opcionalmente, uno o varios roles.
 * Si el usuario intenta abrir la ventana de otro rol se le devuelve a su
 * panel correspondiente.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to={rutaInicioDeRol(usuario.rol)} replace />;
  }

  return children;
};
