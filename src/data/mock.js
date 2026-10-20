export const FIELDS = [
  {
    id: 1, name: "Sân A1", type: 5, zone: "Quận 1", price: 200000,
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=400&fit=crop&auto=format",
    rating: 4.8, reviews: 124, status: "active",
    description: "Sân cỏ nhân tạo thế hệ mới, đèn LED chất lượng cao, thích hợp thi đấu buổi tối.",
    cluster: "Cụm A",
  },
  {
    id: 2, name: "Sân B1", type: 7, zone: "Quận 3", price: 350000,
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop&auto=format",
    rating: 4.6, reviews: 89, status: "active",
    description: "Sân 7 người tiêu chuẩn, mặt cỏ êm, hệ thống tưới tự động.",
    cluster: "Cụm B",
  },
  {
    id: 3, name: "Sân C1", type: 11, zone: "Quận 7", price: 600000,
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&fit=crop&auto=format",
    rating: 4.9, reviews: 212, status: "active",
    description: "Sân 11 người quy mô lớn, tổ chức giải đấu, có khán đài mini.",
    cluster: "Cụm C",
  },
  {
    id: 4, name: "Sân A2", type: 5, zone: "Quận 1", price: 180000,
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop&auto=format",
    rating: 4.5, reviews: 67, status: "active",
    description: "Sân nhỏ lý tưởng cho nhóm bạn, không gian thoáng, có bãi đỗ xe.",
    cluster: "Cụm A",
  },
  {
    id: 5, name: "Sân B2", type: 7, zone: "Quận Bình Thạnh", price: 300000,
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop&auto=format",
    rating: 4.7, reviews: 143, status: "active",
    description: "Cỏ tự nhiên cao cấp, phù hợp tập luyện và thi đấu nghiêm túc.",
    cluster: "Cụm B",
  },
  {
    id: 6, name: "Sân D1", type: 5, zone: "Quận Tân Bình", price: 220000,
    image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=600&h=400&fit=crop&auto=format",
    rating: 4.4, reviews: 51, status: "hidden",
    description: "Đang nâng cấp hệ thống chiếu sáng, tạm thời ẩn khỏi danh sách công khai.",
    cluster: "Cụm D",
  },
];

export const TIMESLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00",
];

export const SLOT_STATUS = {
  "06:00": "open", "07:00": "booked", "08:00": "booked", "09:00": "open",
  "10:00": "open", "11:00": "held", "13:00": "open", "14:00": "open",
  "15:00": "booked", "16:00": "booked", "17:00": "open", "18:00": "open",
  "19:00": "booked", "20:00": "open", "21:00": "open", "22:00": "open",
};

export const BOOKINGS = [
  { id: "BK001", field: "Sân A1", type: 5, date: "2026-09-05", slot: "18:00", price: 200000, status: "confirmed", customer: "Nguyễn Văn An", phone: "0901234567", payment: "transfer" },
  { id: "BK002", field: "Sân B1", type: 7, date: "2026-09-05", slot: "19:00", price: 350000, status: "pending", customer: "Trần Thị Bình", phone: "0912345678", payment: "cash" },
  { id: "BK003", field: "Sân C1", type: 11, date: "2026-09-06", slot: "07:00", price: 600000, status: "completed", customer: "Lê Văn Cường", phone: "0923456789", payment: "vnpay" },
  { id: "BK004", field: "Sân A2", type: 5, date: "2026-09-04", slot: "20:00", price: 180000, status: "cancelled", customer: "Phạm Thị Dung", phone: "0934567890", payment: "momo" },
  { id: "BK005", field: "Sân B2", type: 7, date: "2026-09-06", slot: "16:00", price: 300000, status: "pending", customer: "Hoàng Văn Em", phone: "0945678901", payment: "cash" },
  { id: "BK006", field: "Sân A1", type: 5, date: "2026-09-07", slot: "09:00", price: 200000, status: "held", customer: "Vũ Thị Phương", phone: "0956789012", payment: "vnpay" },
  { id: "BK007", field: "Sân C1", type: 11, date: "2026-09-03", slot: "14:00", price: 600000, status: "completed", customer: "Đặng Văn Giang", phone: "0967890123", payment: "transfer" },
];

export const CUSTOMERS = [
  { id: "C001", name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0901234567", bookings: 12, spent: 2400000, status: "active", joined: "2025-03-12" },
  { id: "C002", name: "Trần Thị Bình", email: "binh.tran@gmail.com", phone: "0912345678", bookings: 7, spent: 1750000, status: "active", joined: "2025-05-20" },
  { id: "C003", name: "Lê Văn Cường", email: "cuong.le@gmail.com", phone: "0923456789", bookings: 23, spent: 8050000, status: "active", joined: "2024-11-08" },
  { id: "C004", name: "Phạm Thị Dung", email: "dung.pham@gmail.com", phone: "0934567890", bookings: 3, spent: 540000, status: "locked", joined: "2026-01-15" },
  { id: "C005", name: "Hoàng Văn Em", email: "em.hoang@gmail.com", phone: "0945678901", bookings: 18, spent: 5400000, status: "active", joined: "2025-07-03" },
];

export const STAFF_LIST = [
  { id: "S001", name: "Nguyễn Thị Hoa", email: "hoa.nguyen@sanboong.vn", phone: "0901111111", role: "staff", status: "active", joined: "2024-06-01" },
  { id: "S002", name: "Trần Văn Khoa", email: "khoa.tran@sanboong.vn", phone: "0902222222", role: "staff", status: "active", joined: "2024-08-15" },
  { id: "S003", name: "Lê Thị Mai", email: "mai.le@sanboong.vn", phone: "0903333333", role: "admin", status: "active", joined: "2023-01-10" },
  { id: "S004", name: "Phạm Văn Nam", email: "nam.pham@sanboong.vn", phone: "0904444444", role: "staff", status: "locked", joined: "2025-02-20" },
];

export const REVENUE_DATA = [
  { date: "T2", revenue: 4200000, bookings: 14 },
  { date: "T3", revenue: 3800000, bookings: 12 },
  { date: "T4", revenue: 5100000, bookings: 17 },
  { date: "T5", revenue: 4700000, bookings: 15 },
  { date: "T6", revenue: 6300000, bookings: 21 },
  { date: "T7", revenue: 8900000, bookings: 29 },
  { date: "CN", revenue: 7600000, bookings: 25 },
];

export const CLUSTER_REVENUE = [
  { cluster: "Cụm A", revenue: 12400000 },
  { cluster: "Cụm B", revenue: 9800000 },
  { cluster: "Cụm C", revenue: 18600000 },
  { cluster: "Cụm D", revenue: 4200000 },
];

export const TRANSACTIONS = [
  { id: "TX001", booking: "BK001", customer: "Nguyễn Văn An", amount: 200000, method: "transfer", status: "confirmed", date: "2026-09-05 17:30" },
  { id: "TX002", booking: "BK002", customer: "Trần Thị Bình", amount: 350000, method: "cash", status: "pending", date: "2026-09-05 18:15" },
  { id: "TX003", booking: "BK003", customer: "Lê Văn Cường", amount: 600000, method: "vnpay", status: "confirmed", date: "2026-09-06 06:45" },
  { id: "TX004", booking: "BK005", customer: "Hoàng Văn Em", amount: 300000, method: "cash", status: "pending", date: "2026-09-06 15:50" },
];