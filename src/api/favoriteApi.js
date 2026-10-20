import { http } from "./http";

export const favoriteApi = {
  async list() {
    const response = await http.get("/api/yeu-thich");
    return response.data;
  },
  async add(fieldId) {
    const response = await http.post(`/api/yeu-thich/${fieldId}`);
    return response.data;
  },
  remove: (fieldId) => http.delete(`/api/yeu-thich/${fieldId}`),
};
