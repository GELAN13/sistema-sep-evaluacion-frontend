import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sep_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const limpiarSesion = () => {
  localStorage.removeItem('sep_token');
  localStorage.removeItem('sep_usuario');
};

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const respuesta = error.response;
    const codigo = respuesta?.data?.codigo;
    const enLogin = window.location.pathname.startsWith('/login');

    const sesionInvalida =
      respuesta?.status === 401 ||
      (respuesta?.status === 403 && codigo === 'USUARIO_INACTIVO');

    if (sesionInvalida && !enLogin) {
      limpiarSesion();
      window.location.href = '/login?sesion=expirada';
    }

    if (error.code === 'ECONNABORTED') {
      error.mensajeAmigable =
        'La solicitud tardó demasiado. Verifique que el servidor esté activo.';
    } else if (!respuesta) {
      error.mensajeAmigable =
        'No fue posible conectar con el servidor. Verifique que el backend esté en ejecución.';
    }

    return Promise.reject(error);
  }
);

export const mensajeDeError = (error, respaldo = 'Ocurrió un error inesperado.') =>
  error?.response?.data?.mensaje || error?.mensajeAmigable || error?.message || respaldo;

export default axiosClient;
