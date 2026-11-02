import { normalizedText } from "./courtSearch";

const historyLink = [{ href: "/lich-su-dat-san", label: "Kiểm tra đơn của bạn" }];
const advice = [
  [/quen mat khau|reset|khoi phuc|khong nho mat khau/, "Nếu quên mật khẩu, mở trang Quên mật khẩu để xem phương án hệ thống đang hỗ trợ. Không gửi mật khẩu hoặc OTP ở đây; nếu không có phương án tự khôi phục, cần quản trị hỗ trợ.", [{ href: "/quen-mat-khau", label: "Quên mật khẩu" }]],
  [/huy|hoan tien|doi lich|doi gio|doi ngay/, "Việc hủy, đổi lịch và hoàn tiền phụ thuộc trạng thái đơn và thao tác hệ thống cho phép. Mở lịch sử để kiểm tra đơn cụ thể; không tự đặt đơn mới thay cho việc đổi lịch khi chưa kiểm tra. Mình chưa có chính sách phí/thời hạn được công bố để cam kết hoàn tiền.", historyLink],
  [/tru tien|mat tien|chua cap nhat|cho thanh toan|thanh toan loi|giao dich loi|sai chu ky/, "Nếu ngân hàng đã ghi nhận thanh toán nhưng đơn chưa cập nhật: quay về trang kết quả, mở lịch sử kiểm tra và tránh thanh toán lại ngay. Lưu mã đơn/mã giao dịch để quản trị đối soát. Không gửi số thẻ, OTP hoặc ảnh có dữ liệu ngân hàng vào chat.", historyLink],
  [/check.?in|checkin|den san|toi san|muon gio|tre gio/, "Khi đến sân, chuẩn bị mã đơn và thông tin đặt sân để nhân viên kiểm tra. Check-in được hỗ trợ từ 30 phút trước giờ bắt đầu đến giờ kết thúc đối với đơn đủ điều kiện. Nếu đến muộn, liên hệ quản trị/nhân viên; mình không thể tự gia hạn giờ.", historyLink],
  [/giay|trang phuc|chuan bi|mang gi|khoi dong/, "Bạn nên mang giày phù hợp mặt sân, quần áo thể thao, nước uống và đến sớm để khởi động. Xác nhận loại mặt sân trong mô tả sân; chưa có dữ liệu để khẳng định sân cho thuê giày, bóng hay áo bib."] ,
  [/gui xe|do xe|phong thay|phong tam|nuoc uong|mai che|co nhan tao|tien ich|cho thue|ao bib|thue bong/, "Thông tin tiện ích cần được xác nhận ở mô tả của từng sân. Mình chưa có dữ liệu chắc chắn về bãi xe, phòng tắm, mái che hay dịch vụ thuê đồ, nên không thể hứa các tiện ích này. Mở chi tiết sân để xem mô tả hoặc hỏi quản trị.", [{ href: "/tim-san", label: "Xem mô tả sân" }]],
  [/dia chi|o dau|duong di|ban do|gan toi|gan day|vi tri|lien he|hotline|so dien thoai/, "Danh sách có tên cụm sân, nhưng chatbot chưa được cung cấp địa chỉ, số hotline hoặc vị trí của bạn để tính khoảng cách. Hãy mở chi tiết sân và kiểm tra thông tin cụm sân; mình sẽ không tự tạo địa chỉ hay số điện thoại.", [{ href: "/tim-san", label: "Tìm sân theo cụm" }]],
  [/yeu thich|luu san|trai tim/, "Đăng nhập rồi nhấn biểu tượng trái tim ở sân muốn lưu. Bạn có thể xem hoặc bỏ lưu trong trang Sân yêu thích; lưu yêu thích không giữ chỗ sân.", [{ href: "/yeu-thich", label: "Sân yêu thích" }]],
  [/bao mat|du lieu|lich su chat|ai that|chatgpt|ban la ai|lam duoc gi/, "Mình là trợ lý tự động của Sân Bóng Pro, hiểu câu hỏi theo chủ đề và đọc danh sách sân công khai từ API. Mình hỗ trợ giá, loại sân, ngân sách, cách đặt và xử lý tình huống thường gặp; chưa phải AI tạo sinh. Cuộc trò chuyện chỉ nằm trong phiên trang này, không được gửi sang nhà cung cấp AI."] ,
  [/khuyen mai|giam gia|voucher|ma giam|uu dai|sinh vien/, "Mình chưa có chương trình khuyến mãi hoặc mã giảm giá được xác nhận. Các mức giá mình đưa ra là dữ liệu được cấu hình cho sân; không tự áp dụng ưu đãi sinh viên hay giảm giá."] ,
  [/\bmua\b|thoi tiet|\bbao\b(?! nhieu)|sam set/, "Bạn nên kiểm tra thời tiết gần giờ đá và liên hệ sân nếu có mưa lớn, sấm sét. Mình không có dự báo thời tiết trực tiếp hoặc chính sách bù giờ do mưa để cam kết. Không tiếp tục thi đấu ngoài trời khi có nguy cơ sét."] ,
  [/5 nguoi hay 7|chon loai|bao nhieu nguoi|doi hinh|luat|viet vi|fifa|chuyen thuat/, "Để chọn sân, hãy cho biết đội bạn có bao nhiêu người mỗi bên và ngân sách. Sân 5, sân 7, sân 11 thường tương ứng số cầu thủ mỗi đội; sân mini cần xem mô tả thực tế. Luật thi đấu phụ thuộc thể thức/giải, nên cần thống nhất trước trận. Ví dụ: “Đội 7 người, dưới 400k”."] ,
  [/xin chao|^chao\b|^hello\b|^hi\b|cam on|thank|tam biet/, "Chào bạn ⚽! Mình có thể tìm sân theo số người và ngân sách, so sánh giá, hướng dẫn đặt sân, thanh toán và check-in. Bạn dự định đá sân 5, 7 hay 11 người? Ví dụ: “Tìm sân 7 dưới 500k”."] ,
];

