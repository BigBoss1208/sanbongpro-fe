export const PUBLIC_NAV = [
 { label: "Trang chủ", page: "home", href: "/" },
 { label: "Tìm sân", page: "search", href: "/tim-san" },
 { label: "Sân nổi bật", page: "featured", href: "/#courts" },
 { label: "Sân yêu thích", page: "favorites", href: "/yeu-thich" },
 { label: "Về chúng tôi", page: "about", href: "/#about" },
];
export const NAV = {
  admin: [
    { label: "Tổng quan", icon: "📊", page: "dashboard" },
    { label: "Quản lý Sân Bóng", icon: "⚽", page: "quan-ly-san" },
    { label: "Khung giờ và giá", icon: "🕒", page: "khung-gio-gia" },
    { label: "Cụm sân", icon: "📍", page: "cum-san" },
    { label: "Thanh toán", icon: "💳", page: "thanh-toan" },
    { label: "Quản lý Khách Hàng", icon: "👥", page: "khach-hang" },
    { label: "Quản lý Nhân Viên", icon: "👨‍💼", page: "nhan-vien" },
    { label: "Thống kê doanh thu", icon: "💰", page: "doanh-thu" },
    { label: "Xuất báo cáo", icon: "📄", page: "bao-cao" },
  ],
  staff_page: [
    { label: "Yêu cầu đặt sân", icon: "📋", page: "staffpage-requests" },
    { label: "Sơ đồ ma trận sân", icon: "📊", page: "staffpage-matrix" },
  ],
  staff_onsite: [
    { label: "Thu tiền tại sân", icon: "💳", page: "onsite-payments" },
    { label: "Quầy Check-in POS", icon: "🎫", page: "onsite-pos" },
    { label: "Đặt sân nhanh tại quầy", icon: "⚡", page: "onsite-walkin" },
    { label: "Sơ đồ ma trận sân", icon: "📊", page: "onsite-matrix" },
  ],
  customer: [
    { label: "Tìm sân", icon: "⚽", page: "search" },
    { label: "Lịch sử đặt sân", icon: "📜", page: "history" },
    { label: "Sân yêu thích", icon: "♥", page: "favorites" },
  ],
};

export const ROLE_LABELS = {
  guest: "Khách",
  customer: "Khách hàng",
  staff_page: "Nhân viên Trực Page",
  staff_onsite: "Nhân viên Tại Sân",
  admin: "Quản trị viên",
};

export const ROLE_COLORS = {
  guest: "bg-slate-100 text-slate-700",
  customer: "bg-emerald-100 text-emerald-800",
  staff_page: "bg-blue-100 text-blue-800",
  staff_onsite: "bg-orange-100 text-orange-800",
  admin: "bg-slate-200 text-slate-900",
};
