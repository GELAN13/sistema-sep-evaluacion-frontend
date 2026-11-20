import { formatearPromedio } from '../utils/format';
import { Badge, ProgressBar, ScoreBadge } from './ui/Ui';
import { Modal } from './ui/Modal';
import { MiniBarrasModulos } from './charts/ModuleCharts';

export const DetalleEntidadModal = ({ entidad, comparativo, indicadores, onClose }) => {
  if (!entidad) return null;

  const detalle = comparativo?.find((item) => item.institucion_id === entidad.institucion_id);
  const modulos = detalle?.modulos || {};
  const indicadoresPropios = (indicadores || []).map((modulo) => ({
    ...modulo,
    promedio: modulos[modulo.modulo_id] ?? null
  }));

  return (
    <Modal
      open={Boolean(entidad)}
      onClose={onClose}
      title={entidad.facultad_institucion}
      subtitle={`${entidad.universidad} · ${entidad.municipio}, Veracruz`}
      size="lg"
      footer={
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      <div className="detail-summary">
        <div>
          <span className="detail-summary__label">Índice general</span>
          <div className="detail-summary__value">
            {formatearPromedio(entidad.promedio_general)}
            <small> / 5.00</small>
          </div>
          <ScoreBadge valor={entidad.promedio_general} />
        </div>
        <div>
          <span className="detail-summary__label">Avance del cuestionario</span>
          <strong className="detail-summary__big">
            {entidad.total_respuestas} / {entidad.total_reactivos || 30}
          </strong>
          <ProgressBar value={entidad.avance} showValue />
        </div>
        <div>
          <span className="detail-summary__label">Adscripción y Control</span>
          <p className="detail-summary__text">
            {entidad.universidad}
            <br />
            Región {entidad.region} · Veracruz
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            <Badge variant="neutral">{entidad.municipio}</Badge>
            {entidad.control_detalle && (
              <Badge variant={entidad.tipo_control === 'PRIVADA' ? 'dorado' : 'guinda'}>
                {entidad.control_detalle}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="detail-modules">
        <div className="detail-modules__header">
          <h3>Resultados por eje estratégico</h3>
          <span>Escala de 1 a 5</span>
        </div>
        <MiniBarrasModulos indicadores={indicadoresPropios} />
      </div>

      <div className="detail-note">
        {Object.keys(modulos).length === 0 ? (
          <p>
            Esta institución aún no ha registrado respuestas. Los indicadores se habilitarán cuando
            complete o guarde avances de su autoevaluación.
          </p>
        ) : (
          <p>
            Los promedios corresponden a las respuestas registradas por la institución. Un valor
            menor a 3.0 identifica un área prioritaria de atención.
          </p>
        )}
      </div>
    </Modal>
  );
};