function findAdvice(text) {
  const found = advice.find(([pattern]) => pattern.test(text));
  return found ? { text: found[1], links: found[2] } : null;
}

export function answerPitchQuestion(question, fields, context = {}) {
  const text = normalizedText(question).replace(/(.)\1{2,}/g, "$1$1")
    .replace(/\bko\b|\bkhongg\b|\bkh\b/g, "khong").replace(/\bdc\b/g, "duoc")
    .replace(/\bbooking\b|\bbook\b/g, "dat san").replace(/\blogin\b/g, "dang nhap");
  const faq = findAdvice(text);
  if (faq) return faq;

  if (/mat khau|tai khoan|dang nhap|dang ky/.test(text)) return { text: "Bạn có thể đăng ký tài khoản mới hoặc đăng nhập bằng email và mật khẩu đã tạo trên website này. Không gửi mật khẩu hay mã OTP vào chat.", links: [{ href: "/dang-nhap", label: "Đăng nhập" }, { href: "/dang-ky", label: "Đăng ký" }] };
  if (/lich su|don cua toi|don dat/.test(text)) return { text: "Đăng nhập rồi mở Lịch sử đặt sân để xem đơn và trạng thái thanh toán của chính bạn. Chatbot không đọc dữ liệu tài khoản hoặc tự xác nhận đơn.", links: [{ href: "/lich-su-dat-san", label: "Lịch sử đặt sân" }] };
  if (/vnpay|thanh toan|hoan tien|huy don/.test(text)) return { text: "Xem phương thức thanh toán và trạng thái trong đơn đặt sân. VNPay Sandbox đã được cấu hình trên bản cloud; trạng thái cuối cùng phải được Backend xác minh. Không chuyển tiền thật vào môi trường thử nghiệm. Với hủy đơn hoặc hoàn tiền, hãy kiểm tra thao tác được phép trong lịch sử hoặc liên hệ quản trị; mình không thực hiện giao dịch.", links: [{ href: "/lich-su-dat-san", label: "Kiểm tra đơn" }] };
  if (/cach dat|huong dan|dat san nhu|dat the nao/.test(text)) return { text: "1. Chọn sân và mở chi tiết. 2. Chọn ngày, khung giờ để xem lịch và giá chính xác. 3. Đăng nhập rồi gửi yêu cầu đặt sân. 4. Theo dõi trạng thái trong Lịch sử đặt sân. Chỉ có đơn được hệ thống xác nhận mới là xác nhận đặt sân.", links: [{ href: "/tim-san", label: "Tìm sân" }] };
  if (/trong|hom nay|ngay mai|may gio|lich da/.test(text)) return { text: "Lịch trống thay đổi theo ngày và khung giờ. Bạn hãy chọn sân rồi chọn ngày tại trang chi tiết để kiểm tra trực tiếp. Mình chưa thể xác nhận sân trống chỉ từ danh sách sân.", links: [{ href: "/tim-san", label: "Xem lịch sân" }] };
  if (!/san|gia|re|tu van|goi y|hot|noi bat|bao nhieu|ngan sach|khu vuc|cum|nguoi|mini|futsal|duoi|khoang|tam|doi|tat ca|dat bong/.test(text)) return { text: "Mình hỗ trợ tìm sân, so sánh giá và hướng dẫn đặt sân. Thử hỏi: “Sân 5 giá dưới 400k”, “Sân hot”, “Giá sân” hoặc “Cách đặt sân”." };
  if (!Array.isArray(fields)) throw new Error("Danh sách sân chưa sẵn sàng.");
  let matches = fields.filter(field => field.trangThai === "HOAT_DONG" && Number.isSafeInteger(Number(field.id)) && Number(field.id) > 0);
  const type = text.match(/(?:san\s*|doi\s*|da\s*)(5|7|11)\b/) || text.match(/\b(5|7|11)\s*(?:nguoi|vs|v)\b/);
  const reset = /tat ca|bo loc|lam lai|bat dau lai/.test(text);
  const selectedType = type ? `san ${type[1]}` : reset ? null : context.type;
  const mini = /mini|futsal/.test(text);

  if (mini) matches = matches.filter(field => /mini|futsal/.test(normalizedText(field.loaiSan)));
  else if (selectedType) matches = matches.filter(field => normalizedText(field.loaiSan) === selectedType);
  const budget = text.match(/(?:duoi|toi da|khong qua|ngan sach|tam|khoang|co|con)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|ngan|d|dong)?\b/);
  let maxBudget = reset ? null : context.budget;
  if (budget) {
    maxBudget = Number(budget[1].replace(",", ".")) * (/^(trieu|tr)$/.test(budget[2]) ? 1000000 : /^(k|nghin|ngan)$/.test(budget[2]) ? 1000 : 1);
  }
  if (maxBudget != null) {
    matches = matches.filter(field => field.giaThapNhat != null && Number.isFinite(Number(field.giaThapNhat)) && Number(field.giaThapNhat) >= 0 && Number(field.giaThapNhat) <= maxBudget);
  }
  const nextContext = { type: mini ? null : selectedType, budget: maxBudget };
  const named = matches.filter(field => [field.tenSan, field.tenCumSan].some(name => name && text.includes(normalizedText(name))));
  if (named.length) matches = named;
  const price = field => field.giaThapNhat != null && Number.isFinite(Number(field.giaThapNhat)) && Number(field.giaThapNhat) >= 0 ? Number(field.giaThapNhat) : Infinity;
  matches.sort((a, b) => price(a) - price(b) || String(a.tenSan).localeCompare(String(b.tenSan), "vi"));
  if (!matches.length) return { context: nextContext, text: "Chưa có sân đang hoạt động phù hợp với dữ liệu và ngân sách này. Bạn có thể đổi loại sân, tăng ngân sách hoặc xem toàn bộ danh sách.", links: [{ href: "/tim-san", label: "Xem tất cả sân" }] };
  const hot = /hot|noi bat|pho bien|nhieu nguoi/.test(text);
  return {
    context: nextContext,
    text: `${selectedType ? `Đang tìm ${selectedType.replace("san", "sân")}${maxBudget != null ? `, ngân sách tối đa ${maxBudget.toLocaleString("vi-VN")}đ` : ""}. ` : ""}${hot ? "Chưa có thống kê lượt đặt hoặc đánh giá để xếp hạng sân hot. Mình gợi ý các sân đang hoạt động, sắp theo giá thấp nhất. " : "Đây là các sân phù hợp, sắp theo giá thấp nhất. "}Giá “từ” là mức thấp nhất đang được cấu hình, không phải báo giá cho mọi khung giờ. Chọn ngày và giờ tại chi tiết để xem giá thực tế.`,
    fields: matches.slice(0, 4).map(field => ({ id: Number(field.id), name: field.tenSan, type: field.loaiSan, cluster: field.tenCumSan, price: price(field) === Infinity ? null : price(field) })),
  };
}
