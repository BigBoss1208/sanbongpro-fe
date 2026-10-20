import { http } from "./http";

export const sanApi = {
  // Public API returns safe SanDTO objects.
  async danhSachSan() {
    const res = await http("/api/san");
    return res.data;
  },

  // GET /api/san/{sanId}/lich-trong?ngay=YYYY-MM-DD
  async lichTrong(sanId, ngay) {
    const query = new URLSearchParams({ ngay });
    const res = await http(`/api/san/${sanId}/lich-trong?${query}`);
    return res.data;
  },
};