import { http } from "./http";

export const adminApi = {
  // Dashboard
  getDashboard: () => http.get("/api/admin/dashboard"),
  getRevenue: (tuNgay, denNgay) => http.get("/api/admin/doanh-thu", { params: { tuNgay, denNgay } }),

  // Sân bóng
  getSanBong: () => http.get("/api/admin/san"),
  getFieldImage: (id) => http.get(`/api/admin/san/${id}/image-url`),
  themSanBong: (formData) => http.post("/api/admin/san", formData),
  suaSanBong: (id, formData) => http.put(`/api/admin/san/${id}`, formData),
  updateTrangThaiSan: (id, trangThai) =>
    http.put(`/api/admin/san/${id}/trang-thai?trangThai=${encodeURIComponent(trangThai)}`),
  xoaSanBong: (id) => http.delete(`/api/admin/san/${id}`),
  uploadMinIO: async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await http.post("/api/admin/san/upload-anh", form);
    return res.data; // { url, objectName }
  },

  // Khung giờ và bảng giá
  getKhungGio: () => http.get("/api/khung-gio"),
  taoKhungGio: (body) => http.post("/api/khung-gio", body),
  suaKhungGio: (id, body) => http.put(`/api/khung-gio/${id}`, body),
  xoaKhungGio: (id) => http.delete(`/api/khung-gio/${id}`),
  getGiaSan: (sanId) => http.get("/api/gia-san", { params: { sanId } }),
  taoGiaSan: (body) => http.post("/api/gia-san", body),
  suaGiaSan: (id, body) => http.put(`/api/gia-san/${id}`, body),
  xoaGiaSan: (id) => http.delete(`/api/gia-san/${id}`),

  // Cụm sân và phân công
  getCumSan: () => http.get("/api/admin/cum-san"),
  taoCumSan: (body) => http.post("/api/admin/cum-san", body),
  suaCumSan: (id, body) => http.put(`/api/admin/cum-san/${id}`, body),
  xoaCumSan: (id) => http.delete(`/api/admin/cum-san/${id}`),
  phanCongCumSan: (staffId, cumSanId) =>
    http.put(`/api/admin/cum-san/nhan-vien/${staffId}`, { cumSanId }),

  // Thanh toán
  getPayments: (trangThai) => http.get("/api/thanh-toan/quan-ly", { params: trangThai ? { trangThai } : {} }),
  confirmPayment: (id) => http.put(`/api/thanh-toan/${id}/xac-nhan`),

  // Khách hàng
  getKhachHang: () => http.get("/api/admin/khach-hang"),
  themKhachHang: (formData) => http.post("/api/admin/khach-hang", formData),
  suaKhachHang: (id, formData) => http.put(`/api/admin/khach-hang/${id}`, formData),
  toggleKhoaKhachHang: (id) => http.put(`/api/admin/nguoi-dung/${id}/khoa`),
  xoaKhachHang: (id) => http.delete(`/api/admin/khach-hang/${id}`),

  // Nhân viên
  getNhanVien: () => http.get("/api/admin/nhan-vien"),
  themNhanVien: (formData) => http.post("/api/admin/nhan-vien", formData),
  suaNhanVien: (id, formData) => http.put(`/api/admin/nhan-vien/${id}`, formData),
  toggleKhoaNhanVien: (id) => http.put(`/api/admin/nguoi-dung/${id}/khoa`),
  xoaNhanVien: (id) => http.delete(`/api/admin/nhan-vien/${id}`),

  // Báo cáo
  exportExcel: (tuNgay, denNgay) =>
    http.get("/api/admin/bao-cao/excel", { params: { tuNgay, denNgay } }),
  exportPdf: (tuNgay, denNgay) =>
    http.get("/api/admin/bao-cao/pdf", { params: { tuNgay, denNgay } }),
};
