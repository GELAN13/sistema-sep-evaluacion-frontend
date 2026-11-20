import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Card, EmptyState, KpiCard, PageLoader } from '../../components/ui/Ui';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { mensajeDeError } from '../../api/axiosClient';
import { formatearFecha } from '../../utils/format';
import { ROLES, ROLES_INFO } from '../../models/rolesModel';

const varianteRol = {
  [ROLES.PRINCIPAL]: 'guinda',
  [ROLES.SUBSISTEMA]: 'dorado',
  [ROLES.INSTITUCION]: 'azul'
};

export const UsuariosPage = () => {
  const { usuario: sesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [usuarioAccion, setUsuarioAccion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorAccion, setErrorAccion] = useState('');

  const cargarUsuarios = async () => {
    setCargando(true);
    setError('');
    try {
      setUsuarios(await adminService.listarUsuarios());
    } catch (err) {
      setError(mensajeDeError(err, 'No fue posible obtener los usuarios.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = setTimeout(() => setMensaje(''), 5000);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return usuarios.filter((usuario) => {
      const coincideRol = !filtroRol || usuario.rol === filtroRol;
      const coincideTexto =
        !texto ||
        usuario.nombre_completo.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto) ||
        (usuario.subsistema_nombre || '').toLowerCase().includes(texto) ||
        (usuario.institucion_nombre || '').toLowerCase().includes(texto);
      return coincideRol && coincideTexto;
    });
  }, [usuarios, busqueda, filtroRol]);

  const resumen = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((usuario) => usuario.activo).length,
      subsistemas: usuarios.filter((usuario) => usuario.rol === ROLES.SUBSISTEMA).length,
      instituciones: usuarios.filter((usuario) => usuario.rol === ROLES.INSTITUCION).length
    }),
    [usuarios]
  );

  const cambiarEstado = async () => {
    if (!usuarioAccion) return;
    setProcesando(true);
    setErrorAccion('');
    const nuevoEstado = !usuarioAccion.activo;
    try {
      const resultado = await adminService.cambiarEstado(usuarioAccion.id, nuevoEstado);
      setUsuarios((anteriores) =>
        anteriores.map((usuario) =>
          usuario.id === resultado.usuario.id
            ? { ...usuario, activo: resultado.usuario.activo }
            : usuario
        )
      );
      setMensaje(resultado.mensaje);
      setUsuarioAccion(null);
    } catch (err) {
      setErrorAccion(mensajeDeError(err, 'No fue posible actualizar el usuario.'));
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) return <PageLoader label="Cargando cuentas del sistema…" />;

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Administración de accesos · SEV Veracruz</span>
          <h1>Usuarios y entidades registradas</h1>
          <p>
            Consulte las cuentas activas, su nivel de acceso y la entidad a la que están adscritas.
            Solo la Secretaría de Educación de Veracruz (SEV) puede habilitar o suspender accesos.
          </p>
        </div>
        <div className="page-header__meta">
          <Badge variant="guinda" dot>
            Control de acceso
          </Badge>
          <span>Los permisos se validan en el servidor</span>
        </div>
      </div>

      {mensaje && (
        <Alert type="success" onClose={() => setMensaje('')}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Error al cargar usuarios" onClose={() => setError('')}>
          {error}
          <div className="mt-2">
            <button type="button" className="btn btn--secondary btn--sm" onClick={cargarUsuarios}>
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
          </div>
        </Alert>
      )}

      {errorAccion && (
        <Alert type="error" title="No se pudo actualizar la cuenta" onClose={() => setErrorAccion('')}>
          {errorAccion}
        </Alert>
      )}

      <div className="kpi-grid kpi-grid--four">
        <KpiCard label="Cuentas totales" value={resumen.total} icon="users" tone="guinda" meta="Registro" />
        <KpiCard label="Cuentas activas" value={resumen.activos} icon="check" tone="verde" meta="Acceso" />
        <KpiCard label="Universitarias" value={resumen.subsistemas} icon="building" tone="dorado" meta="Subsistema" />
        <KpiCard label="Institucionales" value={resumen.instituciones} icon="book" tone="azul" meta="Institución" />
      </div>

      <Card
        title="Directorio de usuarios"
        subtitle="La desactivación bloquea el acceso de forma inmediata, incluso con un token vigente."
        icon="users"
        actions={
          <button type="button" className="btn btn--ghost btn--sm" onClick={cargarUsuarios}>
            <Icon name="refresh" size={16} />
            Actualizar
          </button>
        }
      >
        <div className="table-toolbar">
          <div className="search-box">
            <Icon name="search" size={17} />
            <input
              type="search"
              placeholder="Buscar por nombre, correo o entidad…"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              aria-label="Buscar usuarios"
            />
          </div>
          <div className="field field--inline">
            <label htmlFor="filtro-rol">Rol</label>
            <select
              id="filtro-rol"
              value={filtroRol}
              onChange={(evento) => setFiltroRol(evento.target.value)}
            >
              <option value="">Todos los roles</option>
              {Object.values(ROLES).map((rol) => (
                <option key={rol} value={rol}>
                  {ROLES_INFO[rol].titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtrados.length === 0 ? (
          <EmptyState icon="search" title="Sin coincidencias">
            Ajuste la búsqueda o el filtro de rol para encontrar la cuenta.
          </EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Adscripción</th>
                  <th>Último acceso</th>
                  <th>Estado</th>
                  <th className="table__actions">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((usuario) => {
                  const esPropiaCuenta = usuario.id === sesion?.id;
                  return (
                    <tr key={usuario.id}>
                      <td>
                        <strong>{usuario.nombre_completo}</strong>
                        <small className="table__sub">{usuario.email}</small>
                      </td>
                      <td>
                        <Badge variant={varianteRol[usuario.rol] || 'neutral'}>
                          {ROLES_INFO[usuario.rol]?.tituloCorto || usuario.rol}
                        </Badge>
                      </td>
                      <td>
                        <span>{usuario.institucion_nombre || usuario.subsistema_nombre || 'SEV Veracruz'}</span>
                        {usuario.institucion_nombre && (
                          <small className="table__sub">{usuario.subsistema_nombre}</small>
                        )}
                      </td>
                      <td>{formatearFecha(usuario.ultimo_acceso)}</td>
                      <td>
                        <Badge variant={usuario.activo ? 'excelente' : 'critico'} dot>
                          {usuario.activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="table__actions">
                        <button
                          type="button"
                          className={`btn btn--sm ${usuario.activo ? 'btn--danger-ghost' : 'btn--secondary'}`}
                          onClick={() => {
                            setUsuarioAccion(usuario);
                            setErrorAccion('');
                          }}
                          disabled={esPropiaCuenta}
                          title={
                            esPropiaCuenta
                              ? 'No puede desactivar su propia cuenta'
                              : usuario.activo
                                ? 'Desactivar acceso'
                                : 'Activar acceso'
                          }
                        >
                          {usuario.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="table-note">
          Se muestran {filtrados.length} de {usuarios.length} cuentas. Las cuentas de autoridad
          educativa solo son creadas y administradas por la Secretaría de Educación de Veracruz (SEV).
        </p>
      </Card>

      <Modal
        open={Boolean(usuarioAccion)}
        onClose={() => {
          if (!procesando) setUsuarioAccion(null);
        }}
        title={usuarioAccion?.activo ? 'Desactivar acceso' : 'Activar acceso'}
        subtitle={usuarioAccion?.email}
        footer={
          <>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setUsuarioAccion(null)}
              disabled={procesando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`btn ${usuarioAccion?.activo ? 'btn--danger' : 'btn--primary'}`}
              onClick={cambiarEstado}
              disabled={procesando}
            >
              {procesando ? 'Procesando…' : usuarioAccion?.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
            </button>
          </>
        }
      >
        <p>
          {usuarioAccion?.activo
            ? 'La cuenta perderá el acceso al sistema de inmediato. Su historial de respuestas se conservará.'
            : 'La cuenta podrá volver a iniciar sesión con sus credenciales actuales.'}
        </p>
        <p className="modal__hint">
          Usuario: <strong>{usuarioAccion?.nombre_completo}</strong>
        </p>
      </Modal>
    </div>
  );
};
