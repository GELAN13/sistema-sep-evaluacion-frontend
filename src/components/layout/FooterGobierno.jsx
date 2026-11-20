export const FooterGobierno = () => (
  <footer className="site-footer">
    <div className="container site-footer__inner">
      <div className="site-footer__brand">
        <img src="/logosev.png" alt="Logo SEV Veracruz" className="site-footer__emblem" />
        <div>
          <strong>Secretaría de Educación de Veracruz</strong>
          <span>Sistema de Evaluación Institucional</span>
        </div>
      </div>
      <div className="site-footer__meta">
        <span>Evaluación · Transparencia · Mejora continua</span>
        <span>© {new Date().getFullYear()} Gobierno del Estado de Veracruz</span>
      </div>
      <div className="site-footer__links">
        <a href="https://www.sev.gob.mx" target="_blank" rel="noreferrer">
          sev.gob.mx
        </a>
        <a href="https://www.veracruz.gob.mx" target="_blank" rel="noreferrer">
          veracruz.gob.mx
        </a>
      </div>
    </div>
  </footer>
);

export default FooterGobierno;
