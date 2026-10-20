import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getStaffApiError, staffApi } from "../api/staffApi";

function todayLocal() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function slotTone(status) {
  if (status === "KHONG_HOAT_DONG") return "border-slate-200 bg-slate-100 text-slate-500";
  if (["DA_DAT", "DA_XAC_NHAN", "HOAN_THANH", "DA_CHECKIN"].includes(status)) {
    return "border-red-200 bg-red-50 text-red-900";
  }
  if (["GIU_CHO_TAM", "CHO_THANH_TOAN", "CHO_XAC_NHAN"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-950";
}

function slotLabel(status) {
  if (status === "KHONG_HOAT_DONG") return "Không thể đặt mới";
  if (["DA_DAT", "DA_XAC_NHAN", "HOAN_THANH", "DA_CHECKIN"].includes(status)) return "Đã đặt";
  if (["GIU_CHO_TAM", "CHO_THANH_TOAN", "CHO_XAC_NHAN"].includes(status)) return "Giữ chỗ tạm";
  return "Trống";
}

export default function StaffScheduleMatrix({ title, subtitle, onSelectBooking }) {
  const [ngay, setNgay] = useState(todayLocal);
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    staffApi
      .getScheduleMatrix(ngay)
      .then(({ data }) => {
        if (active) setMatrix(Array.isArray(data) ? data : data?.data || []);
      })
      .catch((err) => {
        if (active) setError(getStaffApiError(err, "Không tải được ma trận sân."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ngay]);

  const slotColumns = Array.from(
    new Map(
      matrix
        .flatMap((field) => field.slots || [])
        .map((slot) => [slot.khungGioId, slot])
    ).values()
  ).sort((left, right) => (left.gioBatDau || "").localeCompare(right.gioBatDau || ""));

  return (
    <section className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Vận hành sân bóng</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Ngày</span>
          <input
            aria-label="Chọn ngày xem lịch sân"
            type="date"
            value={ngay}
            onChange={(event) => setNgay(event.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
          />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-200" /> Trống
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
          <span className="h-3 w-3 rounded-sm bg-amber-300" /> Giữ chỗ tạm
        </span>
        <span className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2">
          <span className="h-3 w-3 rounded-sm bg-red-300" /> Đã đặt
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500 shadow-sm">
          Đang tải lịch sân...
        </div>
      ) : matrix.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500">
          Không có dữ liệu sân trong ngày đã chọn.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div
            className="grid min-w-max"
            style={{ gridTemplateColumns: `minmax(180px, 220px) repeat(${slotColumns.length}, minmax(140px, 1fr))` }}
          >
            <div className="sticky left-0 z-10 border-b border-r border-slate-200 bg-slate-50 p-3 text-xs font-black uppercase tracking-wide text-slate-600">
              Sân bóng
            </div>
            {slotColumns.map((slot) => (
              <div key={slot.khungGioId} className="border-b border-r border-slate-200 bg-slate-50 p-3 text-center text-xs font-black text-slate-700">
                {slot.gioBatDau?.slice(0, 5)} - {slot.gioKetThuc?.slice(0, 5)}
              </div>
            ))}

            {matrix.map((field) => {
              const slotsById = new Map((field.slots || []).map((slot) => [slot.khungGioId, slot]));
              return (
                <div key={field.sanId} className="contents">
                  <div className="sticky left-0 z-[1] border-b border-r border-slate-200 bg-white p-3">
                    <p className="text-sm font-extrabold text-slate-900">{field.tenSan || `Sân ${field.sanId}`}</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">{field.loaiSan || "Sân bóng"}</p>
                  </div>
                  {slotColumns.map((column) => {
                    const slot = slotsById.get(column.khungGioId);
                    if (!slot) {
                      return <div key={column.khungGioId} className="border-b border-r border-slate-200 bg-slate-50/60 p-2" />;
                    }
                    const status = slot.trangThai || "TRONG";
                    const isOccupied = Boolean(slot.datSanId);
                    const booking = {
                      ...slot,
                      id: slot.datSanId ?? slot.id,
                      sanId: field.sanId,
                      tenSan: field.tenSan,
                      ngayDat: ngay,
                      trangThai: status,
                    };
                    const SlotElement = isOccupied ? "button" : "div";

                    return (
                      <div key={slot.khungGioId} className="border-b border-r border-slate-200 p-2">
                        <SlotElement
                          type={isOccupied ? "button" : undefined}
                          onClick={isOccupied ? () => onSelectBooking?.(booking) : undefined}
                          disabled={isOccupied ? undefined : undefined}
                          className={`flex min-h-[82px] w-full flex-col justify-center rounded-lg border px-2 py-2 text-center ${slotTone(status)} ${isOccupied ? "cursor-pointer transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-red-600" : ""}`}
                        >
                          <span className="text-[11px] font-black">{slotLabel(status)}</span>
                          <span className="mt-1 text-xs font-bold">{Number(slot.gia || 0).toLocaleString("vi-VN")} đ</span>
                          {slot.tenKhachHang && <span className="mt-1 max-w-full truncate text-[11px]">{slot.tenKhachHang}</span>}
                        </SlotElement>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

StaffScheduleMatrix.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  onSelectBooking: PropTypes.func,
};
