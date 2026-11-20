import axiosClient from '../api/axiosClient';

export const authService = {
  login: async (email, password, rol) => {
    const { data } = await axiosClient.post('/auth/login', { email, password, rol });
    return data;
  },
  registrar: async (datosUsuario) => {
    const { data } = await axiosClient.post('/auth/registro', datosUsuario);
    return data;
  },
  perfil: async () => {
    const { data } = await axiosClient.get('/auth/perfil');
    return data.usuario;
  }
};
