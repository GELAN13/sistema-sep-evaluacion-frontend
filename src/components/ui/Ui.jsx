import { Icon } from './Icon';

export const Card = ({ title, subtitle, actions, icon, children, className = '', bodyClassName = '' }) => (
  <section className={`card ${className}`.trim()}>
    {(title || actions) && (
      <header className="card__header">
        <div className="card__heading">
          {icon && (
            <span className="card__icon">
              <Icon name={icon} size={20} />
            </span>
          )}
          <div>
            {title && <h2 className="card__title">{title}</h2>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="card__actions">{actions}</div>}
      </header>
    )}
    <div className={`card__body ${bodyClassName}`.trim()}>{children}</div>
  </section>
);

export const KpiCard = ({ label, value, suffix, hint, icon = 'chart', tone = 'guinda', meta }) => (
  <article className={`kpi kpi--${tone}`}>
    <div className="kpi__top">
      <span className="kpi__icon">
        <Icon name={icon} size={20} />
      </span>
      {meta && <span className="kpi__meta">{meta}</span>}
    </div>
    <span className="kpi__label">{label}</span>
    <div className="kpi__value">
      {value}
      {suffix && <small className="kpi__suffix">{suffix}</small>}
    </div>
    {hint && <p className="kpi__hint">{hint}</p>}
  </article>
);

export const Badge = ({ children, variant = 'neutral', dot = false }) => (
  <span className={`badge badge--${variant}`}>
    {dot && <span className="badge__dot" />}
    {children}
  </span>
);

export const ScoreBadge = ({ valor, etiqueta }) => {
  if (valor === null || valor === undefined) {
    return <Badge variant="pendiente">Pendiente</Badge>;
  }
  const numero = Number(valor);
  const variante =
    numero >= 4.5 ? 'excelente' : numero >= 4 ? 'bueno' : numero >= 3 ? 'proceso' : 'critico';
  return (
    <Badge variant={variante} dot>
      {etiqueta || `${numero.toFixed(2)} / 5`}
    </Badge>
  );
};

export const ProgressBar = ({ value = 0, tone = 'guinda', label, showValue = true }) => {
  const seguro = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="progress">
      {(label || showValue) && (
        <div className="progress__header">
          {label && <span>{label}</span>}
          {showValue && <strong>{seguro}%</strong>}
        </div>
      )}
      <div
        className={`progress__track progress__track--${tone}`}
        role="progressbar"
        aria-valuenow={seguro}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Avance'}
      >
        <span className="progress__fill" style={{ width: `${seguro}%` }} />
      </div>
    </div>
  );
};

export const Alert = ({ type = 'info', title, children, onClose }) => (
  <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
    <span className="alert__icon">
      <Icon name={type === 'error' ? 'alert' : type === 'success' ? 'check' : 'info'} size={19} />
    </span>
    <div className="alert__body">
      {title && <strong className="alert__title">{title}</strong>}
      <div>{children}</div>
    </div>
    {onClose && (
      <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar aviso">
        <Icon name="close" size={16} />
      </button>
    )}
  </div>
);

export const Spinner = ({ label = 'Cargando información…' }) => (
  <div className="spinner" role="status" aria-live="polite">
    <span className="spinner__ring" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export const PageLoader = ({ label }) => (
  <div className="page-loader">
    <Spinner label={label} />
  </div>
);

export const EmptyState = ({ icon = 'clipboard', title, children }) => (
  <div className="empty-state">
    <span className="empty-state__icon">
      <Icon name={icon} size={28} />
    </span>
    <h3>{title}</h3>
    {children && <p>{children}</p>}
  </div>
);
