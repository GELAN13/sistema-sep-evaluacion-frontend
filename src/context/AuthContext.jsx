import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const leerUsuarioGuardado = () => {
  try {
    const guardado = localStorage.getItem('sep_usuario');
    if (!guardado) return null;
    const usuario = JSON.parse(guardado);
    return usuario?.id && usuario?.rol ? usuario : null;
  } catch {
    localStorage.removeItem('sep_usuario');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  const iniciarSesion = (token, datosUsuario) => {
    localStorage.setItem('sep_token', token);
    localStorage.setItem('sep_usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const actualizarUsuario = (datosUsuario) => {
    localStorage.setItem('sep_usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('sep_token');
    localStorage.removeItem('sep_usuario');
    setUsuario(null);
  };

  const valor = useMemo(
    () => ({
      usuario,
      estaAutenticado: Boolean(usuario),
      iniciarSesion,
      actualizarUsuario,
      cerrarSesion
    }),
    [usuario]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider.');
  }
  return contexto;
};
