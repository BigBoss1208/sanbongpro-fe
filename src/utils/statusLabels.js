export const bookingLabel = (value) => ({ GIU_CHO_TAM: "Giữ chỗ tạm", CHO_XAC_NHAN: "Chờ xác nhận", DA_XAC_NHAN: "Đã xác nhận", DA_CHECKIN: "Đã check-in", HOAN_THANH: "Hoàn thành", DA_HUY: "Đã hủy" }[value] || value);
export const paymentLabel = (value) => ({ CHO_THANH_TOAN: "Chờ thanh toán", THANH_CONG: "Thành công", THAT_BAI: "Thất bại" }[value] || value);
export const methodLabel = (value) => ({ TIEN_MAT: "Tiền mặt", CHUYEN_KHOAN: "Chuyển khoản", VNPAY: "VNPay" }[value] || value);
export const dayTypeLabel = (value) => ({ TAT_CA: "Tất cả ngày", NGAY_THUONG: "Ngày thường", CUOI_TUAN: "Cuối tuần" }[value] || value);
