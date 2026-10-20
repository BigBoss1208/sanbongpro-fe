import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { http, getPhien } from "../api/http";

const labels = { SUCCESS: "Thanh toán thành công", FAILED: "Thanh toán thất bại hoặc đã hủy tại VNPay", CANCELLED: "Đơn đặt sân đã hủy", VERIFYING: "Đang xác minh thanh toán", REFUND_REVIEW: "Giao dịch cần kiểm tra hoàn tiền" };
export default function PaymentResultPage({ onNavigate }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const reference = new URLSearchParams(window.location.search).get("ref");
  const signedIn = !!getPhien();
  useEffect(() => {
    if (!reference || !signedIn) return;
    let cancelled = false;
    let timer;
    let attempts = 0;
    const load = async () => {
      try {
        const response = await http.get(`/api/thanh-toan/vnpay/status/${encodeURIComponent(reference)}`);
        if (cancelled) return;
        setResult(response.data); setError("");
        if (response.data.status === "VERIFYING" && ++attempts < 20) timer = setTimeout(load, 3000);
      } catch (err) { if (!cancelled) setError(err.message || "Chưa lấy được trạng thái thanh toán. Vui lòng kiểm tra lịch sử."); }
    };
    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reference, signedIn]);
  return <section className="rounded-2xl bg-white p-6 shadow-sm mx-auto my-8 max-w-xl" aria-live="polite">
    <h1 className="text-2xl font-bold">{labels[result?.status] || labels.VERIFYING}</h1>
    <p className="my-4">{!reference ? "Thiếu mã tham chiếu. Hãy kiểm tra lịch sử đặt sân." : !signedIn ? "Vui lòng đăng nhập để xem trạng thái đã xác thực của đơn." : error || (result?.status === "VERIFYING" ? "Hệ thống đang chờ xác nhận từ VNPay. Bạn có thể kiểm tra lại trong lịch sử đặt sân." : "Kết quả được lấy từ Backend, không dựa vào tham số trên trình duyệt.")}</p>
    {result && <p className="mb-4">Đơn #{result.bookingId} · {Number(result.amount).toLocaleString("vi-VN")} đ</p>}
    <button className="club-button" onClick={() => onNavigate("history")}>{signedIn ? "Xem lịch sử đặt sân" : "Đăng nhập"}</button>
  </section>;
}
PaymentResultPage.propTypes = { onNavigate: PropTypes.func.isRequired };
