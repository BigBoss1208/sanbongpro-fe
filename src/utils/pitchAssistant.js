import { normalizedText } from "./courtSearch";

export function answerPitchQuestion(question, fields) {
  const text = normalizedText(question);
  if (/mat khau|tai khoan|dang nhap|dang ky/.test(text)) return { text: "Bạn có thể đăng ký tài khoản mới hoặc đăng nhập bằng email và mật khẩu đã tạo trên website này. Không gửi mật khẩu hay mã OTP vào chat.", links: [{ href: "/dang-nhap", label: "Đăng nhập" }, { href: "/dang-ky", label: "Đăng ký" }] };
  if (/lich su|don cua toi|don dat/.test(text)) return { text: "Đăng nhập rồi mở Lịch sử đặt sân để xem đơn và trạng thái thanh toán của chính bạn. Chatbot không đọc dữ liệu tài khoản hoặc tự xác nhận đơn.", links: [{ href: "/lich-su-dat-san", label: "Lịch sử đặt sân" }] };
  if (/vnpay|thanh toan|hoan tien|huy don/.test(text)) return { text: "Xem phương thức thanh toán và trạng thái trong đơn đặt sân. VNPay chưa được bật trên bản cloud hiện tại. Với hủy đơn hoặc hoàn tiền, hãy kiểm tra thao tác được phép trong lịch sử hoặc liên hệ quản trị; mình không thực hiện giao dịch.", links: [{ href: "/lich-su-dat-san", label: "Kiểm tra đơn" }] };
  if (/cach dat|huong dan|dat san nhu|dat the nao/.test(text)) return { text: "1. Chọn sân và mở chi tiết. 2. Chọn ngày, khung giờ để xem lịch và giá chính xác. 3. Đăng nhập rồi gửi yêu cầu đặt sân. 4. Theo dõi trạng thái trong Lịch sử đặt sân. Chỉ có đơn được hệ thống xác nhận mới là xác nhận đặt sân.", links: [{ href: "/tim-san", label: "Tìm sân" }] };
  if (/trong|hom nay|ngay mai|may gio|lich da/.test(text)) return { text: "Lịch trống thay đổi theo ngày và khung giờ. Bạn hãy chọn sân rồi chọn ngày tại trang chi tiết để kiểm tra trực tiếp. Mình chưa thể xác nhận sân trống chỉ từ danh sách sân.", links: [{ href: "/tim-san", label: "Xem lịch sân" }] };
  if (!/san|gia|re|tu van|goi y|hot|noi bat|bao nhieu|ngan sach|khu vuc|cum/.test(text)) return { text: "Mình hỗ trợ tìm sân, so sánh giá và hướng dẫn đặt sân. Thử hỏi: “Sân 5 giá dưới 400k”, “Sân hot”, “Giá sân” hoặc “Cách đặt sân”." };
  if (!Array.isArray(fields)) throw new Error("Danh sách sân chưa sẵn sàng.");
  let matches = fields.filter(field => field.trangThai === "HOAT_DONG" && Number.isSafeInteger(Number(field.id)) && Number(field.id) > 0);
  const type = text.match(/san\s*(5|7|11)\b/);
  if (type) matches = matches.filter(field => normalizedText(field.loaiSan) === `san ${type[1]}`);
  const budget = text.match(/(?:duoi|toi da|khong qua|ngan sach)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|d|dong)?\b/);
  if (budget) {
    const max = Number(budget[1].replace(",", ".")) * (/^(trieu|tr)$/.test(budget[2]) ? 1000000 : /^(k|nghin|ngan)$/.test(budget[2]) ? 1000 : 1);
    matches = matches.filter(field => field.giaThapNhat != null && Number.isFinite(Number(field.giaThapNhat)) && Number(field.giaThapNhat) >= 0 && Number(field.giaThapNhat) <= max);
  }
  const named = matches.filter(field => [field.tenSan, field.tenCumSan].some(name => name && text.includes(normalizedText(name))));
  if (named.length) matches = named;
  const price = field => field.giaThapNhat != null && Number.isFinite(Number(field.giaThapNhat)) && Number(field.giaThapNhat) >= 0 ? Number(field.giaThapNhat) : Infinity;
  matches.sort((a, b) => price(a) - price(b) || String(a.tenSan).localeCompare(String(b.tenSan), "vi"));
  if (!matches.length) return { text: "Chưa có sân đang hoạt động phù hợp với dữ liệu và ngân sách này. Bạn có thể đổi loại sân, tăng ngân sách hoặc xem toàn bộ danh sách.", links: [{ href: "/tim-san", label: "Xem tất cả sân" }] };
  const hot = /hot|noi bat|pho bien|nhieu nguoi/.test(text);
  return {
    text: `${hot ? "Chưa có thống kê lượt đặt hoặc đánh giá để xếp hạng sân hot. Mình gợi ý các sân đang hoạt động, sắp theo giá thấp nhất. " : "Đây là các sân phù hợp, sắp theo giá thấp nhất. "}Giá “từ” là mức thấp nhất đang được cấu hình, không phải báo giá cho mọi khung giờ. Chọn ngày và giờ tại chi tiết để xem giá thực tế.`,
    fields: matches.slice(0, 4).map(field => ({ id: Number(field.id), name: field.tenSan, type: field.loaiSan, cluster: field.tenCumSan, price: price(field) === Infinity ? null : price(field) })),
  };
}
