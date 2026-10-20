import { http, xoaPhien, savePhien } from "./http";
import { sanApi } from "./sanApi";
import { datSanApi } from "./datSanApi";

export const authApi = {
  // Tên tiếng Việt được các màn hình hiện tại sử dụng.
	layLichTrongSan: (sanId, ngay) => sanApi.lichTrong(sanId, ngay),
	layLichSuDatSan: () => datSanApi.datSanCuaToi(),
	layHoaDon: (id) => datSanApi.hoaDon(id),
	huyDatSan: (id) => datSanApi.huyDatSan(id),
	taoDatSan: (sanId, khungGioId, ngayDat, phuongThucThanhToan) => datSanApi.taoDatSan({ sanId, khungGioId, ngayDat, phuongThucThanhToan }),
	taoLinkVNPay: async (datSanId) => {
		const res = await http.post(`/api/thanh-toan/vnpay/create/${datSanId}`, {});
		return res.data;
	},
	dangNhap: async (username, password, remember = true) => {
		const res = await authApi.login({ username, password }, remember);
		return res.data;
	},

  /**
   * 1. Đăng nhập hệ thống
   * @param {Object} credentials - { username/sdt/email, password }
   */
  login: async (credentials, remember = true) => {
    const res = await http("/api/auth/dang-nhap", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Tự động lưu Token và Thông tin phiên làm việc vào LocalStorage nếu thành công
    if (res.data) {
      savePhien(res.data, remember);
    }

    return res;
  },

  /**
   * 2. Đăng ký tài khoản mới (Dành cho Khách hàng)
   * @param {Object} userData - { hoTen, sdt, email, matKhau... }
   */
  register: (userData) => {
    return http("/api/auth/dang-ky", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

	dangKy: async (userData) => {
		const res = await authApi.register(userData);
		return res.data;
	},

  /**
   * 3. Lấy thông tin cá nhân của người dùng đang đăng nhập
   */
  getProfile: () => {
    return http("/api/nguoi-dung/me");
  },

  /**
   * 4. Cập nhật thông tin hồ sơ cá nhân
   * @param {Object} profileData - { hoTen, sdt, email, avatar... }
   */
  updateProfile: (profileData) => {
    return http("/api/nguoi-dung/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  /**
   * 5. Đổi mật khẩu
   * @param {Object} data - { matKhauCu, matKhauMoi }
   */
  doiMatKhau: (dataOrOldPassword, newPassword) => {
    return http("/api/nguoi-dung/doi-mat-khau", {
      method: "PUT",
      body: JSON.stringify(
        typeof dataOrOldPassword === "object"
          ? dataOrOldPassword
          : { matKhauCu: dataOrOldPassword, matKhauMoi: newPassword }
      ),
    });
  },

  /**
   * 6. Quên mật khẩu / Yêu cầu gửi lại mật khẩu
   * @param {Object} data - { email }
   */
  // Deprecated: there is no password recovery endpoint in the current API.
  quenMatKhau: () => Promise.reject(new Error("Vui lòng liên hệ quản trị viên để khôi phục mật khẩu.")),

  /**
   * 7. Đăng xuất khỏi hệ thống
   */
  logout: () => {
    xoaPhien();
    return Promise.resolve({ ok: true });
  },
};

export default authApi;