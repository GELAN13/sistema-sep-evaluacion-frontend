import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => {
  const tituloId = useId();
  const contenedorRef = useRef(null);
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const manejarTecla = (evento) => {
      if (evento.key === 'Escape') onClose?.();
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', manejarTecla);
    cerrarRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', manejarTecla);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        ref={contenedorRef}
      >
        <header className="modal__header">
          <div>
            <h2 id={tituloId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Cerrar ventana"
            ref={cerrarRef}
          >
            <Icon name="close" size={19} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
};
