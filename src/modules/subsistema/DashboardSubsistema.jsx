import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  KpiCard,
  PageLoader,
  ProgressBar,
  ScoreBadge
} from '../../components/ui/Ui';
import { Icon } from '../../components/ui/Icon';
import { BarrasModulos, RadarModulos } from '../../components/charts/ModuleCharts';
import { DetalleEntidadModal } from '../../components/DetalleEntidadModal';
import { catalogosService } from '../../services/catalogosService';
import { evaluacionService } from '../../services/evaluacionService';
import { mensajeDeError } from '../../api/axiosClient';
import {
  clasePromedio,
  descargarCsv,
  formatearEntero,
  formatearPromedio
} from '../../utils/format';
import { calificarPromedio } from '../../models/evaluacionModel';

export const DashboardSubsistema = () => {
  const { usuario } = useAuth();
  const [datos, setDatos] = useState(null);
  const [instituciones, setInstituciones] = useState([]);
  const [institucionFiltro, setInstitucionFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [entidadDetalle, setEntidadDetalle] = useState(null);
  const solicitudRef = useRef(0);

  const cargarDashboard = async (institucion_id = '') => {
    const numeroSolicitud = ++solicitudRef.current;
    setCargando(true);
    setError('');
    try {
      const respuesta = await evaluacionService.obtenerDashboard({ institucion_id });
      if (numeroSolicitud === solicitudRef.current) setDatos(respuesta);
    } catch (err) {
      if (numeroSolicitud === solicitudRef.current) {
        setError(mensajeDeError(err, 'No fue posible obtener los indicadores.'));
      }
    } finally {
      if (numeroSolicitud === solicitudRef.current) setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard();
    catalogosService
      .obtener()
      .then((data) => {
        setInstituciones(
          data.instituciones.filter(
            (institucion) => Number(institucion.subsistema_id) === Number(usuario?.subsistema_id)
          )
        );
      })
      .catch((err) => setError(mensajeDeError(err, 'No fue posible cargar las facultades.')));
  }, [usuario?.subsistema_id]);

  const filtroActual = useMemo(
    () => instituciones.find((institucion) => String(institucion.id) === String(institucionFiltro)),
    [instituciones, institucionFiltro]
  );

  const comparativoOrdenado = useMemo(() => {
    const promedios = new Map(
      (datos?.desgloseEntidades || []).map((entidad) => [
        entidad.institucion_id,
        entidad.promedio_general
      ])
    );

    return [...(datos?.comparativoEntidades || [])].sort((a, b) => {
      const promedioA = promedios.get(a.institucion_id);
      const promedioB = promedios.get(b.institucion_id);
      if (promedioA === null || promedioA === undefined) return 1;
      if (promedioB === null || promedioB === undefined) return -1;
      return Number(promedioB) - Number(promedioA);
    });
  }, [datos]);

  const cambiarFiltro = (valor) => {
    setInstitucionFiltro(valor);
    cargarDashboard(valor);
  };

  const exportar = () => {
    if (!datos?.desgloseEntidades?.length) return;

    const modulosExport = datos.indicadoresModulos || [];
    const promediosPorEntidad = new Map(
      (datos.comparativoEntidades || []).map((entidad) => [entidad.institucion_id, entidad.modulos || {}])
    );

    const filas = datos.desgloseEntidades.map((entidad) => ({
      ...entidad,
      ...Object.fromEntries(
        modulosExport.map((modulo) => [
          `modulo_${modulo.modulo_id}`,
          promediosPorEntidad.get(entidad.institucion_id)?.[modulo.modulo_id] ?? ''
        ])
      )
    }));

    descargarCsv(
      'indicadores_universidad',
      [
        { clave: 'facultad_institucion', etiqueta: 'Facultad / Institución' },
        { clave: 'municipio', etiqueta: 'Municipio' },
        { clave: 'total_respuestas', etiqueta: 'Respuestas' },
        { clave: 'total_reactivos', etiqueta: 'Reactivos' },
        { clave: 'avance', etiqueta: 'Avance (%)' },
        { clave: 'promedio_general', etiqueta: 'Índice general' },
        ...modulosExport.map((modulo) => ({
          clave: `modulo_${modulo.modulo_id}`,
          etiqueta: modulo.modulo
        }))
      ],
      filas
    );
  };

  if (!datos && cargando) return <PageLoader label="Calculando indicadores de la universidad…" />;

  const resumen = datos?.resumen;
  const calificacion = calificarPromedio(resumen?.promedio_global);
  const modulos = datos?.indicadoresModulos || [];

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Panel de subsistema</span>
          <h1>{usuario?.subsistema_nombre || 'Panel universitario'}</h1>
          <p>
            Monitoree el desempeño de las facultades y planteles adscritos a su universidad, con
            indicadores globales o por institución.
          </p>
        </div>
        <div className="page-header__meta">
          <Badge variant="dorado" dot>
            {usuario?.estado} · Región {usuario?.region}
          </Badge>
          <span>Alcance: {formatearEntero(resumen?.total_instituciones || instituciones.length)} facultades</span>
        </div>
      </div>

      <Card
        title="Filtrar por facultad"
        subtitle={
          filtroActual
            ? `Consultando únicamente ${filtroActual.nombre}.`
            : 'Vista global de todas las entidades de la universidad.'
        }
        icon="filter"
        actions={
          institucionFiltro && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => cambiarFiltro('')}>
              <Icon name="refresh" size={16} />
              Ver toda la universidad
            </button>
          )
        }
      >
        <div className="filters filters--compact">
          <div className="field">
            <label htmlFor="filtro-facultad">Facultad / Institución</label>
            <select
              id="filtro-facultad"
              value={institucionFiltro}
              onChange={(evento) => cambiarFiltro(evento.target.value)}
            >
              <option value="">Todas las facultades adscritas</option>
              {instituciones.map((institucion) => (
                <option key={institucion.id} value={institucion.id}>
                  {institucion.nombre} — {institucion.municipio}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <Alert type="error" title="Error al consultar la universidad" onClose={() => setError('')}>
          {error}
          <div className="mt-2">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => cargarDashboard(institucionFiltro)}
            >
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
          </div>
        </Alert>
      )}

      {resumen && (
        <div className={`kpi-grid ${cargando ? 'is-loading' : ''}`}>
          <KpiCard
            label="Promedio de la universidad"
            value={formatearPromedio(resumen.promedio_global)}
            suffix="/ 5.00"
            hint={calificacion.etiqueta}
            icon="award"
            tone="guinda"
            meta="Índice general"
          />
          <KpiCard
            label="Facultades adscritas"
            value={formatearEntero(resumen.total_instituciones)}
            hint={`${resumen.instituciones_evaluadas} con respuestas registradas`}
            icon="building"
            tone="dorado"
            meta="Cobertura"
          />
          <KpiCard
            label="Respuestas recibidas"
            value={formatearEntero(resumen.total_respuestas)}
            hint={`${resumen.total_reactivos} reactivos por facultad`}
            icon="clipboard"
            tone="azul"
            meta="Volumen"
          />
          <KpiCard
            label="Avance de captura"
            value={`${resumen.avance_global}%`}
            hint="Progreso global del cuestionario"
            icon="chart"
            tone="verde"
            meta="Avance"
          />
        </div>
      )}

      <div className="grid-2">
        <Card
          title="Promedio por eje estratégico"
          subtitle={filtroActual ? filtroActual.nombre : 'Todas las facultades de la universidad'}
          icon="chart"
        >
          <BarrasModulos indicadores={modulos} />
        </Card>
        <Card
          title="Perfil institucional"
          subtitle="Comparación de los seis módulos evaluados."
          icon="award"
        >
          <RadarModulos indicadores={modulos} />
        </Card>
      </div>

      <Card
        title="Comparativo por facultad y eje"
        subtitle="Lectura rápida de fortalezas y áreas de oportunidad por entidad."
        icon="chart"
        actions={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={exportar}
            disabled={!datos?.desgloseEntidades?.length}
          >
            <Icon name="download" size={16} />
            Exportar CSV
          </button>
        }
      >
        {comparativoOrdenado.length ? (
          <div className="table-wrap">
            <table className="table table--matrix">
              <thead>
                <tr>
                  <th>Facultad / Institución</th>
                  {modulos.map((modulo) => (
                    <th key={modulo.modulo_id} className="table__numeric">
                      {modulo.modulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparativoOrdenado.map((entidad) => {
                  const promedioGeneral = datos.desgloseEntidades.find(
                    (item) => item.institucion_id === entidad.institucion_id
                  )?.promedio_general;
                  return (
                    <tr key={entidad.institucion_id}>
                      <td>
                        <strong>{entidad.facultad_institucion}</strong>
                        <small className="table__sub">
                          Índice general: {formatearPromedio(promedioGeneral)}
                        </small>
                      </td>
                      {modulos.map((modulo) => {
                        const valor = entidad.modulos[modulo.modulo_id];
                        return (
                          <td key={modulo.modulo_id} className="table__numeric">
                            <span className={`matrix-cell matrix-cell--${clasePromedio(valor)}`}>
                              {valor === null || valor === undefined ? '—' : formatearPromedio(valor, 1)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin facultades registradas">
            Aún no hay facultades adscritas a esta universidad.
          </EmptyState>
        )}
      </Card>

      <Card
        title="Resultados individuales por facultad"
        subtitle="Seleccione una entidad para revisar su desglose por módulo."
        icon="building"
      >
        {datos?.desgloseEntidades?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Facultad / Institución</th>
                  <th>Municipio</th>
                  <th className="table__progress">Avance</th>
                  <th>Índice general</th>
                  <th>Estatus</th>
                  <th className="table__actions">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {datos.desgloseEntidades.map((entidad) => (
                  <tr key={entidad.institucion_id}>
                    <td>
                      <strong>{entidad.facultad_institucion}</strong>
                    </td>
                    <td>{entidad.municipio}</td>
                    <td className="table__progress">
                      <ProgressBar
                        value={entidad.avance}
                        label={`${entidad.total_respuestas}/${entidad.total_reactivos}`}
                      />
                    </td>
                    <td>
                      <span className={`score score--${clasePromedio(entidad.promedio_general)}`}>
                        {entidad.promedio_general ? formatearPromedio(entidad.promedio_general) : '—'}
                      </span>
                    </td>
                    <td>
                      <ScoreBadge
                        valor={entidad.promedio_general}
                        etiqueta={
                          entidad.promedio_general
                            ? calificarPromedio(entidad.promedio_general).etiqueta
                            : 'Pendiente'
                        }
                      />
                    </td>
                    <td className="table__actions">
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => setEntidadDetalle(entidad)}
                        aria-label={`Ver detalle de ${entidad.facultad_institucion}`}
                      >
                        <Icon name="search" size={16} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin resultados disponibles">
            Las facultades aparecerán cuando registren respuestas.
          </EmptyState>
        )}
      </Card>

      <DetalleEntidadModal
        entidad={entidadDetalle}
        comparativo={datos?.comparativoEntidades}
        indicadores={modulos}
        onClose={() => setEntidadDetalle(null)}
      />
    </div>
  );
};
