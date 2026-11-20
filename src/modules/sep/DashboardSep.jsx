import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Alert, Badge, Card, EmptyState, KpiCard, PageLoader, ProgressBar } from '../../components/ui/Ui';
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

const FILTROS_INICIALES = {
  tipo_control: '',      // '' (todas), 'PUBLICA', 'PRIVADA'
  control_detalle: '',   // '', 'Pública Estatal', 'Pública Federal', 'Privada con RVOE Estatal (SEV)', 'Privada con RVOE Federal (SEP)'
  region: '',            // Región de Veracruz (Capital, Sotavento, Las Montañas, etc.)
  municipio: '',         // Municipio de Veracruz
  subsistema_id: '',
  institucion_id: ''
};

export const DashboardSep = () => {
  const { usuario } = useAuth();
  const [catalogos, setCatalogos] = useState({ subsistemas: [], instituciones: [], regiones: [], municipios: [] });
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [entidadDetalle, setEntidadDetalle] = useState(null);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const solicitudRef = useRef(0);

  const cargarDashboard = async (filtrosSolicitados) => {
    const numeroSolicitud = ++solicitudRef.current;
    setCargando(true);
    setError('');
    try {
      const respuesta = await evaluacionService.obtenerDashboard(filtrosSolicitados);
      if (numeroSolicitud === solicitudRef.current) setDatos(respuesta);
    } catch (err) {
      if (numeroSolicitud === solicitudRef.current) {
        setError(mensajeDeError(err, 'No fue posible obtener los indicadores de la SEV.'));
      }
    } finally {
      if (numeroSolicitud === solicitudRef.current) setCargando(false);
    }
  };

  useEffect(() => {
    cargarDashboard(FILTROS_INICIALES);
    catalogosService
      .obtener()
      .then((data) => {
        setCatalogos(data);
      })
      .catch((err) => setError(mensajeDeError(err, 'No fue posible cargar los catálogos institucionales.')));
  }, []);

  // Opciones filtradas dinámicamente según la selección previa
  const opciones = useMemo(() => {
    const subsistemas = (catalogos.subsistemas || []).filter((subsistema) => {
      const coincideControl = !filtros.tipo_control || subsistema.tipo_control === filtros.tipo_control;
      const coincideDetalle = !filtros.control_detalle || subsistema.control_detalle === filtros.control_detalle;
      const coincideRegion = !filtros.region || subsistema.region === filtros.region;
      return coincideControl && coincideDetalle && coincideRegion;
    });

    const instituciones = (catalogos.instituciones || []).filter((institucion) => {
      const coincideControl = !filtros.tipo_control || institucion.tipo_control === filtros.tipo_control;
      const coincideDetalle = !filtros.control_detalle || institucion.control_detalle === filtros.control_detalle;
      const coincideRegion = !filtros.region || institucion.region === filtros.region;
      const coincideSubsistema = !filtros.subsistema_id || String(institucion.subsistema_id) === String(filtros.subsistema_id);
      const coincideMunicipio = !filtros.municipio || institucion.municipio === filtros.municipio;
      return coincideControl && coincideDetalle && coincideRegion && coincideSubsistema && coincideMunicipio;
    });

    const regiones = [
      ...new Set(
        (catalogos.subsistemas || [])
          .filter((s) => (!filtros.tipo_control || s.tipo_control === filtros.tipo_control) &&
                         (!filtros.control_detalle || s.control_detalle === filtros.control_detalle))
          .map((s) => s.region)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, 'es'));

    const municipios = [
      ...new Set(
        (catalogos.instituciones || [])
          .filter((i) => (!filtros.tipo_control || i.tipo_control === filtros.tipo_control) &&
                         (!filtros.control_detalle || i.control_detalle === filtros.control_detalle) &&
                         (!filtros.region || i.region === filtros.region))
          .map((i) => i.municipio)
          .filter(Boolean)
      )
    ].sort((a, b) => a.localeCompare(b, 'es'));

    return { subsistemas, instituciones, regiones, municipios };
  }, [catalogos, filtros.tipo_control, filtros.control_detalle, filtros.region, filtros.subsistema_id, filtros.municipio]);

  const aplicarFiltro = (campo, valor) => {
    const siguientes = { ...filtros, [campo]: valor };

    if (campo === 'tipo_control') {
      siguientes.control_detalle = '';
      siguientes.subsistema_id = '';
      siguientes.institucion_id = '';
    }
    if (campo === 'control_detalle') {
      siguientes.subsistema_id = '';
      siguientes.institucion_id = '';
    }
    if (campo === 'region') {
      siguientes.municipio = '';
      siguientes.subsistema_id = '';
      siguientes.institucion_id = '';
    }
    if (campo === 'subsistema_id') {
      siguientes.institucion_id = '';
    }
    if (campo === 'municipio') {
      siguientes.institucion_id = '';
    }

    setFiltros(siguientes);
    cargarDashboard(siguientes);
  };

  const seleccionarTipoGeneral = (tipo) => {
    const siguientes = {
      ...filtros,
      tipo_control: tipo,
      control_detalle: '',
      subsistema_id: '',
      institucion_id: ''
    };
    setFiltros(siguientes);
    cargarDashboard(siguientes);
  };

  const seleccionarSubtipo = (detalle) => {
    const siguientes = {
      ...filtros,
      control_detalle: detalle,
      subsistema_id: '',
      institucion_id: ''
    };
    setFiltros(siguientes);
    cargarDashboard(siguientes);
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setBusquedaTabla('');
    cargarDashboard(FILTROS_INICIALES);
  };

  const filtrosActivos = Object.entries(filtros).filter(([, valor]) => valor !== '').length;

  // Filtrado reactivo en tiempo real para búsqueda de texto
  const entidadesFiltradas = useMemo(() => {
    const lista = datos?.desgloseEntidades || [];
    const q = busquedaTabla.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((entidad) =>
      entidad.universidad.toLowerCase().includes(q) ||
      entidad.facultad_institucion.toLowerCase().includes(q) ||
      (entidad.municipio && entidad.municipio.toLowerCase().includes(q)) ||
      (entidad.region && entidad.region.toLowerCase().includes(q)) ||
      (entidad.control_detalle && entidad.control_detalle.toLowerCase().includes(q)) ||
      (entidad.clave_cct && entidad.clave_cct.toLowerCase().includes(q))
    );
  }, [datos?.desgloseEntidades, busquedaTabla]);

  const exportar = () => {
    if (!entidadesFiltradas.length) return;

    const modulos = datos.indicadoresModulos || [];
    const promediosPorEntidad = new Map(
      (datos.comparativoEntidades || []).map((entidad) => [entidad.institucion_id, entidad.modulos || {}])
    );

    const filas = entidadesFiltradas.map((entidad) => ({
      ...entidad,
      estado: 'Veracruz',
      ...Object.fromEntries(
        modulos.map((modulo) => [
          `modulo_${modulo.modulo_id}`,
          promediosPorEntidad.get(entidad.institucion_id)?.[modulo.modulo_id] ?? ''
        ])
      )
    }));

    descargarCsv(
      'indicadores_sev_veracruz',
      [
        { clave: 'universidad', etiqueta: 'Universidad / Subsistema' },
        { clave: 'control_detalle', etiqueta: 'Tipo de Control / RVOE' },
        { clave: 'facultad_institucion', etiqueta: 'Facultad / Institución' },
        { clave: 'region', etiqueta: 'Región Veracruz' },
        { clave: 'municipio', etiqueta: 'Municipio' },
        { clave: 'total_respuestas', etiqueta: 'Respuestas' },
        { clave: 'total_reactivos', etiqueta: 'Reactivos' },
        { clave: 'avance', etiqueta: 'Avance (%)' },
        { clave: 'promedio_general', etiqueta: 'Índice general' },
        ...modulos.map((modulo) => ({
          clave: `modulo_${modulo.modulo_id}`,
          etiqueta: modulo.modulo
        }))
      ],
      filas
    );
  };

  if (!datos && cargando) return <PageLoader label="Calculando indicadores institucionales de Veracruz…" />;

  const resumen = datos?.resumen;
  const calificacion = calificarPromedio(resumen?.promedio_global);

  return (
    <div className="container page">
      {/* Cabecera institucional SEV */}
      <div className="page-header">
        <div>
          <span className="eyebrow">Secretaría de Educación de Veracruz · SEV</span>
          <h1>Indicadores de evaluación institucional</h1>
          <p>
            {usuario?.nombre || 'Autoridad educativa'}, supervise el desempeño institucional en el Estado de Veracruz
            por tipo de control (público / privado con RVOE), región y municipio.
          </p>
        </div>
        <div className="page-header__meta">
          <Badge variant="guinda" dot>
            Estado de Veracruz
          </Badge>
          <span>SEV · Actualización en tiempo real</span>
        </div>
      </div>

      {/* Tarjeta de Filtros de la SEV con agrupación de Públicas y Privadas RVOE */}
      <Card
        title="Filtros para la SEV (Estado de Veracruz)"
        subtitle="Consulte y refine por tipo de control institucional, regiones del estado y búsqueda rápida."
        icon="filter"
        className="filters-card"
        actions={
          filtrosActivos > 0 && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={limpiarFiltros}>
              <Icon name="refresh" size={16} />
              Limpiar filtros ({filtrosActivos})
            </button>
          )
        }
      >
        {/* Selector de Clasificación: 1. Públicas (Federales/Estatales) vs 2. Privadas con RVOE (SEV/SEP) */}
        <div className="sev-control-filter">
          <div className="sev-control-filter__label">
            <Icon name="shield" size={16} />
            <span>Clasificación institucional:</span>
          </div>
          <div className="sev-control-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={filtros.tipo_control === ''}
              className={`sev-control-tab ${filtros.tipo_control === '' ? 'sev-control-tab--active' : ''}`}
              onClick={() => seleccionarTipoGeneral('')}
            >
              <strong>Todas las instituciones</strong>
              <small>Veracruz (Públicas y Privadas)</small>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filtros.tipo_control === 'PUBLICA'}
              className={`sev-control-tab ${filtros.tipo_control === 'PUBLICA' ? 'sev-control-tab--active' : ''}`}
              onClick={() => seleccionarTipoGeneral('PUBLICA')}
            >
              <strong>1. Instituciones Públicas</strong>
              <small>Federales y Estatales</small>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filtros.tipo_control === 'PRIVADA'}
              className={`sev-control-tab ${filtros.tipo_control === 'PRIVADA' ? 'sev-control-tab--active' : ''}`}
              onClick={() => seleccionarTipoGeneral('PRIVADA')}
            >
              <strong>2. Universidades Privadas con RVOE</strong>
              <small>RVOE SEP / SEV</small>
            </button>
          </div>

          {/* Subfiltros específicos de control según la pestaña activa */}
          {filtros.tipo_control === 'PUBLICA' && (
            <div className="sev-subcontrol-chips">
              <span className="chips-label">Ámbito público:</span>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === '' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('')}
              >
                Todas las públicas
              </button>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === 'Pública Estatal' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('Pública Estatal')}
              >
                🏛️ Públicas Estatales (ej. UV, ITSX, UTCV)
              </button>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === 'Pública Federal' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('Pública Federal')}
              >
                🏛️ Públicas Federales (ej. TecNM Veracruz)
              </button>
            </div>
          )}

          {filtros.tipo_control === 'PRIVADA' && (
            <div className="sev-subcontrol-chips">
              <span className="chips-label">Tipo de RVOE:</span>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === '' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('')}
              >
                Todas las privadas con RVOE
              </button>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === 'Privada con RVOE Estatal (SEV)' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('Privada con RVOE Estatal (SEV)')}
              >
                🎓 RVOE Estatal (SEV) (ej. UCC, UX)
              </button>
              <button
                type="button"
                className={`chip-btn ${filtros.control_detalle === 'Privada con RVOE Federal (SEP)' ? 'chip-btn--active' : ''}`}
                onClick={() => seleccionarSubtipo('Privada con RVOE Federal (SEP)')}
              >
                🎓 RVOE Federal (SEP) (ej. Anáhuac)
              </button>
            </div>
          )}
        </div>

        {/* Filtros territoriales e institucionales de Veracruz (Sin selector de estados) */}
        <div className="filters">
          <div className="field">
            <label htmlFor="filtro-region">Región de Veracruz</label>
            <select
              id="filtro-region"
              value={filtros.region}
              onChange={(evento) => aplicarFiltro('region', evento.target.value)}
            >
              <option value="">Todas las regiones de Veracruz</option>
              {opciones.regiones.map((region) => (
                <option key={region} value={region}>
                  Región {region}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filtro-municipio">Municipio</label>
            <select
              id="filtro-municipio"
              value={filtros.municipio}
              onChange={(evento) => aplicarFiltro('municipio', evento.target.value)}
            >
              <option value="">Todos los municipios</option>
              {opciones.municipios.map((municipio) => (
                <option key={municipio} value={municipio}>
                  {municipio}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filtro-subsistema">Universidad / Subsistema</label>
            <select
              id="filtro-subsistema"
              value={filtros.subsistema_id}
              onChange={(evento) => aplicarFiltro('subsistema_id', evento.target.value)}
            >
              <option value="">Todas las universidades ({opciones.subsistemas.length})</option>
              {opciones.subsistemas.map((subsistema) => (
                <option key={subsistema.id} value={subsistema.id}>
                  {subsistema.nombre} — {subsistema.control_detalle || 'Pública'}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="filtro-institucion">Facultad / Plantel</label>
            <select
              id="filtro-institucion"
              value={filtros.institucion_id}
              onChange={(evento) => aplicarFiltro('institucion_id', evento.target.value)}
            >
              <option value="">Todas las facultades ({opciones.instituciones.length})</option>
              {opciones.instituciones.map((institucion) => (
                <option key={institucion.id} value={institucion.id}>
                  {institucion.nombre} ({institucion.municipio})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {error && (
        <Alert type="error" title="Error al consultar los indicadores" onClose={() => setError('')}>
          {error}
          <div className="mt-2">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => cargarDashboard(filtros)}>
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
          </div>
        </Alert>
      )}

      {/* Tarjetas KPI */}
      {resumen && (
        <div className={`kpi-grid ${cargando ? 'is-loading' : ''}`}>
          <KpiCard
            label="Promedio estatal"
            value={formatearPromedio(resumen.promedio_global)}
            suffix="/ 5.00"
            hint={`${calificacion.etiqueta} en el alcance seleccionado`}
            icon="award"
            tone="guinda"
            meta="Índice general"
          />
          <KpiCard
            label="Instituciones evaluadas"
            value={`${formatearEntero(resumen.instituciones_evaluadas)}`}
            suffix={`/ ${formatearEntero(resumen.total_instituciones)}`}
            hint="Entidades con captura en Veracruz"
            icon="building"
            tone="dorado"
            meta="Cobertura"
          />
          <KpiCard
            label="Respuestas registradas"
            value={formatearEntero(resumen.total_respuestas)}
            hint={`${resumen.total_reactivos} reactivos evaluados por entidad`}
            icon="clipboard"
            tone="azul"
            meta="Volumen"
          />
          <KpiCard
            label="Avance global SEV"
            value={`${resumen.avance_global}%`}
            hint="Progreso de captura del cuestionario"
            icon="chart"
            tone="verde"
            meta="Captura"
          />
        </div>
      )}

      {/* Gráficos de desempeño */}
      {datos && (
        <div className="grid-2">
          <Card
            title="Promedio por eje estratégico en Veracruz"
            subtitle="Escala de 1 a 5; el umbral estatal SEV es 3.0."
            icon="chart"
          >
            <BarrasModulos indicadores={datos.indicadoresModulos} />
          </Card>
          <Card
            title="Perfil de desempeño institucional"
            subtitle="Comportamiento en los seis ejes de evaluación."
            icon="award"
          >
            <RadarModulos indicadores={datos.indicadoresModulos} />
          </Card>
        </div>
      )}

      {/* Tabla de instituciones con buscador interactivo en tiempo real */}
      <Card
        title="Desglose de instituciones de Veracruz"
        subtitle="Ordenado por índice general; use el buscador para filtrar en tiempo real por nombre, municipio o RVOE."
        icon="building"
        actions={
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={exportar}
            disabled={!entidadesFiltradas.length}
          >
            <Icon name="download" size={16} />
            Exportar CSV
          </button>
        }
      >
        {/* Barra de búsqueda interactiva */}
        <div className="table-search-row">
          <div className="search-box">
            <Icon name="search" size={17} />
            <input
              type="search"
              placeholder="Buscar por universidad, facultad, municipio, región o RVOE…"
              value={busquedaTabla}
              onChange={(e) => setBusquedaTabla(e.target.value)}
              aria-label="Buscar en la tabla"
            />
            {busquedaTabla && (
              <button
                type="button"
                className="search-box__clear"
                onClick={() => setBusquedaTabla('')}
                aria-label="Limpiar búsqueda"
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <div className="table-search-meta">
            <span className="search-count-badge">
              {entidadesFiltradas.length} de {datos?.desgloseEntidades?.length || 0} instituciones
            </span>
          </div>
        </div>

        {entidadesFiltradas.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="table__rank">#</th>
                  <th>Universidad / Subsistema</th>
                  <th>Facultad / Institución</th>
                  <th>Control / RVOE</th>
                  <th>Ubicación (Veracruz)</th>
                  <th className="table__progress">Avance</th>
                  <th>Índice</th>
                  <th className="table__actions">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {entidadesFiltradas.map((entidad, indice) => (
                  <tr key={entidad.institucion_id}>
                    <td className="table__rank">
                      <span className={indice < 3 && entidad.promedio_general ? 'rank rank--top' : 'rank'}>
                        {entidad.promedio_general ? indice + 1 : '—'}
                      </span>
                    </td>
                    <td className="table__universidad">
                      <strong>{entidad.universidad}</strong>
                    </td>
                    <td>
                      <span>{entidad.facultad_institucion}</span>
                      {entidad.clave_cct && <small className="table__cct">CCT: {entidad.clave_cct}</small>}
                    </td>
                    <td>
                      <span className={`pill-badge pill-badge--${entidad.tipo_control === 'PRIVADA' ? 'privada' : 'publica'}`}>
                        {entidad.control_detalle || (entidad.tipo_control === 'PRIVADA' ? 'Privada con RVOE' : 'Pública Estatal')}
                      </span>
                    </td>
                    <td>
                      <span className="table__municipio">{entidad.municipio}</span>
                      <small className="table__sub">
                        Región {entidad.region}
                      </small>
                    </td>
                    <td className="table__progress">
                      <ProgressBar value={entidad.avance} showValue label={`${entidad.total_respuestas}/${entidad.total_reactivos}`} />
                    </td>
                    <td>
                      <span className={`score score--${clasePromedio(entidad.promedio_general)}`}>
                        {entidad.promedio_general ? formatearPromedio(entidad.promedio_general) : '—'}
                      </span>
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
          <EmptyState title="Sin instituciones en el criterio seleccionado">
            {busquedaTabla
              ? `No se encontraron instituciones que coincidan con "${busquedaTabla}". Pruebe con otro término.`
              : 'Pruebe con otra región, municipio o tipo de control para consultar los indicadores.'}
          </EmptyState>
        )}

        <p className="table-note">
          Indicadores oficiales de la Secretaría de Educación de Veracruz (SEV). El índice general corresponde
          al promedio simple de las evaluaciones capturadas en escala de 1 a 5.
        </p>
      </Card>

      <DetalleEntidadModal
        entidad={entidadDetalle}
        comparativo={datos?.comparativoEntidades}
        indicadores={datos?.indicadoresModulos}
        onClose={() => setEntidadDetalle(null)}
      />
    </div>
  );
};
