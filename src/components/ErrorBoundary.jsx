import { Component } from 'react';
import { Icon } from './ui/Icon';

/**
 * Evita que un error inesperado de renderizado deje la aplicación en blanco.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error de interfaz:', error, info);
  }

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <span className="error-boundary__icon">
              <Icon name="alert" size={30} />
            </span>
            <span className="eyebrow">Error inesperado</span>
            <h1>No fue posible mostrar esta sección</h1>
            <p>
              Se produjo un problema al renderizar la interfaz. Puede recargar la página o volver al
              inicio del sistema.
            </p>
            <div className="error-boundary__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => window.location.reload()}
              >
                <Icon name="refresh" size={17} />
                Recargar página
              </button>
              <a className="btn btn--secondary" href="/">
                Volver al inicio
              </a>
            </div>
            {import.meta.env.DEV && (
              <pre className="error-boundary__detail">{String(error?.message || error)}</pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
