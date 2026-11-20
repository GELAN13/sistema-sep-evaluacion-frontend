import axiosClient from '../api/axiosClient';

export const adminService = {
  listarUsuarios: async () => {
    const { data } = await axiosClient.get('/admin/usuarios');
    return data.usuarios;
  },

  cambiarEstado: async (id, activo) => {
    const { data } = await axiosClient.patch(`/admin/usuarios/${id}/estado`, { activo });
    return data;
  }
};
