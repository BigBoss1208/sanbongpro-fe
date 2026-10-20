import { useExclusiveAction } from "../utils/useExclusiveAction";
import { useState } from "react";
// Deprecated standalone registration page; use RegisterPage in the current app.
import { authApi } from "../api/authApi";

export default function DangKy() {
  const navigate = (path) => { window.history.pushState(null, "", path); window.dispatchEvent(new PopStateEvent("popstate")); };

  const [formData, setFormData] = useState({
    ho: "",
    ten: "",
    soDienThoai: "",
    email: "",
    matKhau: "",
    xacNhanMatKhau: "",
    dongYDieuKhoan: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = useExclusiveAction(async (e) => {
    e.preventDefault();
    setError("");

    // Validate dữ liệu
    if (!formData.dongYDieuKhoan) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật");
      return;
    }

    if (formData.matKhau !== formData.xacNhanMatKhau) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.email || formData.soDienThoai,
        email: formData.email,
        soDienThoai: formData.soDienThoai,
        password: formData.matKhau,
        hoTen: `${formData.ho} ${formData.ten}`.trim(),
      };

      await authApi.dangKy(payload);
      alert("Đăng ký tài khoản thành công!");
      navigate("/dang-nhap");
    } catch (err) {
      setError(err.message || "Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col justify-center items-center p-4">
      {/* Header / Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white text-xl">
          ⚽
        </div>
        <div className="text-white font-bold text-xl">
          SÂNBÓNG <br />
          <span className="text-xs text-emerald-300 font-normal">
            Đặt sân bóng đá online
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-black text-center text-gray-800 tracking-wide uppercase">
          TẠO TÀI KHOẢN
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Đăng ký để đặt sân dễ dàng hơn
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        {/* THÊM ONSUBMIT VÀO FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-1">
                Họ
              </label>
              <input id="dangky-field-1"
                type="text"
                name="ho"
                required
                value={formData.ho}
                onChange={handleChange}
                placeholder="NgoQuang"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-2">
                Tên
              </label>
              <input id="dangky-field-2"
                type="text"
                name="ten"
                required
                value={formData.ten}
                onChange={handleChange}
                placeholder="Manh"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-3">
              Số điện thoại
            </label>
            <input id="dangky-field-3"
              type="tel"
              name="soDienThoai"
              required
              value={formData.soDienThoai}
              onChange={handleChange}
              placeholder="0962022716"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-4">
              Email
            </label>
            <input id="dangky-field-4"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="hdbwh31@gmail.com"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-5">
              Mật khẩu
            </label>
            <input id="dangky-field-5"
              type="password"
              name="matKhau"
              required
                minLength={8}
              value={formData.matKhau}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dangky-field-6">
              Xác nhận mật khẩu
            </label>
            <input id="dangky-field-6"
              type="password"
              name="xacNhanMatKhau"
              required
              value={formData.xacNhanMatKhau}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 pt-2">
            <input
              type="checkbox"
              id="dongYDieuKhoan"
              name="dongYDieuKhoan"
              checked={formData.dongYDieuKhoan}
              onChange={handleChange}
              className="rounded text-red-700 focus:ring-red-600 cursor-pointer"
            />
            <label htmlFor="dongYDieuKhoan" className="cursor-pointer">
              Tôi đồng ý với{" "}
              <span className="text-red-700 font-semibold">
                Điều khoản dịch vụ
              </span>{" "}
              và{" "}
              <span className="text-red-700 font-semibold">
                Chính sách bảo mật
              </span>
            </label>
          </div>

          {/* NÚT BẤM CÓ TYPE SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#DA1A32] hover:bg-[#B51228] text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-md disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Đã có tài khoản?{" "}
          <a
            href="/dang-nhap"
            className="text-red-700 font-semibold hover:underline"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}