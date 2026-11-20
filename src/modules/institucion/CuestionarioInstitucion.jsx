import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  PageLoader,
  ProgressBar,
  ScoreBadge
} from '../../components/ui/Ui';
import { Icon } from '../../components/ui/Icon';
import { ESCALA, calificarPromedio, metaModulo, nombreCortoModulo } from '../../models/evaluacionModel';
import { evaluacionService } from '../../services/evaluacionService';
import { mensajeDeError } from '../../api/axiosClient';
import { formatearFecha, formatearPromedio } from '../../utils/format';

const ETIQUETAS_ESCALA = Object.fromEntries(ESCALA.map((item) => [item.valor, item.etiqueta]));

export const CuestionarioInstitucion = () => {
  const { usuario } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [moduloActivo, setModuloActivo] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [respuestasGuardadas, setRespuestasGuardadas] = useState({});
  const [progreso, setProgreso] = useState({ respondidas: 0, total: 30, porcentaje: 0 });
  const [dashboard, setDashboard] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorGuardado, setErrorGuardado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const contenedorPreguntasRef = useRef(null);

  const hayCambios = useMemo(
    () =>
      Object.keys(respuestas).some(
        (id) => Number(respuestas[id]) !== Number(respuestasGuardadas[id])
      ),
    [respuestas, respuestasGuardadas]
  );

  const cargarDatos = async () => {
    setCargando(true);
    setErrorCarga('');
    try {
      const [cuestionario, panel] = await Promise.all([
        evaluacionService.obtenerCuestionario(),
        evaluacionService.obtenerDashboard()
      ]);

      const valores = {};
      cuestionario.modulos.forEach((modulo) => {
        modulo.preguntas.forEach((pregunta) => {
          if (pregunta.valor) valores[pregunta.id] = Number(pregunta.valor);
        });
      });

      setModulos(cuestionario.modulos);
      setRespuestas(valores);
      setRespuestasGuardadas({ ...valores });
      setProgreso(cuestionario.progreso);
      setDashboard(panel);
    } catch (err) {
      setErrorCarga(mensajeDeError(err, 'No fue posible cargar el cuestionario.'));
    } finally {
      setCargando(false);
    }
  };

  const cargarResultados = async () => {
    try {
      const panel = await evaluacionService.obtenerDashboard();
      setDashboard(panel);
    } catch {
      // Los resultados no bloquean el guardado del cuestionario.
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;
    const temporizador = setTimeout(() => setMensaje(''), 5000);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  useEffect(() => {
    if (!hayCambios) return undefined;
    const advertir = (evento) => {
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('beforeunload', advertir);
    return () => window.removeEventListener('beforeunload', advertir);
  }, [hayCambios]);

  const seleccionarValor = (preguntaId, valor) => {
    setRespuestas((anteriores) => ({ ...anteriores, [preguntaId]: valor }));
    setMensaje('');
    setErrorGuardado('');
  };

  const guardarTodo = async () => {
    const payload = Object.entries(respuestas)
      .filter(([, valor]) => Number(valor) >= 1 && Number(valor) <= 5)
      .map(([pregunta_id, valor]) => ({
        pregunta_id: Number(pregunta_id),
        valor: Number(valor)
      }));

    if (payload.length === 0) {
      setErrorGuardado('Responda al menos una pregunta antes de guardar.');
      return;
    }

    setGuardando(true);
    setErrorGuardado('');
    try {
      const resultado = await evaluacionService.guardarRespuestas(payload);
      setProgreso(resultado.progreso);
      setRespuestasGuardadas({ ...respuestas });
      setMensaje(
        `Se guardaron ${resultado.guardadas} respuestas. Avance actual: ${resultado.progreso.porcentaje}%.`
      );
      cargarResultados();
    } catch (err) {
      setErrorGuardado(mensajeDeError(err, 'No fue posible guardar la evaluación.'));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarModulo = (indice) => {
    setModuloActivo(indice);
    contenedorPreguntasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const promediosPorModulo = useMemo(() => {
    const mapa = {};
    (dashboard?.indicadoresModulos || []).forEach((modulo) => {
      mapa[modulo.modulo_id] = modulo;
    });
    return mapa;
  }, [dashboard]);

  const respondidasPorModulo = useMemo(() => {
    const mapa = {};
    modulos.forEach((modulo) => {
      mapa[modulo.id] = modulo.preguntas.filter((pregunta) =>
        Object.prototype.hasOwnProperty.call(respuestas, pregunta.id)
      ).length;
    });
    return mapa;
  }, [modulos, respuestas]);

  if (cargando) return <PageLoader label="Cargando cuestionario de autoevaluación…" />;

  if (errorCarga) {
    return (
      <div className="container page">
        <Alert type="error" title="No fue posible abrir la autoevaluación">
          {errorCarga}
          <div className="mt-2">
            <button type="button" className="btn btn--secondary btn--sm" onClick={cargarDatos}>
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!modulos.length) {
    return (
      <div className="container page">
        <EmptyState icon="clipboard" title="Cuestionario no disponible">
          La institución no tiene módulos o preguntas configuradas.
        </EmptyState>
      </div>
    );
  }

  const actual = modulos[moduloActivo];
  const meta = metaModulo(actual.id);
  const respondidasActual = respondidasPorModulo[actual.id] || 0;
  const totalActual = actual.preguntas.length;
  const promedioActual = promediosPorModulo[actual.id]?.promedio ?? null;
  const resumenGlobal = dashboard?.resumen;
  const calificacionGlobal = calificarPromedio(resumenGlobal?.promedio_global);
  const sinGuardar = Object.keys(respuestas).filter(
    (id) => Number(respuestas[id]) !== Number(respuestasGuardadas[id])
  ).length;

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Autoevaluación institucional</span>
          <h1>{usuario?.institucion_nombre || 'Cuestionario institucional'}</h1>
          <p>
            {usuario?.subsistema_nombre} · {usuario?.municipio}, {usuario?.estado}. Responda los seis
            ejes estratégicos con una escala de 1 a 5.
          </p>
        </div>
        <div className="page-header__meta">
          <Badge variant={progreso.porcentaje === 100 ? 'excelente' : 'proceso'} dot>
            {progreso.respondidas} de {progreso.total} reactivos
          </Badge>
          <span>Última actualización: {formatearFecha(progreso.ultima_actualizacion)}</span>
        </div>
      </div>

      {mensaje && (
        <Alert type="success" onClose={() => setMensaje('')}>
          {mensaje}
        </Alert>
      )}

      {errorGuardado && (
        <Alert type="error" title="No se pudieron guardar los cambios" onClose={() => setErrorGuardado('')}>
          {errorGuardado}
        </Alert>
      )}

      <div className="cuestionario-layout">
        <div className="cuestionario-main" ref={contenedorPreguntasRef}>
          <Card bodyClassName="card__body--flush" className="module-card">
            <div className="module-tabs" role="tablist" aria-label="Módulos de evaluación">
              {modulos.map((modulo, indice) => {
                const respondidas = respondidasPorModulo[modulo.id] || 0;
                const completo = respondidas === modulo.preguntas.length;
                return (
                  <button
                    type="button"
                    key={modulo.id}
                    role="tab"
                    aria-selected={moduloActivo === indice}
                    className={`module-tab ${moduloActivo === indice ? 'module-tab--activo' : ''}`}
                    onClick={() => cambiarModulo(indice)}
                  >
                    <span className="module-tab__num" style={{ backgroundColor: metaModulo(modulo.id).color }}>
                      {indice + 1}
                    </span>
                    <span className="module-tab__label" title={modulo.nombre}>
                      {nombreCortoModulo(modulo.id, modulo.nombre)}
                    </span>
                    <span className={`module-tab__status ${completo ? 'module-tab__status--ok' : ''}`}>
                      {completo ? <Icon name="check" size={14} /> : `${respondidas}/5`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="module-content">
              <header className="module-content__head">
                <div>
                  <span className="eyebrow">Módulo {moduloActivo + 1} de {modulos.length}</span>
                  <h2>
                    <span className="module-dot" style={{ background: meta.color }} />
                    {actual.nombre}
                  </h2>
                  <p>{actual.descripcion}</p>
                </div>
                <div className="module-content__score">
                  <span>Promedio del módulo</span>
                  <strong>{promedioActual === null ? '—' : formatearPromedio(promedioActual)}</strong>
                  <small>/ 5.00</small>
                </div>
              </header>

              <div className="module-progress">
                <ProgressBar
                  value={Math.round((respondidasActual / totalActual) * 100)}
                  label={`Avance del módulo: ${respondidasActual} de ${totalActual} preguntas`}
                />
              </div>

              <div className="questions">
                {actual.preguntas.map((pregunta) => {
                  const valorSeleccionado = respuestas[pregunta.id] ?? null;
                  return (
                    <article
                      className={`question ${valorSeleccionado ? 'question--respondida' : ''}`}
                      key={pregunta.id}
                    >
                      <div className="question__head">
                        <span className="question__num">{pregunta.numero}</span>
                        <p>{pregunta.texto}</p>
                        {valorSeleccionado && (
                          <span className="question__check" title="Pregunta respondida">
                            <Icon name="check" size={15} />
                          </span>
                        )}
                      </div>

                      <div
                        className="question__scale"
                        role="radiogroup"
                        aria-label={`Valoración de la pregunta ${pregunta.numero}`}
                      >
                        {ESCALA.map((opcion) => (
                          <button
                            type="button"
                            key={opcion.valor}
                            role="radio"
                            aria-checked={valorSeleccionado === opcion.valor}
                            aria-label={`${opcion.valor}, ${opcion.etiqueta}`}
                            title={opcion.etiqueta}
                            className={`scale-btn ${
                              valorSeleccionado === opcion.valor ? 'scale-btn--activo' : ''
                            }`}
                            onClick={() => seleccionarValor(pregunta.id, opcion.valor)}
                          >
                            {opcion.valor}
                          </button>
                        ))}
                        <span className="question__selected-label">
                          {valorSeleccionado
                            ? `${valorSeleccionado} · ${ETIQUETAS_ESCALA[valorSeleccionado]}`
                            : 'Sin respuesta'}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="module-nav">
                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={moduloActivo === 0}
                  onClick={() => cambiarModulo(moduloActivo - 1)}
                >
                  <Icon name="arrowLeft" size={17} />
                  Módulo anterior
                </button>

                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={guardarTodo}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="btn-spinner" aria-hidden="true" />
                      Guardando…
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={17} />
                      Guardar avance
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn--secondary"
                  disabled={moduloActivo === modulos.length - 1}
                  onClick={() => cambiarModulo(moduloActivo + 1)}
                >
                  Siguiente módulo
                  <Icon name="arrowRight" size={17} />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="cuestionario-side">
          <Card title="Avance de la autoevaluación" icon="clipboard" className="side-card">
            <div className="progress-hero">
              <div className="progress-hero__value">{progreso.porcentaje}%</div>
              <ProgressBar value={progreso.porcentaje} />
              <p>
                {progreso.respondidas} de {progreso.total} reactivos respondidos
              </p>
            </div>

            {hayCambios && (
              <div className="unsaved-note">
                <Icon name="alert" size={16} />
                <span>
                  {sinGuardar} respuestas en pantalla sin guardar. Use “Guardar avance”.
                </span>
              </div>
            )}

            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={guardarTodo}
              disabled={guardando}
            >
              {guardando ? 'Guardando…' : 'Guardar respuestas'}
            </button>

            <dl className="side-meta">
              <div>
                <dt>Última actualización</dt>
                <dd>{formatearFecha(progreso.ultima_actualizacion)}</dd>
              </div>
              <div>
                <dt>Índice general</dt>
                <dd>
                  {formatearPromedio(resumenGlobal?.promedio_global)} / 5.00{' '}
                  <ScoreBadge
                    valor={resumenGlobal?.promedio_global}
                    etiqueta={calificacionGlobal.etiqueta}
                  />
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Resultados por módulo" icon="chart" className="side-card">
            <div className="side-results">
              {modulos.map((modulo, indice) => {
                const promedio = promediosPorModulo[modulo.id]?.promedio ?? null;
                return (
                  <button
                    type="button"
                    key={modulo.id}
                    className="side-result"
                    onClick={() => cambiarModulo(indice)}
                  >
                    <span>{modulo.nombre}</span>
                    <strong>{promedio === null ? '—' : formatearPromedio(promedio)}</strong>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Escala de valoración" icon="info" className="side-card">
            <ol className="scale-legend">
              {ESCALA.map((opcion) => (
                <li key={opcion.valor}>
                  <span>{opcion.valor}</span>
                  {opcion.etiqueta}
                </li>
              ))}
            </ol>
            <p className="scale-legend__note">
              1 representa una condición muy deficiente y 5 una práctica consolidada u óptima.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
};
