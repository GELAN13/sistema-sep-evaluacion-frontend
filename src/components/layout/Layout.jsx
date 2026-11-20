import { Outlet } from 'react-router-dom';
import { NavbarGobierno } from './NavbarGobierno';
import { FooterGobierno } from './FooterGobierno';

export const Layout = () => (
  <div className="app-shell">
    <NavbarGobierno />
    <main className="page-shell">
      <Outlet />
    </main>
    <FooterGobierno />
  </div>
);

export default Layout;
