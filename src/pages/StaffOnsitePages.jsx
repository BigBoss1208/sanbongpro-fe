import { useExclusiveAction } from "../utils/useExclusiveAction";
import { vietnamDate } from "../api/dates";
import { useEffect, useState } from "react";
import StaffScheduleMatrix from "../components/StaffScheduleMatrix";
import { BookingDetailModal } from "./StaffPagePages";
import { getResponseList, getStaffApiError, staffApi } from "../api/staffApi";

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function localToday() {
  return vietnamDate();
}

export function PosCheckinPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const search = async (event, preserveMessage = false) => {
    event?.preventDefault();
    if (!query.trim()) {
      setError("Nhập mã đơn hoặc số điện thoại để tìm kiếm.");
      return;
    }
    setLoading(true);
    setError("");
    if (!preserveMessage) setMessage("");
    try {
      const { data } = await staffApi.searchBooking(query.trim());
      const bookings = getResponseList(data);
      setResults(bookings);
      if (!bookings.length) setError("Không tìm thấy đơn đặt sân phù hợp.");
    } catch (err) {
      setResults([]);
      setError(getStaffApiError(err, "Không tìm thấy đơn đặt sân phù hợp."));
    } finally {
      setLoading(false);
    }
  };

  const checkIn = useExclusiveAction(async (booking) => {
    setBusyId(booking.id);
    setError("");
    setMessage("");
    try {
      await staffApi.checkIn(booking.id);
      setMessage(`Đã xác nhận check-in cho đơn #${booking.id}.`);
      await search(undefined, true);
    } catch (err) {
      setError(getStaffApiError(err, "Không xác nhận được check-in."));
    } finally {
      setBusyId(null);
    }
  });

  return (
    <section className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Nhân viên Tại Sân</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Quầy Check-in POS</h1>
        <p className="mt-1 text-sm text-slate-500">Tìm đơn bằng mã đặt sân, số điện thoại hoặc dữ liệu quét QR.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus inputMode="search" aria-label="Mã đơn, số điện thoại hoặc QR" placeholder="Mã đơn hoặc SĐT khách" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
          <button type="submit" disabled={loading} className="rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50">{loading ? "Đang tìm..." : "Tìm kiếm"}</button>
        </form>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
        {message && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{message}</p>}
      </div>

      <div className="mt-4 grid gap-3">
        {results.map((booking) => {
          const checkedIn = booking.trangThai === "DA_CHECKIN";
          const canCheckIn = booking.trangThai === "DA_XAC_NHAN";
          return (
            <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">Đơn #{booking.id}</span>
                  <h2 className="mt-2 text-lg font-black text-slate-950">{booking.tenSan || booking.san?.tenSan || "Sân bóng"}</h2>
                </div>
                <p className="text-lg font-black text-red-700">{formatMoney(booking.gia)}</p>
              </div>
              <dl className="grid grid-cols-1 gap-3 py-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div><dt className="text-xs font-semibold text-slate-500">Khách hàng</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.tenKhachHang || booking.khachHang?.hoTen || "Khách đặt sân"}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Số điện thoại</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.soDienThoai || booking.khachHang?.soDienThoai || "Chưa có"}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Ngày đá</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.ngayDat || "Chưa cập nhật"}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Khung giờ</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.gioBatDau || "--:--"} - {booking.gioKetThuc || "--:--"}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Trạng thái</dt><dd className="mt-0.5 font-bold text-slate-900">{booking.trangThai || "Chưa cập nhật"}</dd></div>
              </dl>
              <button type="button" onClick={() => checkIn(booking)} disabled={!canCheckIn || busyId !== null} className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-extrabold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300">
                {busyId === booking.id ? "Đang xác nhận..." : checkedIn ? "Đã check-in" : canCheckIn ? "Xác nhận Check-in" : "Đơn chưa đủ điều kiện check-in"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function WalkinBookingPage() {
  const [ngayDat, setNgayDat] = useState(localToday);
  const [matrix, setMatrix] = useState([]);
  const [sanId, setSanId] = useState("");
  const [khungGioId, setKhungGioId] = useState("");
  const [tenKhachHang, setTenKhachHang] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("TIEN_MAT");
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadingSchedule(true);
    setError("");
    staffApi
      .getScheduleMatrix(ngayDat)
      .then(({ data }) => {
        if (active) setMatrix(Array.isArray(data) ? data : data?.data || []);
      })
      .catch((err) => {
        if (active) setError(getStaffApiError(err, "Không tải được khung giờ trống."));
      })
      .finally(() => {
        if (active) setLoadingSchedule(false);
      });
    return () => {
      active = false;
    };
  }, [ngayDat, reloadKey]);

  const availableFields = matrix
    .map((field) => ({ ...field, slots: (field.slots || []).filter((slot) => slot.trangThai === "TRONG") }))
    .filter((field) => field.slots.length > 0);
  const currentField = availableFields.find((field) => String(field.sanId) === sanId);

  const changeDate = (value) => {
    setNgayDat(value);
    setSanId("");
    setKhungGioId("");
  };

  const submit = useExclusiveAction(async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setCreatedBooking(null);
    if (!["TIEN_MAT", "CHUYEN_KHOAN"].includes(phuongThucThanhToan)) { setError("Chỉ hỗ trợ tiền mặt hoặc chuyển khoản thủ công tại quầy."); return; }
    if (!sanId || !khungGioId) {
      setError("Chọn sân và khung giờ đang trống.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await staffApi.createWalkinBooking({
        sanId: Number(sanId),
        khungGioId: Number(khungGioId),
        ngayDat,
        tenKhachHang: tenKhachHang.trim(),
        soDienThoai: soDienThoai.trim(),
        phuongThucThanhToan,
      });
      setCreatedBooking(data);
      setTenKhachHang("");
      setSoDienThoai("");
      setSanId("");
      setKhungGioId("");
      setReloadKey((value) => value + 1);
    } catch (err) {
      setError(getStaffApiError(err, "Không tạo được đơn tại quầy."));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <section className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-700">Nhân viên Tại Sân</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Đặt sân nhanh tại quầy</h1>
        <p className="mt-1 text-sm text-slate-500">Đơn tại quầy được xác nhận ngay, không qua bước duyệt online.</p>
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {createdBooking && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Đã tạo đơn #{createdBooking.id || "mới"} · trạng thái {createdBooking.trangThai || "DA_XAC_NHAN"}.</p>}

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <label className="block text-sm font-bold text-slate-700">Ngày đặt
          <input type="date" required min={localToday()} value={ngayDat} onChange={(event) => changeDate(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
        </label>
        {loadingSchedule ? (
          <p className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-500">Đang tải sân và giờ trống...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">Sân
              <select required value={sanId} onChange={(event) => { setSanId(event.target.value); setKhungGioId(""); }} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100">
                <option value="">Chọn sân còn trống</option>
                {availableFields.map((field) => <option key={field.sanId} value={field.sanId}>{field.tenSan || `Sân ${field.sanId}`}</option>)}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">Khung giờ trống
              <select required value={khungGioId} onChange={(event) => setKhungGioId(event.target.value)} disabled={!currentField} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100">
                <option value="">Chọn khung giờ</option>
                {currentField?.slots.map((slot) => <option key={slot.khungGioId} value={slot.khungGioId}>{slot.gioBatDau?.slice(0, 5)} - {slot.gioKetThuc?.slice(0, 5)} · {formatMoney(slot.gia)}</option>)}
              </select>
            </label>
          </div>
        )}
        {!loadingSchedule && availableFields.length === 0 && <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">Không có khung giờ trống trong ngày đã chọn.</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Tên khách hàng
            <input required value={tenKhachHang} onChange={(event) => setTenKhachHang(event.target.value)} autoComplete="name" className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Số điện thoại
            <input required type="tel" value={soDienThoai} onChange={(event) => setSoDienThoai(event.target.value)} autoComplete="tel" className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" />
          </label>
        </div>

        <label className="block text-sm font-bold text-slate-700">Phương thức thanh toán
          <select value={phuongThucThanhToan} onChange={(event) => setPhuongThucThanhToan(event.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-medium outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100">
            <option value="TIEN_MAT">Tiền mặt</option>
            <option value="CHUYEN_KHOAN">Chuyển khoản — xác nhận thủ công</option>
            <option value="VNPAY" disabled>VNPay tại quầy chưa được hỗ trợ</option>
          </select>
        </label>

        <button type="submit" disabled={submitting || loadingSchedule || availableFields.length === 0} className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-extrabold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Đang tạo đơn..." : "Tạo đơn tại quầy"}</button>
      </form>
    </section>
  );
}

export function ScheduleMatrixPage() {
  const [detail, setDetail] = useState(null);
  return (
    <>
      <StaffScheduleMatrix
        title="Sơ đồ ma trận sân"
        subtitle="Xem nhanh tình trạng sân trong ngày để phục vụ khách tại quầy."
        onSelectBooking={setDetail}
      />
      <BookingDetailModal booking={detail} onClose={() => setDetail(null)} />
    </>
  );
}
