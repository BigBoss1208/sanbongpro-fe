import { bookingLabel, paymentLabel, methodLabel } from "../utils/statusLabels";
import DialogShell from "../components/DialogShell";
import AuthLayout, { PasswordInput } from "../components/AuthLayout";
import FieldPresentation from "../components/FieldPresentation";
import { useExclusiveAction } from "../utils/useExclusiveAction";
import PropTypes from "prop-types";
import { vietnamDate } from "../api/dates";
import { useState, useEffect } from "react";
import { authApi } from "../api/authApi";
import { getPhien, savePhien } from "../api/http";
import "./Homepage.css";
import "./BookingPage.css";
import "./LoginPage.css";

export { default as HomePage } from "./PremiumHomePage";

// 2. TRANG LỊCH SỬ ĐẶT SÂN (BookingHistoryPage)
export function BookingHistoryPage() {
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoaDon, setHoaDon] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const taiLichSu = () => {
    setLoading(true);
    setError("");
    authApi
      .layLichSuDatSan()
      .then((data) => setDanhSach(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    taiLichSu();
  }, []);

  const handleHuy = useExclusiveAction(async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này?")) return;
    try {
      await authApi.huyDatSan(id);
      alert("Hủy đơn đặt sân thành công!");
      taiLichSu();
    } catch (err) {
      alert(err.message || "Hủy thất bại");
    }
  });

  const tiepTucThanhToan = useExclusiveAction(async (id) => {
    try {
      const response = await authApi.taoLinkVNPay(id);
      window.location.href = response.paymentUrl;
    } catch (err) {
      setError(err.message || "Không thể tiếp tục thanh toán.");
    }
  });

  const xemHoaDon = async (id) => {
    setInvoiceLoading(true);
    try {
      setHoaDon(await authApi.layHoaDon(id));
    } catch (err) {
      setError(err.message || "Không tải được hóa đơn.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="mx-auto my-8 max-w-6xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DA1A32]">Customer account</p>
          <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#0B0F14]">Lịch sử đặt sân</h2>
        </div>
        <button type="button" onClick={taiLichSu} className="w-fit rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-bold text-[#0B0F14] shadow-sm hover:bg-[#f1faf4]">Làm mới</button>
      </div>

      {loading ? (
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-10 text-center text-sm font-semibold text-[#64748B]">Đang tải lịch sử đặt sân...</div>
      ) : error ? (
        <div className="rounded-[12px] border border-red-200 bg-red-50 p-10 text-center text-sm font-semibold text-red-700">{error}</div>
      ) : danhSach.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
          <p className="text-lg font-black text-[#0B0F14]">Bạn chưa có phiếu đặt sân nào.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4faf7] text-[#64748B]">
                <tr>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Mã đơn</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Sân bóng</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Ngày đá</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Khung giờ</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Giá tiền</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Trạng thái</th>
                  <th className="p-3 font-black uppercase tracking-[0.12em]">Thanh toán</th>
                  <th className="p-3 text-right font-black uppercase tracking-[0.12em]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {danhSach.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F8F9FB]">
                    <td className="p-3 font-semibold text-[#0B0F14]">#{item.id}</td>
                    <td className="p-3 font-black text-[#B51228]">{item.tenSan}</td>
                    <td className="p-3 text-[#64748B]">{item.ngayDat}</td>
                    <td className="p-3 font-medium text-[#0B0F14]">{item.gioBatDau} - {item.gioKetThuc}</td>
                    <td className="p-3 font-bold text-[#0B0F14]">{Number(item.gia).toLocaleString("vi-VN")} đ</td>
                    <td className="p-3">
                      <span className={`status-badge ${
                        item.trangThai === "HOAN_THANH" || item.trangThai === "DA_XAC_NHAN" || item.trangThai === "DA_CHECKIN"
                          ? "success"
                          : item.trangThai === "GIU_CHO_TAM"
                          ? "warning"
                          : "error"
                      }`}>
                        {bookingLabel(item.trangThai)}
                      </span>
                    </td>
                    <td className="p-3">{item.canXuLyHoanTien ? "Cần kiểm tra hoàn tiền" : item.trangThaiThanhToan ? paymentLabel(item.trangThaiThanhToan) : "Chưa có giao dịch"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        {item.trangThai === "GIU_CHO_TAM" && (
                          <button onClick={() => tiepTucThanhToan(item.id)} className="rounded-lg bg-[#DA1A32] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#B51228]">Tiếp tục thanh toán</button>
                        )}
                        {item.trangThai !== "DA_HUY" && item.trangThai !== "GIU_CHO_TAM" && (
                          <button onClick={() => xemHoaDon(item.id)} disabled={invoiceLoading} className="rounded-lg border border-[#FFF0F2] bg-[#FFF0F2] px-3 py-1.5 text-xs font-bold text-[#B51228]">Hóa đơn</button>
                        )}
                        {item.trangThai !== "DA_HUY" && item.trangThai !== "HOAN_THANH" && item.trangThai !== "DA_CHECKIN" && (
                          <button onClick={() => handleHuy(item.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100">
                            Hủy đơn
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {hoaDon && (
        <DialogShell label="Hóa đơn đặt sân" onClose={() => setHoaDon(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="invoice-title" className="w-full max-w-lg rounded-[12px] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-3"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#DA1A32]">Biên nhận đặt sân</p><h2 id="invoice-title" className="mt-1 text-xl font-black text-[#0B0F14]">{hoaDon.maHoaDon}</h2></div><button type="button" onClick={() => setHoaDon(null)} aria-label="Đóng hóa đơn" className="text-xl font-bold text-[#64748B]">×</button></div>
            <dl className="mt-3 divide-y divide-[#E5E7EB] text-sm">{[["Khách hàng", hoaDon.tenKhachHang], ["Sân", hoaDon.tenSan], ["Ngày", hoaDon.ngayDat], ["Khung giờ", `${hoaDon.gioBatDau} – ${hoaDon.gioKetThuc}`], ["Tổng tiền", `${Number(hoaDon.gia || 0).toLocaleString("vi-VN")} đ`], ["Trạng thái", bookingLabel(hoaDon.trangThaiDatSan)]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 py-2.5"><dt className="text-[#64748B]">{label}</dt><dd className="text-right font-bold text-[#0B0F14]">{value}</dd></div>)}</dl>
            <div className="mt-4 border-t border-[#E5E7EB] pt-3"><p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#64748B]">Giao dịch</p>{hoaDon.giaoDich?.length ? hoaDon.giaoDich.map((payment) => <div key={payment.id} className="flex justify-between py-1.5 text-xs"><span>{methodLabel(payment.phuongThuc)} · {paymentLabel(payment.trangThai)}</span><span className="font-bold text-[#0B0F14]">{Number(payment.soTien).toLocaleString("vi-VN")} đ</span></div>) : <p className="text-sm text-[#64748B]">Chưa có giao dịch.</p>}</div>
          </section>
        </DialogShell>
      )}
    </div>
  );
}

// 3. TRANG CHI TIẾT SÂN (FieldDetailPage)
export function FieldDetailPage({ fieldId, onNavigate }) {
  const getTodayIso = vietnamDate;
  const formatTime = (value) => {
    if (!value) return "";
    const raw = typeof value === "string" ? value : String(value);
    return raw.length > 5 ? raw.slice(0, 5) : raw;
  };

  const [ngayDat, setNgayDat] = useState(getTodayIso());
  const [reloadKey, setReloadKey] = useState(0);
  const [lichTrong, setLichTrong] = useState([]);
  const [slotChon, setSlotChon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [xuLyDat, setXuLyDat] = useState(false);
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState("VNPAY");

  useEffect(() => {
    if (!fieldId || !ngayDat) return;

    let isMounted = true;
    setLoading(true);
    setError("");
    setSlotChon(null);

    authApi
      .layLichTrongSan(fieldId, ngayDat)
      .then((data) => {
        if (!isMounted) return;
        const mapped = Array.isArray(data)
          ? data.map((slot) => {
              const rawStatus = String(slot?.trangThai || "TRONG").trim().toUpperCase();
              const normalizedStatus =
                rawStatus === "TRONG" || rawStatus === "AVAILABLE" ? "TRONG" :
                rawStatus === "DA_DAT" || rawStatus === "BOOKED" ? "DA_DAT" :
                rawStatus === "KHONG_HOAT_DONG" || rawStatus === "INACTIVE" ? "KHONG_HOAT_DONG" :
                rawStatus;

              return {
                ...slot,
                gioBatDauDisplay: formatTime(slot?.gioBatDau),
                gioKetThucDisplay: formatTime(slot?.gioKetThuc),
                giaNumber: Number(slot?.gia ?? 0),
                trangThai: normalizedStatus,
              };
            })
          : [];

        setLichTrong(mapped);
      })
      .catch((err) => {
        if (!isMounted) return;
        setLichTrong([]);
        setError(err?.message || "Không thể tải khung giờ.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fieldId, ngayDat, reloadKey]);

  const handleDateChange = (nextDate) => {
    setNgayDat(nextDate);
    setSlotChon(null);
  };

  const handleDatSan = useExclusiveAction(async () => {
    if (xuLyDat) return;
    const phien = getPhien();
    if (!phien) {
      alert("Bạn cần đăng nhập để thực hiện đặt sân!");
      onNavigate("login");
      return;
    }

    if (!slotChon || slotChon.trangThai !== "TRONG") {
      alert("Vui lòng chọn một khung giờ còn trống.");
      return;
    }

    setXuLyDat(true);
    try {
      const resDatSan = await authApi.taoDatSan(fieldId, slotChon.khungGioId, ngayDat, phuongThucThanhToan);
      if (phuongThucThanhToan === "VNPAY") {
        try {
          const resPay = await authApi.taoLinkVNPay(resDatSan.id);
          window.location.href = resPay.paymentUrl;
        } catch (err) {
          alert(`Đơn #${resDatSan.id} đã được tạo. ${err.message || "Không tạo được link thanh toán."} Vui lòng tiếp tục thanh toán từ lịch sử đặt sân.`);
          onNavigate("history");
        }
      } else {
        alert(`Đã gửi yêu cầu đặt sân #${resDatSan.id}. Nhân viên sẽ xác nhận thanh toán tại sân.`);
        onNavigate("history");
      }
    } catch (err) {
      alert(err?.message || "Đặt sân thất bại!");
      if (err.status === 409) { setSlotChon(null); setReloadKey((value) => value + 1); }
    } finally {
      setXuLyDat(false);
    }
  });

  return (
    <div className="booking-page">
      <div className="booking-shell">
        <FieldPresentation fieldId={fieldId} onNavigate={onNavigate} />
        <button onClick={() => onNavigate("home")} className="booking-back-link">
          <span aria-hidden="true">←</span> Quay lại danh sách sân
        </button>

        <header className="booking-heading">
          <div>
            <p className="booking-eyebrow">ĐẶT SÂN TRỰC TUYẾN</p>
            <h2>Lịch trống và đặt sân</h2>
            <p className="booking-intro">Chọn ngày thi đấu, khung giờ phù hợp và phương thức thanh toán.</p>
          </div>
          <div className="booking-stepper" aria-label="Các bước đặt sân">
            <span className="booking-step is-current"><b>01</b> Chọn ngày</span>
            <span className="booking-step-divider" aria-hidden="true" />
            <span className={`booking-step${slotChon ? " is-current" : ""}`}><b>02</b> Chọn khung giờ</span>
            <span className="booking-step-divider" aria-hidden="true" />
            <span className={`booking-step${slotChon ? " is-current" : ""}`}><b>03</b> Xác nhận</span>
          </div>
        </header>

        <div className="booking-layout">
          <section className="booking-schedule">
            <div className="booking-panel">
              <div className="booking-panel-heading">
                <span className="booking-panel-icon" aria-hidden="true">01</span>
                <div>
                  <h2>Chọn ngày thi đấu</h2>
                  <p>Lịch trống được cập nhật theo ngày bạn chọn.</p>
                </div>
              </div>
              <label className="booking-date-field">
                <span>Ngày đặt sân</span>
                <input
                  type="date"
                  min={getTodayIso()}
                  value={ngayDat}
                  onChange={(e) => handleDateChange(e.target.value)}
                  aria-label="Chọn ngày đá"
                />
              </label>
            </div>

            <div className="booking-panel booking-availability-panel">
              <div className="booking-availability-heading">
                <div className="booking-panel-heading">
                  <span className="booking-panel-icon" aria-hidden="true">02</span>
                  <div>
                    <h2>Chọn khung giờ</h2>
                    <p>Chọn một khung giờ còn trống để tiếp tục.</p>
                  </div>
                </div>
                <div className="booking-legend" aria-label="Chú thích trạng thái">
                  <span><i className="is-available" /> Còn trống</span>
                  <span><i className="is-selected" /> Đang chọn</span>
                  <span><i className="is-booked" /> Đã đặt</span>
                  <span><i className="is-inactive" /> Không hoạt động</span>
                </div>
              </div>

              {!ngayDat ? (
                <div className="booking-empty-state">
                  <span aria-hidden="true">◷</span>
                  <p>Vui lòng chọn ngày để xem khung giờ.</p>
                </div>
              ) : loading ? (
                <div className="booking-empty-state">
                  <span className="booking-spinner" aria-hidden="true" />
                  <p>Đang tải khung giờ...</p>
                </div>
              ) : error ? (
                <div className="booking-error-state">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((key) => key + 1)}
                  >
                    Thử lại
                  </button>
                </div>
              ) : lichTrong.length === 0 ? (
                <div className="booking-empty-state">
                  <span aria-hidden="true">◷</span>
                  <p>Không có khung giờ trống trong ngày này.</p>
                </div>
              ) : (
                <div className="booking-slots">
                  {lichTrong.map((slot) => {
                    const isBooked = slot.trangThai === "DA_DAT";
                    const isInactive = slot.trangThai === "KHONG_HOAT_DONG";
                    const isSelected = slotChon?.khungGioId === slot.khungGioId;
                    const canChoose = !isBooked && !isInactive && slot.trangThai === "TRONG";

                    return (
                      <button
                        key={slot.khungGioId}
                        type="button"
                        disabled={!canChoose}
                        onClick={() => setSlotChon(slot)}
                        aria-pressed={isSelected}
                        className={`booking-slot ${
                          isBooked
                            ? "is-booked"
                            : isInactive
                            ? "is-inactive"
                            : isSelected
                            ? "is-selected"
                            : "is-available"
                        }`}
                      >
                        <span className="booking-slot-status">
                          {isBooked ? "Đã đặt" : isInactive ? "Không hoạt động" : isSelected ? "Đang chọn" : "Còn trống"}
                        </span>
                        {!isBooked && !isInactive && <span className="booking-slot-mark" aria-hidden="true">{isSelected ? "✓" : "+"}</span>}
                        <strong>{slot.gioBatDauDisplay || "--:--"} – {slot.gioKetThucDisplay || "--:--"}</strong>
                        <span className="booking-slot-price">{Number(slot.giaNumber || 0).toLocaleString("vi-VN")} đ</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="booking-checkout">
            <div className="booking-panel booking-payment-panel">
              <div className="booking-panel-heading">
                <span className="booking-panel-icon" aria-hidden="true">03</span>
                <div>
                  <h2>Thanh toán</h2>
                  <p>Chọn cách thanh toán thuận tiện.</p>
                </div>
              </div>
              <fieldset className="booking-payment-options">
                <legend className="sr-only">Phương thức thanh toán</legend>
                {[
                  { value: "VNPAY", label: "Thanh toán VNPay", detail: "Thanh toán trực tuyến an toàn" },
                  { value: "TIEN_MAT", label: "Tiền mặt tại sân", detail: "Thanh toán trực tiếp khi đến sân" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`booking-payment-option${phuongThucThanhToan === option.value ? " is-active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="phuongThucThanhToan"
                      value={option.value}
                      checked={phuongThucThanhToan === option.value}
                      onChange={(event) => setPhuongThucThanhToan(event.target.value)}
                    />
                    <span className="booking-radio-indicator" aria-hidden="true" />
                    <span className="booking-payment-copy">
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </span>
                  </label>
                ))}
              </fieldset>

              <div className="booking-order-summary">
                <p className="booking-order-summary-title">Tóm tắt đặt sân</p>
                <div>
                  <span>Ngày thi đấu</span>
                  <strong>{ngayDat || "Chưa chọn ngày"}</strong>
                </div>
                <div>
                  <span>Khung giờ</span>
                  <strong>
                    {slotChon
                      ? `${slotChon.gioBatDauDisplay || "--:--"} – ${slotChon.gioKetThucDisplay || "--:--"}`
                      : "Chưa chọn"}
                  </strong>
                </div>
                <div className="booking-order-total">
                  <span>Tổng thanh toán</span>
                  <strong>
                    {slotChon
                      ? `${Number(slotChon.giaNumber || 0).toLocaleString("vi-VN")} đ`
                      : "—"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                disabled={!slotChon || slotChon.trangThai !== "TRONG" || xuLyDat}
                onClick={handleDatSan}
                className="booking-submit"
              >
                {xuLyDat
                  ? "Đang tạo đơn..."
                  : slotChon && slotChon.trangThai === "TRONG"
                  ? `Thanh toán (${Number(slotChon.giaNumber || 0).toLocaleString("vi-VN")} đ)`
                  : "Vui lòng chọn khung giờ trống"}
              </button>
              <p className="booking-secure-note"><span aria-hidden="true">✓</span> Thông tin đặt sân được bảo mật.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 4. TRANG HỒ SƠ CÁ NHÂN (ProfilePage)
export function ProfilePage() {
  const phien = getPhien();
  const [hoTen, setHoTen] = useState(phien?.hoTen || phien?.username || "");
  const [soDienThoai, setSoDienThoai] = useState(phien?.soDienThoai || phien?.sdt || "");
  const [email, setEmail] = useState(phien?.email || "");
  const [avatar, setAvatar] = useState(phien?.avatar || "");
  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhan, setXacNhan] = useState("");
  const [thongBao, setThongBao] = useState({ loai: "", noidung: "" });
  const [dangGui, setDangGui] = useState(false);
  const [dangCapNhat, setDangCapNhat] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileReload, setProfileReload] = useState(0);
  useEffect(() => {
    let active = true;
    setProfileLoading(true); setProfileError("");
    authApi.getProfile().then(({ data }) => {
      if (!active) return;
      setHoTen(data.hoTen || ""); setSoDienThoai(data.soDienThoai || data.sdt || ""); setEmail(data.email || "");
      savePhien({ ...getPhien(), ...data });
    }).catch((err) => { if (active) setProfileError(err.message || "Không tải được hồ sơ."); })
      .finally(() => { if (active) setProfileLoading(false); });
    return () => { active = false; };
  }, [profileReload]);

  const rawName = phien?.hoTen || phien?.username || "Người dùng";
  const nameDisplay = rawName.includes("@") ? rawName.split("@")[0] : rawName;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setThongBao({ loai: "loi", noidung: "Chọn ảnh PNG, JPG, WEBP tối đa 2MB. Ảnh đại diện chỉ lưu trên trình duyệt này." }); return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCapNhatThongTin = useExclusiveAction(async (e) => {
    e.preventDefault();
    if (dangCapNhat || profileLoading || profileError) return;
    setDangCapNhat(true);
    setThongBao({ loai: "", noidung: "" });
    try {
      const res = await authApi.updateProfile({ hoTen, soDienThoai, email });
      const phienMoi = { ...getPhien(), ...res.data, avatar };
      setHoTen(res.data.hoTen || ""); setSoDienThoai(res.data.soDienThoai || res.data.sdt || ""); setEmail(res.data.email || "");
      savePhien(phienMoi);
      setThongBao({ loai: "thanhcong", noidung: "Thông tin cá nhân đã được cập nhật." });
    } catch (err) {
      setThongBao({ loai: "loi", noidung: err.message || "Cập nhật thông tin thất bại" });
    } finally {
      setDangCapNhat(false);
    }
  });

  const handleDoiMatKhau = useExclusiveAction(async (e) => {
    e.preventDefault();
    if (!matKhauCu || !matKhauMoi || !xacNhan) {
      setThongBao({ loai: "loi", noidung: "Vui lòng nhập đầy đủ các trường" });
      return;
    }
    if (matKhauMoi !== xacNhan) {
      setThongBao({ loai: "loi", noidung: "Mật khẩu mới xác nhận không khớp" });
      return;
    }

    setDangGui(true);
    setThongBao({ loai: "", noidung: "" });
    try {
      await authApi.doiMatKhau(matKhauCu, matKhauMoi);
      setThongBao({ loai: "thanhcong", noidung: "Đổi mật khẩu thành công!" });
      setMatKhauCu("");
      setMatKhauMoi("");
      setXacNhan("");
    } catch (err) {
      setThongBao({ loai: "loi", noidung: err.message || "Đổi mật khẩu thất bại" });
    } finally {
      setDangGui(false);
    }
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Account center</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Hồ sơ cá nhân</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý thông tin và bảo mật tài khoản của bạn.</p>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-red-700">{phien?.role || "KHACH_HANG"}</span>
      </div>

      {profileLoading && <p role="status" className="mb-4">Đang tải hồ sơ từ hệ thống...</p>}
      {profileError && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{profileError} <button type="button" onClick={() => setProfileReload((key) => key + 1)}>Thử lại</button></div>}
      <p className="mb-4 text-xs text-slate-500">Ảnh đại diện chỉ lưu trên trình duyệt này, chưa đồng bộ lên hệ thống.</p>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-950 to-slate-900 px-5 py-6 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {avatar ? (
                <img src={avatar} alt="Ảnh đại diện" className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/15" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-400 text-3xl font-black text-emerald-950 ring-4 ring-white/15">
                  {nameDisplay.charAt(0).toUpperCase()}
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 cursor-pointer rounded-full bg-white px-2.5 py-1.5 text-[10px] font-black text-slate-900 shadow-lg hover:bg-emerald-100">
                Đổi ảnh
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-black">{nameDisplay}</h3>
              <p className="mt-1 text-sm text-emerald-200">Tài khoản: {phien?.username || email || "Chưa cập nhật"}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Thông tin cá nhân</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCapNhatThongTin} className="space-y-5 p-5 sm:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">01 / Thông tin cá nhân</p>
            <h3 className="mt-1 text-xl font-black text-slate-950">Thông tin cơ bản</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-600">Họ và tên
              <input value={hoTen} onChange={(e) => setHoTen(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
            </label>
            <label className="text-sm font-bold text-slate-600">Số điện thoại
              <input value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
            </label>
            <label className="text-sm font-bold text-slate-600">Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10" />
            </label>
            <label className="text-sm font-bold text-slate-600">Vai trò trong hệ thống
              <input value={phien?.role || "KHACH_HANG"} readOnly className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-500" />
            </label>
          </div>
          <button type="submit" disabled={dangCapNhat || profileLoading || Boolean(profileError)} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#DA1A32] disabled:opacity-50">
            {dangCapNhat ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">02 / Bảo mật</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">Đổi mật khẩu</h3>
          <p className="mt-1 text-sm text-slate-500">Dùng mật khẩu dài và riêng cho tài khoản này.</p>
        </div>
      {thongBao.noidung && (
        <div
          className={`mb-4 rounded-xl p-3 text-sm ${
            thongBao.loai === "thanhcong" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}
        >
          {thongBao.noidung}
        </div>
      )}

      <form onSubmit={handleDoiMatKhau} className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-bold text-slate-600" htmlFor="guestpages-field-1">Mật khẩu hiện tại</label>
          <input id="guestpages-field-1"
            type="password"
            value={matKhauCu}
            onChange={(e) => setMatKhauCu(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600">Mật khẩu mới <span className="font-normal text-slate-400">(tối thiểu 8 ký tự)</span></label>
          <input
            type="password"
            value={matKhauMoi}
            onChange={(e) => setMatKhauMoi(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-600" htmlFor="guestpages-field-2">Xác nhận mật khẩu mới</label>
          <input id="guestpages-field-2"
            type="password"
            value={xacNhan}
            onChange={(e) => setXacNhan(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
          />
        </div>

        <button
          type="submit"
          disabled={dangGui}
          className="md:col-span-3 w-full rounded-xl bg-[#DA1A32] py-3 text-sm font-black text-white transition hover:bg-[#B51228] disabled:opacity-50"
        >
          {dangGui ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>
      </section>
    </div>
  );
}

// 5. TRANG ĐĂNG KÝ (RegisterPage)
export function RegisterPage({ onNavigate }) {
  const [ho, setHo] = useState("");
  const [ten, setTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [dongY, setDongY] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const handleSubmit = useExclusiveAction(async (e) => {
    e.preventDefault();
    if (!ho || !ten || !soDienThoai || !email || !matKhau) {
      setLoi("Vui lòng điền đầy đủ các thông tin yêu cầu");
      return;
    }
    if (matKhau !== xacNhanMatKhau) {
      setLoi("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!dongY) {
      setLoi("Bạn cần đồng ý với Điều khoản dịch vụ");
      return;
    }

    setLoi("");
    setDangGui(true);
    try {
      await authApi.dangKy({
        username: email || soDienThoai,
        email,
        soDienThoai,
        password: matKhau,
        hoTen: `${ho} ${ten}`.trim(),
      });
      alert("Đăng ký tài khoản thành công!");
      onNavigate("login");
    } catch (err) {
      setLoi(err.message || "Đăng ký thất bại");
    } finally {
      setDangGui(false);
    }
  });

  return <AuthLayout variant="register" onNavigate={onNavigate} title="Tạo tài khoản" subtitle="Tham gia Sân Bóng Pro. Bắt đầu trải nghiệm đặt sân của bạn.">
    {loi && <p className="club-alert" role="alert">{loi}</p>}
    <form onSubmit={handleSubmit} className="club-auth-fields"><div className="club-form-row"><label htmlFor="register-lastname" className="club-form-label">Họ<input id="register-lastname" required autoComplete="family-name" maxLength={50} value={ho} onChange={(event) => setHo(event.target.value)} /></label><label htmlFor="register-firstname" className="club-form-label">Tên<input id="register-firstname" required autoComplete="given-name" maxLength={50} value={ten} onChange={(event) => setTen(event.target.value)} /></label></div>
    <label htmlFor="register-email" className="club-form-label">Email<input id="register-email" required type="email" maxLength={50} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label htmlFor="register-phone" className="club-form-label">Số điện thoại<input id="register-phone" required type="tel" autoComplete="tel" value={soDienThoai} onChange={(event) => setSoDienThoai(event.target.value)} /></label>
    <PasswordInput id="register-password" label="Mật khẩu" value={matKhau} onChange={(event) => setMatKhau(event.target.value)} autoComplete="new-password" />
    <PasswordInput id="register-confirm" label="Xác nhận mật khẩu" value={xacNhanMatKhau} onChange={(event) => setXacNhanMatKhau(event.target.value)} autoComplete="new-password" />
    <label className="club-checkbox"><input type="checkbox" checked={dongY} onChange={(event) => setDongY(event.target.checked)} />Tôi đồng ý với điều khoản sử dụng</label><button type="submit" className="club-button" disabled={dangGui}>{dangGui ? "Đang tạo tài khoản…" : "Tạo tài khoản"}</button></form>
    <p className="club-auth-switch">Đã có tài khoản? <a href="/dang-nhap" onClick={(event) => { event.preventDefault(); onNavigate("login"); }}>Đăng nhập</a></p>
  </AuthLayout>;
}

// 6. TRANG ĐĂNG NHẬP (LoginPage)
export function LoginPage({ onNavigate, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ghiNho, setGhiNho] = useState(true);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  const handleSubmit = useExclusiveAction(async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      setLoi("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }
    setLoi("");
    setDangGui(true);
    try {
      const phien = await authApi.dangNhap(username, password, ghiNho);
      if (onLoginSuccess) onLoginSuccess(phien);
    } catch (err) {
      setLoi(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác");
    } finally {
      setDangGui(false);
    }
  });

  return <AuthLayout onNavigate={onNavigate} title="Đăng nhập" subtitle="Chào mừng bạn trở lại. Đăng nhập để tiếp tục trải nghiệm.">
    {loi && <p className="club-alert" role="alert">{loi}</p>}
    <form onSubmit={handleSubmit} className="club-auth-fields"><label htmlFor="login-username" className="club-form-label">Email hoặc tên đăng nhập<input id="login-username" required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nhập tài khoản của bạn" /></label>
    <PasswordInput id="login-password" label="Mật khẩu" value={password} onChange={(event) => setPassword(event.target.value)} />
    <div className="club-auth-options"><label className="club-checkbox"><input type="checkbox" checked={ghiNho} onChange={(event) => setGhiNho(event.target.checked)} />Ghi nhớ đăng nhập</label><a href="/quen-mat-khau" onClick={(event) => { event.preventDefault(); onNavigate("forgot-password"); }}>Quên mật khẩu?</a></div>
    <button type="submit" className="club-button" disabled={dangGui}>{dangGui ? "Đang đăng nhập…" : "Đăng nhập"}</button></form>
    <p className="club-auth-switch">Chưa có tài khoản? <a href="/dang-ky" onClick={(event) => { event.preventDefault(); onNavigate("register"); }}>Đăng ký ngay</a></p>
  </AuthLayout>;
}

// 7. TRANG QUÊN MẬT KHẨU (ForgotPasswordPage)
export function ForgotPasswordPage({ onNavigate }) {
  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-2xl shadow border text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">QUÊN MẬT KHẨU</h2>
      <p className="text-sm text-gray-500 mb-6">
        Vui lòng liên hệ Quản trị viên hệ thống để khôi phục mật khẩu tài khoản của bạn.
      </p>
      <button
        onClick={() => onNavigate("login")}
        className="text-red-700 font-semibold hover:underline text-sm"
      >
        ← Quay lại trang đăng nhập
      </button>
    </div>
  );
}
FieldDetailPage.propTypes = { fieldId: PropTypes.number.isRequired, onNavigate: PropTypes.func.isRequired };
RegisterPage.propTypes = { onNavigate: PropTypes.func.isRequired };
LoginPage.propTypes = { onNavigate: PropTypes.func.isRequired, onLoginSuccess: PropTypes.func.isRequired };
ForgotPasswordPage.propTypes = { onNavigate: PropTypes.func.isRequired };
