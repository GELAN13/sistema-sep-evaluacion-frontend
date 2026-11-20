import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Alert, PageLoader } from '../../components/ui/Ui';
import { Icon } from '../../components/ui/Icon';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLES_INFO, ROLES_REGISTRABLES, rutaInicioDeRol } from '../../models/rolesModel';
import { authService } from '../../services/authService';
import { catalogosService } from '../../services/catalogosService';
import { mensajeDeError } from '../../api/axiosClient';

const FORM_INICIAL = {
  nombre_completo: '',
  email: '',
  password: '',
  confirmar: '',
  rol: ROLES.INSTITUCION,
  subsistema_id: '',
  institucion_id: ''
};

export const RegisterPage = () => {
  const { usuario } = useAuth();
  const [catalogos, setCatalogos] = useState(null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState('');
  const [form, setForm] = useState(FORM_INICIAL);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estados para búsqueda interactiva de universidad y facultad
  const [busquedaSubsistema, setBusquedaSubsistema] = useState('');
  const [listaSubsistemaAbierta, setListaSubsistemaAbierta] = useState(false);
  const [busquedaInstitucion, setBusquedaInstitucion] = useState('');
  const [listaInstitucionAbierta, setListaInstitucionAbierta] = useState(false);

  const wrapperSubRef = useRef(null);
  const wrapperInstRef = useRef(null);

  const cargarCatalogos = async () => {
    setCargandoCatalogos(true);
    setErrorCatalogos('');
    try {
      const data = await catalogosService.obtener();
      setCatalogos(data);
    } catch (err) {
      setErrorCatalogos(mensajeDeError(err, 'No fue posible cargar los catálogos institucionales de Veracruz.'));
    } finally {
      setCargandoCatalogos(false);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // Cierra desplegables al hacer clic fuera
  useEffect(() => {
    const clickFuera = (e) => {
      if (wrapperSubRef.current && !wrapperSubRef.current.contains(e.target)) {
        setListaSubsistemaAbierta(false);
      }
      if (wrapperInstRef.current && !wrapperInstRef.current.contains(e.target)) {
        setListaInstitucionAbierta(false);
      }
    };
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const subsistemasFiltrados = useMemo(() => {
    if (!catalogos?.subsistemas) return [];
    const q = busquedaSubsistema.trim().toLowerCase();
    if (!q) return catalogos.subsistemas;
    return catalogos.subsistemas.filter((sub) =>
      sub.nombre.toLowerCase().includes(q) ||
      (sub.region && sub.region.toLowerCase().includes(q)) ||
      (sub.control_detalle && sub.control_detalle.toLowerCase().includes(q)) ||
      (sub.clave_oficial && sub.clave_oficial.toLowerCase().includes(q))
    );
  }, [catalogos, busquedaSubsistema]);

  const institucionesDelSubsistema = useMemo(() => {
    if (!catalogos || !form.subsistema_id) return [];
    return catalogos.instituciones.filter(
      (inst) => String(inst.subsistema_id) === String(form.subsistema_id)
    );
  }, [catalogos, form.subsistema_id]);

  const institucionesFiltradas = useMemo(() => {
    const q = busquedaInstitucion.trim().toLowerCase();
    if (!q) return institucionesDelSubsistema;
    return institucionesDelSubsistema.filter((inst) =>
      inst.nombre.toLowerCase().includes(q) ||
      (inst.municipio && inst.municipio.toLowerCase().includes(q)) ||
      (inst.clave_cct && inst.clave_cct.toLowerCase().includes(q))
    );
  }, [institucionesDelSubsistema, busquedaInstitucion]);

  const subsistemaSeleccionado = useMemo(() => {
    if (!catalogos?.subsistemas || !form.subsistema_id) return null;
    return catalogos.subsistemas.find((s) => String(s.id) === String(form.subsistema_id)) || null;
  }, [catalogos, form.subsistema_id]);

  const institucionSeleccionada = useMemo(() => {
    if (!catalogos?.instituciones || !form.institucion_id) return null;
    return catalogos.instituciones.find((i) => String(i.id) === String(form.institucion_id)) || null;
  }, [catalogos, form.institucion_id]);

  if (usuario) {
    return <Navigate to={rutaInicioDeRol(usuario.rol)} replace />;
  }

  const actualizar = (campo, valor) => {
    setForm((anterior) => {
      const siguiente = { ...anterior, [campo]: valor };
      if (campo === 'rol') {
        siguiente.subsistema_id = '';
        siguiente.institucion_id = '';
        setBusquedaSubsistema('');
        setBusquedaInstitucion('');
      }
      if (campo === 'subsistema_id') {
        siguiente.institucion_id = '';
        setBusquedaInstitucion('');
      }
      return siguiente;
    });
    setError('');
  };

  const seleccionarSubsistema = (sub) => {
    actualizar('subsistema_id', sub.id);
    setListaSubsistemaAbierta(false);
    setBusquedaSubsistema('');
  };

  const seleccionarInstitucion = (inst) => {
    actualizar('institucion_id', inst.id);
    setListaInstitucionAbierta(false);
    setBusquedaInstitucion('');
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');

    if (!form.subsistema_id) {
      setError('Debe buscar y seleccionar la universidad o subsistema educativo.');
      return;
    }

    if (form.rol === ROLES.INSTITUCION && !form.institucion_id) {
      setError('Debe buscar y seleccionar la facultad o plantel correspondiente.');
      return;
    }

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden. Verifique ambos campos.');
      return;
    }

    setCargando(true);
    try {
      const resultado = await authService.registrar({
        nombre_completo: form.nombre_completo.trim(),
        email: form.email.trim(),
        password: form.password,
        rol: form.rol,
        subsistema_id: form.subsistema_id ? Number(form.subsistema_id) : null,
        institucion_id: form.institucion_id ? Number(form.institucion_id) : null
      });
      setRegistroExitoso(resultado.usuario);
    } catch (err) {
      setError(mensajeDeError(err, 'No fue posible completar el registro.'));
    } finally {
      setCargando(false);
    }
  };

  if (registroExitoso) {
    return (
      <AuthLayout>
        <div className="register-wrap">
          <div className="card register-success">
            <span className="register-success__icon">
              <Icon name="check" size={32} />
            </span>
            <span className="eyebrow">Registro completado</span>
            <h1>Acceso institucional registrado</h1>
            <p>
              Se creó con éxito la cuenta <strong>{registroExitoso.email}</strong> asignada con el rol{' '}
              <strong>{ROLES_INFO[registroExitoso.rol]?.titulo}</strong>. Ya puede iniciar sesión con
              sus credenciales en la plataforma del Estado de Veracruz.
            </p>
            <div className="register-success__actions">
              <Link to="/login" className="btn btn--primary">
                Ir al inicio de sesión
                <Icon name="arrowRight" size={18} />
              </Link>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setRegistroExitoso(null);
                  setForm(FORM_INICIAL);
                  setBusquedaSubsistema('');
                  setBusquedaInstitucion('');
                }}
              >
                Registrar otra entidad
              </button>
            </div>
            <p className="register-success__note">
              La Secretaría de Educación de Veracruz (SEV) valida las entidades públicas y privadas con
              RVOE para la emisión de indicadores oficiales.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="register-grid">
        {/* Panel lateral institucional SEV Veracruz */}
        <aside className="register-hero">
          <div className="register-hero__content">
            <span className="eyebrow eyebrow--light">Gobierno del Estado de Veracruz · SEV</span>
            <h1>Registro de entidad educativa</h1>
            <p>
              Incorpore a su universidad, facultad o plantel al Sistema de Evaluación Institucional
              del Estado de Veracruz para dar seguimiento a los seis ejes estratégicos.
            </p>

            <ul className="register-hero__list">
              <li>
                <span>01</span>
                Instituciones Públicas (Federales y Estatales)
              </li>
              <li>
                <span>02</span>
                Universidades Privadas con RVOE (SEV / SEP)
              </li>
              <li>
                <span>03</span>
                Autoevaluación en seis ejes prioritarios
              </li>
              <li>
                <span>04</span>
                Acreditación y transparencia en Veracruz
              </li>
            </ul>

            <div className="register-hero__note">
              <Icon name="shield" size={18} />
              <span>
                Registro oficial supervisado por la Secretaría de Educación de Veracruz.
              </span>
            </div>
          </div>
          <div className="register-hero__pattern" aria-hidden="true" />
        </aside>

        {/* Panel del formulario de registro */}
        <section className="register-panel" aria-labelledby="register-title">
          <div className="register-panel__head">
            <span className="eyebrow">Acceso institucional · Veracruz</span>
            <h2 id="register-title">Crear cuenta de acceso</h2>
            <p>Busque su institución educativa e ingrese los datos del responsable.</p>
          </div>

          {cargandoCatalogos && <PageLoader label="Cargando instituciones del Estado de Veracruz…" />}

          {errorCatalogos && (
            <Alert type="error" title="No se pudieron cargar los catálogos">
              {errorCatalogos}
              <div className="mt-2">
                <button type="button" className="btn btn--secondary btn--sm" onClick={cargarCatalogos}>
                  <Icon name="refresh" size={16} />
                  Reintentar
                </button>
              </div>
            </Alert>
          )}

          {!cargandoCatalogos && !errorCatalogos && catalogos && (
            <form className="form register-form" onSubmit={handleSubmit} noValidate>
              {/* Paso 1: Nivel de acceso */}
              <div className="form-section">
                <label className="section-label">1. Nivel de acceso institucional</label>
                <div className="role-selector role-selector--two" role="radiogroup" aria-label="Nivel de acceso">
                  {ROLES_REGISTRABLES.map((rol) => {
                    const info = ROLES_INFO[rol];
                    const activo = form.rol === rol;
                    return (
                      <button
                        type="button"
                        key={rol}
                        role="radio"
                        aria-checked={activo}
                        className={`role-card ${activo ? 'role-card--activo' : ''}`}
                        onClick={() => actualizar('rol', rol)}
                      >
                        <span className="role-card__icon">
                          <Icon name={info.icono} size={20} />
                        </span>
                        <span className="role-card__body">
                          <strong>{info.tituloCorto}</strong>
                          <small>{info.descripcion}</small>
                        </span>
                        <span className="role-card__check" aria-hidden="true">
                          {activo && <Icon name="check" size={15} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paso 2: Buscador de Universidad / Subsistema */}
              <div className="form-section">
                <label className="section-label">2. Universidad o Subsistema educativo</label>
                <div className="field" ref={wrapperSubRef}>
                  <span className="field__hint" style={{ marginBottom: '6px' }}>
                    Escriba para buscar o elija de la lista de universidades de Veracruz:
                  </span>

                  {subsistemaSeleccionado ? (
                    <div className="searchable-picker__selected">
                      <div className="searchable-picker__selected-info">
                        <span className="picker-tag">
                          {subsistemaSeleccionado.control_detalle || 'Pública Estatal'}
                        </span>
                        <strong>{subsistemaSeleccionado.nombre}</strong>
                        <small>
                          Clave: {subsistemaSeleccionado.clave_oficial} · Región {subsistemaSeleccionado.region}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => {
                          actualizar('subsistema_id', '');
                          setBusquedaSubsistema('');
                          setListaSubsistemaAbierta(true);
                        }}
                      >
                        <Icon name="refresh" size={14} />
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="searchable-picker">
                      <div className="searchable-picker__input-wrap">
                        <span className="searchable-picker__icon">
                          <Icon name="search" size={17} />
                        </span>
                        <input
                          id="buscar-subsistema"
                          type="search"
                          className="searchable-picker__input"
                          placeholder="Buscar por nombre (ej. UV, Xalapa, UCC, Anáhuac, ITSX)..."
                          value={busquedaSubsistema}
                          onChange={(e) => {
                            setBusquedaSubsistema(e.target.value);
                            setListaSubsistemaAbierta(true);
                          }}
                          onFocus={() => setListaSubsistemaAbierta(true)}
                          autoComplete="off"
                        />
                        {busquedaSubsistema && (
                          <button
                            type="button"
                            className="searchable-picker__clear"
                            onClick={() => setBusquedaSubsistema('')}
                            aria-label="Limpiar búsqueda"
                          >
                            <Icon name="close" size={14} />
                          </button>
                        )}
                      </div>

                      {listaSubsistemaAbierta && (
                        <div className="searchable-picker__dropdown">
                          <div className="searchable-picker__dropdown-header">
                            <span>Universidades disponibles en Veracruz ({subsistemasFiltrados.length})</span>
                          </div>
                          {subsistemasFiltrados.length > 0 ? (
                            <ul className="searchable-picker__list">
                              {subsistemasFiltrados.map((sub) => (
                                <li key={sub.id}>
                                  <button
                                    type="button"
                                    className="searchable-picker__item"
                                    onClick={() => seleccionarSubsistema(sub)}
                                  >
                                    <div className="searchable-picker__item-header">
                                      <strong>{sub.nombre}</strong>
                                      <span className={`pill-badge pill-badge--${sub.tipo_control === 'PRIVADA' ? 'privada' : 'publica'}`}>
                                        {sub.control_detalle || 'Pública'}
                                      </span>
                                    </div>
                                    <span className="searchable-picker__item-sub">
                                      Clave: {sub.clave_oficial} · Región {sub.region}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="searchable-picker__empty">
                              No se encontraron universidades con &quot;{busquedaSubsistema}&quot;. Pruebe con otro término.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Paso 2.b: Buscador de Facultad / Plantel (si el rol es INSTITUCION) */}
                {form.rol === ROLES.INSTITUCION && (
                  <div className="field mt-3" ref={wrapperInstRef}>
                    <label htmlFor="buscar-institucion">Facultad, Plantel o División</label>

                    {!form.subsistema_id ? (
                      <div className="searchable-picker__disabled-msg">
                        <Icon name="shield" size={17} />
                        <span>Primero busque y seleccione una universidad arriba para ver sus facultades o planteles.</span>
                      </div>
                    ) : institucionSeleccionada ? (
                      <div className="searchable-picker__selected">
                        <div className="searchable-picker__selected-info">
                          <span className="picker-tag picker-tag--fac">Facultad / Plantel</span>
                          <strong>{institucionSeleccionada.nombre}</strong>
                          <small>
                            CCT: {institucionSeleccionada.clave_cct} · Municipio: {institucionSeleccionada.municipio}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => {
                            actualizar('institucion_id', '');
                            setBusquedaInstitucion('');
                            setListaInstitucionAbierta(true);
                          }}
                        >
                          <Icon name="refresh" size={14} />
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="searchable-picker">
                        <div className="searchable-picker__input-wrap">
                          <span className="searchable-picker__icon">
                            <Icon name="search" size={17} />
                          </span>
                          <input
                            id="buscar-institucion"
                            type="search"
                            className="searchable-picker__input"
                            placeholder="Buscar facultad o plantel (ej. Contaduría, Ingeniería, Sistemas)..."
                            value={busquedaInstitucion}
                            onChange={(e) => {
                              setBusquedaInstitucion(e.target.value);
                              setListaInstitucionAbierta(true);
                            }}
                            onFocus={() => setListaInstitucionAbierta(true)}
                            autoComplete="off"
                          />
                          {busquedaInstitucion && (
                            <button
                              type="button"
                              className="searchable-picker__clear"
                              onClick={() => setBusquedaInstitucion('')}
                              aria-label="Limpiar búsqueda"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          )}
                        </div>

                        {listaInstitucionAbierta && (
                          <div className="searchable-picker__dropdown">
                            <div className="searchable-picker__dropdown-header">
                              <span>Planteles de {subsistemaSeleccionado?.nombre} ({institucionesFiltradas.length})</span>
                            </div>
                            {institucionesFiltradas.length > 0 ? (
                              <ul className="searchable-picker__list">
                                {institucionesFiltradas.map((inst) => (
                                  <li key={inst.id}>
                                    <button
                                      type="button"
                                      className="searchable-picker__item"
                                      onClick={() => seleccionarInstitucion(inst)}
                                    >
                                      <div className="searchable-picker__item-header">
                                        <strong>{inst.nombre}</strong>
                                        <span className="pill-badge pill-badge--neutral">
                                          {inst.municipio}
                                        </span>
                                      </div>
                                      <span className="searchable-picker__item-sub">
                                        CCT: {inst.clave_cct} · {subsistemaSeleccionado?.nombre}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="searchable-picker__empty">
                                No se encontraron facultades con &quot;{busquedaInstitucion}&quot;.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Paso 3: Datos del responsable institucional */}
              <div className="form-section">
                <label className="section-label">3. Datos del responsable y credenciales</label>

                <div className="field">
                  <label htmlFor="nombre_completo">Nombre del responsable o titular</label>
                  <input
                    id="nombre_completo"
                    type="text"
                    required
                    minLength={3}
                    maxLength={150}
                    autoComplete="name"
                    value={form.nombre_completo}
                    onChange={(e) => actualizar('nombre_completo', e.target.value)}
                    placeholder="Ej. Dr. Roberto Hernández - Dirección de Facultad"
                  />
                </div>

                <div className="field">
                  <label htmlFor="email_registro">Correo electrónico institucional</label>
                  <input
                    id="email_registro"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => actualizar('email', e.target.value)}
                    placeholder="responsable@universidad.edu.mx"
                  />
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="password_registro">Contraseña</label>
                    <div className="password-input-wrap">
                      <input
                        id="password_registro"
                        type={mostrarPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => actualizar('password', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setMostrarPassword((v) => !v)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        <Icon name={mostrarPassword ? 'close' : 'user'} size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="confirmar">Confirmar contraseña</label>
                    <input
                      id="confirmar"
                      type={mostrarPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                      value={form.confirmar}
                      onChange={(e) => actualizar('confirmar', e.target.value)}
                      placeholder="Repita la contraseña"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert type="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn--primary" disabled={cargando}>
                  {cargando ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true" />
                      Registrando en la SEV…
                    </>
                  ) : (
                    <>
                      Completar registro
                      <Icon name="arrowRight" size={18} />
                    </>
                  )}
                </button>
                <Link to="/login" className="btn btn--ghost">
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </section>
      </div>
    </AuthLayout>
  );
};
