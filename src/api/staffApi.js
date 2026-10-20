import { http as api } from "./http";

export const staffApi = {
  listBookingRequests: () =>
    api.get("/api/nhan-vien/dat-san", {
      params: { trangThai: "CHO_XAC_NHAN" },
    }),
  approveBooking: (id) => api.put(`/api/nhan-vien/dat-san/${id}/duyet`),
  rejectBooking: (id, lyDo) =>
    api.put(`/api/nhan-vien/dat-san/${id}/tu-choi`, { lyDo }),
  getScheduleMatrix: (ngay) =>
    api.get("/api/nhan-vien/lich-ma-tran", { params: { ngay } }),
  searchBooking: (q) =>
    api.get("/api/nhan-vien/dat-san/tim-kiem", { params: { q } }),
  checkIn: (id) => api.put(`/api/nhan-vien/dat-san/${id}/checkin`),
  createWalkinBooking: (booking) =>
    api.post("/api/nhan-vien/dat-san/walkin", booking),
};

export function getStaffApiError(error, fallback) {
  const responseData = error.response?.data;
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }
  return responseData?.message || error.message || fallback;
}

export function getResponseList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return data ? [data] : [];
}
