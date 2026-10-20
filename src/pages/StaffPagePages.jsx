import { useExclusiveAction } from "../utils/useExclusiveAction";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import StaffScheduleMatrix from "../components/StaffScheduleMatrix";
import { getResponseList, getStaffApiError, staffApi } from "../api/staffApi";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function bookingCustomer(booking) {
  return booking.khachHang?.hoTen || booking.tenKhachHang || booking.hoTen || "Khách đặt sân";
}

function bookingPhone(booking) {
  return booking.khachHang?.soDienThoai || booking.soDienThoai || booking.sdt || "Chưa có";
}

export function BookingDetailModal({ booking, onClose }) {
  if (!booking) return null;

  const rows = [
    ["Mã đơn", booking.id ? `#${booking.id}` : "Chưa cập nhật"],
    ["Khách hàng", bookingCustomer(booking)],
    ["Số điện thoại", bookingPhone(booking)],
    ["Sân", booking.tenSan || booking.san?.tenSan || "Chưa cập nhật"],
    ["Ngày đá", booking.ngayDat || "Chưa cập nhật"],
    ["Khung giờ", `${booking.gioBatDau || "--:--"} - ${booking.gioKetThuc || "--:--"}`],
    ["Giá", formatMoney(booking.gia)],
    ["Trạng thái", booking.trangThai || "Chưa cập nhật"],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="booking-detail-title" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-700">Chi tiết đặt sân</p>
            <h2 id="booking-detail-title" className="mt-1 text-xl font-black text-slate-950">Đơn {booking.id ? `#${booking.id}` : "đặt sân"}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng chi tiết" className="rounded-lg px-2 py-1 text-xl font-bold text-slate-500 hover:bg-slate-100">×</button>
        </div>
        <dl className="mt-4 divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="font-semibold text-slate-500">{label}</dt>
              <dd className="text-right font-bold text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

BookingDetailModal.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tenKhachHang: PropTypes.string,
    hoTen: PropTypes.string,
    soDienThoai: PropTypes.string,
    sdt: PropTypes.string,
    tenSan: PropTypes.string,
    san: PropTypes.shape({ tenSan: PropTypes.string }),
    ngayDat: PropTypes.string,
    gioBatDau: PropTypes.string,
    gioKetThuc: PropTypes.string,
    gia: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    trangThai: PropTypes.string,
    khachHang: PropTypes.shape({
      hoTen: PropTypes.string,
      soDienThoai: PropTypes.string,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};

export function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [lyDo, setLyDo] = useState("");

  const loadRequests = () => {
    setLoading(true);
    setError("");
    return staffApi
      .listBookingRequests()
      .then(({ data }) => {
        setRequests(getResponseList(data).filter((item) => item.trangThai === "CHO_XAC_NHAN"));
      })
      .catch((err) => setError(getStaffApiError(err, "Không tải được yêu cầu đặt sân.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = useExclusiveAction(async (booking) => {
    setBusyId(booking.id);
    setError("");
    setMessage("");
    try {
      await staffApi.approveBooking(booking.id);
      setMessage(`Đã duyệt đơn #${booking.id}.`);
      await loadRequests();
    } catch (err) {
      setError(getStaffApiError(err, "Không duyệt được đơn đặt sân."));
    } finally {
      setBusyId(null);
    }
  });

  const reject = useExclusiveAction(async (event) => {
    event.preventDefault();
    if (!rejectTarget || !lyDo.trim()) return;
    setBusyId(rejectTarget.id);
    setError("");
    setMessage("");
    try {
      await staffApi.rejectBooking(rejectTarget.id, lyDo.trim());
      setMessage(`Đã từ chối đơn #${rejectTarget.id}.`);
      setRejectTarget(null);
      setLyDo("");
      await loadRequests();
    } catch (err) {
      setError(getStaffApiError(err, "Không từ chối được đơn đặt sân."));
    } finally {
      setBusyId(null);
    }
  });

  return (
    <section className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Nhân viên Trực Page</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Yêu cầu đặt sân</h1>
          <p className="mt-1 text-sm text-slate-500">Các đơn đang chờ xác nhận.</p>
        </div>
        <button type="button" onClick={loadRequests} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">Làm mới</button>
      </div>

      {message && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm font-semibold text-slate-500">Đang tải yêu cầu...</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base font-bold text-slate-800">Không có đơn chờ xác nhận</p>
            <p className="mt-1 text-sm text-slate-500">Đơn mới sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Sân / giờ</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((booking) => (
                  <tr key={booking.id} className="cursor-pointer transition hover:bg-slate-50" onClick={() => setDetail(booking)}>
                    <td className="px-4 py-3 font-extrabold text-slate-900">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{bookingCustomer(booking)}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{bookingPhone(booking)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{booking.tenSan || booking.san?.tenSan || "Chưa cập nhật"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{booking.ngayDat || ""} · {booking.gioBatDau || "--:--"} - {booking.gioKetThuc || "--:--"}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">{formatMoney(booking.gia)}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">CHO_XAC_NHAN</span></td>
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={busyId !== null} onClick={() => approve(booking)} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50">{busyId === booking.id ? "Đang xử lý" : "Duyệt"}</button>
                        <button type="button" disabled={busyId !== null} onClick={() => { setRejectTarget(booking); setLyDo(""); }} className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Từ chối</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={reject} className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <h2 className="text-lg font-black text-slate-950">Từ chối đơn #{rejectTarget.id}</h2>
            <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="reject-reason">Lý do từ chối</label>
            <textarea id="reject-reason" required minLength={3} rows={4} value={lyDo} onChange={(event) => setLyDo(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" placeholder="Nhập lý do để thông báo cho khách" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRejectTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Hủy</button>
              <button type="submit" disabled={busyId !== null} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">{busyId === rejectTarget.id ? "Đang gửi..." : "Xác nhận từ chối"}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export function ScheduleMatrixPage() {
  const [detail, setDetail] = useState(null);
  return (
    <>
      <StaffScheduleMatrix
        title="Sơ đồ ma trận sân"
        subtitle="Theo dõi đơn và trạng thái sân theo ngày. Chọn ô đã có đơn để xem chi tiết."
        onSelectBooking={setDetail}
      />
      <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />
    </>
  );
}
