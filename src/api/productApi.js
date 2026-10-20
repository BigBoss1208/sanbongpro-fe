// Deprecated module retained for external consumers; requests use the shared authenticated client.
import { http } from './http';
export const productApi = {
  getAll: async () => (await http.get('/api/products')).data,
  create: async (product) => {
    const body = new FormData();
    for (const key of ['name', 'description', 'price', 'quantity', 'image']) body.append(key, product[key]);
    return (await http.post('/api/products', body)).data;
  },
  update: async (id, product) => (await http.put(`/api/products/${id}`, product)).data,
  remove: async (id) => (await http.delete(`/api/products/${id}`)).data,
  health: async () => (await http.get('/api/health')).data,
};
