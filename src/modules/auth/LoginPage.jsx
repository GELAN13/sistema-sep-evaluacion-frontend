import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Alert } from '../../components/ui/Ui';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLES_INFO, rutaInicioDeRol } from '../../models/rolesModel';
import { authService } from '../../services/authService';
import { mensajeDeError } from '../../api/axiosClient';

const CUENTAS_PRUEBA = [
  {
    rol: ROLES.PRINCIPAL,
    correo: 'admin@sev.gob.mx',
    etiqueta: 'SEV Veracruz'
  },
  {
    rol: ROLES.SUBSISTEMA,
    correo: 'rectoria@uv.mx',
    etiqueta: 'Universidad (UV)'
  },
  {
    rol: ROLES.INSTITUCION,
    correo: 'fca@uv.mx',
    etiqueta: 'Facultad (FCA)'
  }
];

export const LoginPage = () => {
  const { usuario, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rolSeleccionado, setRolSeleccionado] = useState(ROLES.PRINCIPAL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    return <Navigate to={rutaInicioDeRol(usuario.rol)} replace />;
  }

  const sesionExpirada = searchParams.get('sesion') === 'expirada';

  const usarCuenta = (cuenta) => {
    setRolSeleccionado(cuenta.rol);
    setEmail(cuenta.correo);
    setPassword('123456');
    setError('');
  };

  const handleLogin = async (evento) => {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { token, usuario: datosUsuario } = await authService.login(
        email.trim(),
        password,
        rolSeleccionado
      );
      iniciarSesion(token, datosUsuario);
      navigate(ROLES_INFO[datosUsuario.rol].rutaInicio, { replace: true });
    } catch (err) {
      setError(mensajeDeError(err, 'No fue posible iniciar sesión.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="login-grid">
        <aside className="login-hero">
          <div className="login-hero__content">
            <span className="eyebrow eyebrow--light">Gobierno del Estado de Veracruz · SEV</span>
            <h1>Evaluación para la mejora educativa de Veracruz</h1>
            <p>
              Un espacio único para que la Secretaría de Educación de Veracruz (SEV), universidades
              públicas e instituciones particulares con RVOE consulten indicadores y den seguimiento
              a los seis ejes estratégicos institucionales.
            </p>

            <ul className="login-hero__list">
              {['Gobernanza', 'Inversión', 'Deuda educativa y financiera', 'Inclusión', 'Evaluación', 'Infraestructura'].map(
                (modulo, indice) => (
                  <li key={modulo}>
                    <span>{String(indice + 1).padStart(2, '0')}</span>
                    {modulo}
                  </li>
                )
              )}
            </ul>

            <div className="login-hero__note">
              <Icon name="shield" size={18} />
              <span>Acceso seguro con autenticación JWT y control de permisos por rol.</span>
            </div>
          </div>
          <div className="login-hero__pattern" aria-hidden="true" />
        </aside>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__head">
            <span className="eyebrow">Acceso al sistema</span>
            <h2 id="login-title">Iniciar sesión</h2>
            <p>Seleccione su nivel de acceso e ingrese con sus credenciales institucionales.</p>
          </div>

          {sesionExpirada && (
            <Alert type="info">Su sesión expiró o fue cerrada. Vuelva a ingresar.</Alert>
          )}

          <div className="role-selector" role="radiogroup" aria-label="Nivel de acceso">
            {Object.values(ROLES).map((rol) => {
              const info = ROLES_INFO[rol];
              const activo = rolSeleccionado === rol;
              return (
                <button
                  type="button"
                  key={rol}
                  role="radio"
                  aria-checked={activo}
                  className={`role-card ${activo ? 'role-card--activo' : ''}`}
                  onClick={() => {
                    setRolSeleccionado(rol);
                    setError('');
                  }}
                >
                  <span className="role-card__icon">
                    <Icon name={info.icono} size={21} />
                  </span>
                  <span className="role-card__body">
                    <strong>{info.tituloCorto}</strong>
                    <small>{info.etiqueta}</small>
                  </span>
                  <span className="role-card__check" aria-hidden="true">
                    {activo && <Icon name="check" size={15} />}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="role-description">{ROLES_INFO[rolSeleccionado].descripcion}</p>

          {error && (
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin} className="form" noValidate>
            <div className="field">
              <label htmlFor="email">Correo institucional</label>
              <div className="input-icon">
                <Icon name="mail" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(evento) => setEmail(evento.target.value)}
                  placeholder="usuario@sev.gob.mx"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-icon">
                <Icon name="lock" size={18} />
                <input
                  id="password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(evento) => setPassword(evento.target.value)}
                  placeholder="Ingrese su contraseña"
                />
                <button
                  type="button"
                  className="input-icon__action"
                  onClick={() => setMostrarPassword((visible) => !visible)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn--primary btn--block" disabled={cargando}>
              {cargando ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Validando credenciales…
                </>
              ) : (
                <>
                  Ingresar como {ROLES_INFO[rolSeleccionado].tituloCorto}
                  <Icon name="arrowRight" size={18} />
                </>
              )}
            </button>
          </form>

          <details className="demo-accounts">
            <summary>
              <Icon name="info" size={16} />
              Credenciales de demostración
            </summary>
            <div className="demo-accounts__list">
              {CUENTAS_PRUEBA.map((cuenta) => (
                <div className="demo-account" key={cuenta.correo}>
                  <div>
                    <strong>{cuenta.etiqueta}</strong>
                    <code>{cuenta.correo}</code>
                  </div>
                  <button type="button" className="btn btn--link" onClick={() => usarCuenta(cuenta)}>
                    Usar cuenta
                  </button>
                </div>
              ))}
              <p className="demo-accounts__note">Contraseña para todas las cuentas: 123456</p>
            </div>
          </details>

          <div className="login-panel__footer">
            <span>¿Su entidad aún no tiene acceso?</span>
            <Link to="/registro">Registrar universidad o institución</Link>
          </div>
        </section>
      </div>
    </AuthLayout>
  );
};
