import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PageLoader } from '../components/ui/Ui';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { ROLES, rutaInicioDeRol } from '../models/rolesModel';
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';

const DashboardSep = lazy(() =>
  import('../modules/sep/DashboardSep').then((modulo) => ({ default: modulo.DashboardSep }))
);
const UsuariosPage = lazy(() =>
  import('../modules/sep/UsuariosPage').then((modulo) => ({ default: modulo.UsuariosPage }))
);
const DashboardSubsistema = lazy(() =>
  import('../modules/subsistema/DashboardSubsistema').then((modulo) => ({
    default: modulo.DashboardSubsistema
  }))
);
const CuestionarioInstitucion = lazy(() =>
  import('../modules/institucion/CuestionarioInstitucion').then((modulo) => ({
    default: modulo.CuestionarioInstitucion
  }))
);

const Inicio = () => {
  const { usuario } = useAuth();
  return <Navigate to={usuario ? rutaInicioDeRol(usuario.rol) : '/login'} replace />;
};

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader label="Cargando módulo del sistema…" />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route
          path="/sep/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <DashboardSep />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sep/usuarios"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subsistema/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUBSISTEMA]}>
              <DashboardSubsistema />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institucion/evaluacion"
          element={
            <ProtectedRoute allowedRoles={[ROLES.INSTITUCION]}>
              <CuestionarioInstitucion />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Inicio />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
