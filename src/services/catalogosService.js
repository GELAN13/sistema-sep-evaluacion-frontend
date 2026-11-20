import axiosClient from '../api/axiosClient';

export const catalogosService = {
  obtener: async () => {
    const { data } = await axiosClient.get('/catalogos');
    return data;
  }
};
