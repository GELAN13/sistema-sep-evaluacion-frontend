import { FooterGobierno } from './FooterGobierno';

export const AuthLayout = ({ children }) => (
  <div className="app-shell auth-shell">
    <div className="gov-strip">
      <div className="container gov-strip__inner">
        <span>Gobierno del Estado de Veracruz · Secretaría de Educación de Veracruz</span>
        <span className="gov-strip__right">Sistema de Evaluación Institucional</span>
      </div>
    </div>
    <main className="auth-main">{children}</main>
    <FooterGobierno />
  </div>
);

export default AuthLayout;
