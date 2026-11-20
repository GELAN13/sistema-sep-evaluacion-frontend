import axiosClient from '../api/axiosClient';

export const evaluacionService = {
  obtenerCuestionario: async () => {
    const { data } = await axiosClient.get('/evaluacion/cuestionario');
    return data;
  },

  guardarRespuestas: async (respuestas) => {
    const { data } = await axiosClient.post('/evaluacion/cuestionario', { respuestas });
    return data;
  },

  obtenerDashboard: async (filtros = {}) => {
    // Se eliminan valores vacíos para que el backend reciba solo filtros reales.
    const params = Object.fromEntries(
      Object.entries(filtros).filter(
        ([, valor]) => valor !== '' && valor !== null && valor !== undefined
      )
    );
    const { data } = await axiosClient.get('/evaluacion/dashboard', { params });
    return data;
  }
};
