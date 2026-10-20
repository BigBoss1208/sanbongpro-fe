import { http } from "./http";

export const datSanApi = {
  // { sanId, khungGioId, ngayDat } -> DatSanDTO (trạng thái GIU_CHO_TAM)
  async taoDatSan({ sanId, khungGioId, ngayDat, phuongThucThanhToan }) {
    const res = await http.post("/api/dat-san", { sanId, khungGioId, ngayDat, phuongThucThanhToan });
    return res.data;
  },

  async datSanCuaToi() {
    const res = await http.get("/api/dat-san/cua-toi");
    return res.data;
  },

  async giuChoCuaToi() {
    const res = await http.get("/api/dat-san/giu-cho/cua-toi");
    return res.data;
  },

  async chiTiet(id) {
    const res = await http.get(`/api/dat-san/${id}`);
    return res.data;
  },

  async hoaDon(id) {
    const res = await http.get(`/api/thanh-toan/dat-san/${id}/hoa-don`);
    return res.data;
  },

  async huyDatSan(id) {
    const res = await http.put(`/api/dat-san/${id}/huy`);
    return res.data;
  },
};