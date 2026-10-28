import { fieldImageUrl } from "../utils/fieldImage";
import { loadImageUrl } from "../utils/imageUrl";
import DialogShell from "../components/DialogShell";
import { RevenueLineChart, FieldTypeChart } from "../components/DashboardCharts";
import { useExclusiveAction } from "../utils/useExclusiveAction";
import { vietnamDate, daysBefore, validDateRange } from "../api/dates";
import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/adminApi";
import { ImageUploadField } from "../components/ui";

// ==========================================
// 1. DASHBOARD QUẢN TRỊ
// ==========================================
export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    tongDoanhThuTuan: 0,
    tongKhachHang: 0,
    tongNhanVien: 0,
    tongLuotDat: 0,
    doanhThuTheoNgay: [],
    doanhThuTheoCum: {},
  });

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    setLoading(true); setStats((prev) => ({ ...prev, error: "" }));
    let active = true;
    Promise.all([adminApi.getDashboard(), adminApi.getSanBong()]).then(([res, fieldRes]) => {
      if (active) { setStats(res.data); setInventory(fieldRes.data || []); }
    }).catch((err) => { if (active) setStats((prev) => ({ ...prev, error: err.message || "Không thể tải dashboard." })); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  if (loading) return <p role="status" className="p-8">Đang tải tổng quan...</p>;
  if (stats.error) return <div role="alert" className="p-8 text-red-700">{stats.error} <button onClick={() => setReloadKey((key) => key + 1)}>Thử lại</button></div>;
  const statCards = [
    { label: "Tổng sân bóng", value: inventory.length, unit: "sân", icon: "⚽", className: "bg-red-50" },
    { label: "Đơn đặt tuần này", value: stats.tongLuotDat || 0, unit: "đơn", icon: "▦", className: "bg-green-50" },
    { label: "Doanh thu tuần", value: ((stats.tongDoanhThuTuan || 0) / 1000000).toFixed(2), unit: "triệu đ", icon: "↗", className: "bg-amber-50" },
    { label: "Khách hàng", value: stats.tongKhachHang || 0, unit: "người", icon: "♙", className: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-[#F5F6F8] p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#DA1A32]">Trung tâm điều hành</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#0B0F14]">Tổng quan</h1>
        </div>
        <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] shadow-sm">
          Dữ liệu từ hệ thống
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.className} text-xl`}>
              {card.icon}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">{card.label}</span>
              <div className="mt-1 text-2xl font-black text-[#0B0F14]">
                {card.value}
                <span className="ml-1 text-xs font-semibold text-[#64748B]">{card.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Doanh thu theo ngày</h3>
            <span className="rounded-full bg-[#FFF0F2] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#B51228]">Tuần này</span>
          </div>
          <RevenueLineChart rows={stats.doanhThuTheoNgay || []} />
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <h3 className="text-[11px] font-black uppercase tracking-[0.1em] text-[#64748B]">Tỷ lệ loại sân</h3>
          <FieldTypeChart fields={inventory} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. QUẢN LÝ SÂN BÓNG (TÍCH HỢP UPLOAD MINIO)
// ==========================================
export function AdminQuanLySanPage() {
  const [fields, setFields] = useState([]);
  const [cumSanList, setCumSanList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TAT_CA");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tenSan: "",
    loaiSan: "Sân 5",
    cumSanId: "",
    moTa: "",
    hinhAnh: "",
    trangThai: "HOAT_DONG",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sanRes, cumRes] = await Promise.all([adminApi.getSanBong(), adminApi.getCumSan()]);
      if (!Array.isArray(sanRes?.data) || !Array.isArray(cumRes?.data)) throw new Error("API trả danh sách quản trị không hợp lệ.");
      setFields(sanRes.data);
      setCumSanList(Array.isArray(cumRes?.data) ? cumRes.data : []);
    } catch (err) {
      setError(err.status === 405 ? "GET /api/admin/san bị Backend từ chối (HTTP 405). Kiểm tra Backend đang chạy bản có endpoint GET quản trị và API_BASE_URL." : err.message || "Không thể tải dữ liệu sân bóng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFields = fields.filter((field) => {
    const text = `${field.tenSan || ""} ${field.tenCumSan || ""} ${field.loaiSan || ""}`.toLowerCase();
    const matchesText = !searchTerm || text.includes(searchTerm.toLowerCase());
    const statusValue = field.trangThai || "HOAT_DONG";
    const matchesStatus = statusFilter === "TAT_CA" || statusValue === statusFilter;
    return matchesText && matchesStatus;
  });

  const handleUploadAnhMinIO = useExclusiveAction(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) { setFormError("Chọn ảnh PNG/JPG/WEBP tối đa 10MB."); return; }
    setUploading(true);
    setFormError("");
    try {
      const res = await adminApi.uploadMinIO(file);
      const imageUrl = res?.url || res?.data?.url || "";
      const objectKey = res?.objectKey || res?.data?.objectKey;
      if (!objectKey) throw new Error("API chưa trả object key ảnh.");
      setImageUrlDraft("");
      setImagePreview(imageUrl);
      setFormData((prev) => ({ ...prev, hinhAnh: objectKey }));
    } catch (err) {
      setFormError(err?.message || "Không thể tải ảnh lên MinIO.");
    } finally {
      setUploading(false);
    }
  });

  const openAddModal = () => {
    setImageUrlDraft("");
    setEditingItem(null);
    setImagePreview("");
    setFormData({
      tenSan: "",
      loaiSan: "Sân 5",
      cumSanId: cumSanList[0]?.id || "",
      moTa: "",
      hinhAnh: "",
      trangThai: "HOAT_DONG",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (field) => {
    setImageUrlDraft("");
    setEditingItem(field);
    setImagePreview("");
    if (field.hinhAnh) setImagePreview(fieldImageUrl(field.hinhAnh));
    setFormData({
      tenSan: field.tenSan || "",
      loaiSan: field.loaiSan || "Sân 5",
      cumSanId: field.cumSanId || "",
      moTa: field.moTa || "",
      hinhAnh: field.hinhAnh || "",
      trangThai: field.trangThai || "HOAT_DONG",
    });
    setFormError("");
    setShowModal(true);
  };

  const applyImageUrl = useExclusiveAction(async () => {
    setUploading(true);
    setFormError("");
    try {
      const url = await loadImageUrl(imageUrlDraft);
      setImagePreview(url);
      setFormData((prev) => ({ ...prev, hinhAnh: url }));
      setImageUrlDraft("");
    } catch (err) { setFormError(err.message); }
    finally { setUploading(false); }
  });

  const handleSave = useExclusiveAction(async () => {
    if (saving || uploading) return;
    if (imageUrlDraft.trim()) { setFormError("Bấm Dùng URL ảnh để kiểm tra ảnh trước khi lưu."); return; }
    if (!formData.tenSan.trim()) {
      setFormError("Vui lòng nhập tên sân.");
      return;
    }

    const payload = {
      tenSan: formData.tenSan.trim(),
      loaiSan: formData.loaiSan,
      hinhAnh: formData.hinhAnh || "",
      moTa: formData.moTa || "",
      cumSanId: formData.cumSanId || null,
    };

    setSaving(true);
    try {
      let savedData;
      if (editingItem) {
        savedData = await adminApi.suaSanBong(editingItem.id, payload);
        if ((formData.trangThai || "HOAT_DONG") !== (editingItem.trangThai || "HOAT_DONG")) {
          await adminApi.updateTrangThaiSan(editingItem.id, formData.trangThai || "HOAT_DONG");
        }
      } else {
        savedData = await adminApi.themSanBong(payload);
        if ((formData.trangThai || "HOAT_DONG") !== "HOAT_DONG") {
          await adminApi.updateTrangThaiSan(savedData?.id || savedData?.data?.id, formData.trangThai || "HOAT_DONG");
        }
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setFormError(err?.message || "Lỗi khi lưu dữ liệu sân bóng.");
    } finally { setSaving(false); }
  });

  const handleDelete = useExclusiveAction(async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sân bóng này khỏi hệ thống?")) return;
    try {
      await adminApi.xoaSanBong(id);
      await loadData();
    } catch (err) {
      alert(err?.message || "Xóa sân thất bại!");
    }
  });

  const handleToggleStatus = useExclusiveAction(async (field) => {
    const nextStatus = field.trangThai === "HOAT_DONG" ? "TAM_NGUNG" : "HOAT_DONG";
    try {
      await adminApi.updateTrangThaiSan(field.id, nextStatus);
      await loadData();
    } catch (err) {
      alert(err?.message || "Không thể cập nhật trạng thái sân.");
    }
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Field management</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">QUẢN LÝ SÂN BÓNG</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Theo dõi trạng thái, ảnh và lịch sử hoạt động của từng sân.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-xl bg-[#DA1A32] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-none transition hover:bg-[#B51228]"
        >
          + Thêm sân mới
        </button>
      </div>

      {loading && <p role="status">Đang tải danh sách...</p>}
      {error && <p role="alert" className="text-red-700">{error} <button type="button" onClick={loadData}>Thử lại</button></p>}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.3fr_220px_190px]">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm sân</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên sân, cụm sân, loại sân"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
            />
          </label>

          <select aria-label="Lọc trạng thái sân"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
          >
            <option value="TAT_CA">Tất cả trạng thái</option>
            <option value="HOAT_DONG">Hoạt động</option>
            <option value="TAM_NGUNG">Tạm ngưng</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700"
          >
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm font-semibold text-slate-500">
          Đang tải dữ liệu sân...
        </div>
      ) : filteredFields.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm font-semibold text-slate-500">
          Không tìm thấy sân phù hợp. Thử thay đổi từ khóa hoặc bộ lọc.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Hình ảnh</th>
                  <th className="px-4 py-3">Tên sân</th>
                  <th className="px-4 py-3">Loại sân</th>
                  <th className="px-4 py-3">Cụm sân</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFields.map((field) => (
                  <tr key={field.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <img
                        src={fieldImageUrl(field.hinhAnh)}
                        onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/assets/court-placeholder.svg"; }}
                        alt={field.tenSan}
                        className="h-14 w-20 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-black text-slate-900">{field.tenSan}</div>
                    </td>
                    <td className="px-4 py-3">{field.loaiSan || "Sân 5"}</td>
                    <td className="px-4 py-3">{field.tenCumSan || "Chưa phân cụm"}</td>
                    <td className="px-4 py-3 font-bold text-red-700">
                      {field.giaThapNhat ? `${Number(field.giaThapNhat).toLocaleString("vi-VN")} đ` : "Chưa có giá"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
                        field.trangThai === "HOAT_DONG"
                          ? "bg-emerald-50 text-red-700"
                          : field.trangThai === "TAM_NGUNG"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {field.trangThai === "HOAT_DONG" ? "Hoạt động" : field.trangThai === "TAM_NGUNG" ? "Tạm ngưng" : field.trangThai || "Hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(field)}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700"
                        >
                          {field.trangThai === "HOAT_DONG" ? "Tạm ngưng" : "Kích hoạt"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(field)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(field.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <DialogShell label="Biểu mẫu quản trị" onClose={() => { if (!saving && !uploading) setShowModal(false); }}>
          <div className="my-auto max-h-[calc(100dvh-4rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-red-700">Field form</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">{editingItem ? "Sửa sân bóng" : "Thêm sân bóng"}</h2>
              </div>
              <button type="button" onClick={() => { if (!saving && !uploading) setShowModal(false); }} className="rounded-full bg-slate-100 px-2.5 py-1 text-lg font-bold text-slate-600">
                ×
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="adminpages-field-1">Tên sân</label>
                <input id="adminpages-field-1"
                  type="text"
                  value={formData.tenSan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tenSan: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                  placeholder="Nhập tên sân"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="adminpages-field-2">Cụm sân</label>
                <select id="adminpages-field-2"
                  value={formData.cumSanId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cumSanId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Chưa phân cụm</option>
                  {cumSanList.map((cum) => (
                    <option key={cum.id} value={cum.id}>{cum.tenCum || cum.name || `Cụm ${cum.id}`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="adminpages-field-3">Loại sân</label>
                <select id="adminpages-field-3"
                  value={formData.loaiSan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, loaiSan: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="Sân 5">Sân 5</option>
                  <option value="Sân 7">Sân 7</option>
                  <option value="Sân 11">Sân 11</option>
                  <option value="Sân mini">Sân mini</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="adminpages-field-4">Mô tả</label>
                <textarea id="adminpages-field-4"
                  value={formData.moTa}
                  onChange={(e) => setFormData((prev) => ({ ...prev, moTa: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                  placeholder="Mô tả sân, tiện ích, vị trí..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="adminpages-field-5">Trạng thái</label>
                <select id="adminpages-field-5"
                  value={formData.trangThai}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trangThai: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="HOAT_DONG">Hoạt động</option>
                  <option value="TAM_NGUNG">Tạm ngưng</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="pitch-image-url" className="mb-1.5 block text-sm font-semibold text-slate-700">URL ảnh HTTPS</label>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                  <input id="pitch-image-url" type="url" maxLength={255} value={imageUrlDraft}
                    disabled={uploading || saving} onChange={(e) => setImageUrlDraft(e.target.value)}
                    placeholder="https://example.com/san-bong.jpg"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                  <button type="button" onClick={applyImageUrl} disabled={uploading || saving || !imageUrlDraft.trim()}
                    className="rounded-xl bg-[#DA1A32] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                    {uploading ? "Đang kiểm tra…" : "Dùng URL ảnh"}
                  </button>
                </div>
                <ImageUploadField
                  label="Ảnh sân"
                  value={imagePreview}
                  loading={uploading}
                  onChange={handleUploadAnhMinIO}
                  onClear={() => { setImagePreview(""); setFormData((prev) => ({ ...prev, hinhAnh: "" })); }}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => { if (!saving && !uploading) setShowModal(false); }} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Hủy
              </button>
              <button type="button" onClick={handleSave} disabled={saving || uploading} className="rounded-xl bg-[#DA1A32] px-4 py-2.5 text-sm font-black text-white shadow-md shadow-none transition hover:bg-[#B51228] disabled:opacity-50">
                {saving ? "Đang lưu…" : editingItem ? "Cập nhật sân" : "Thêm sân"}
              </button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
// ==========================================
// 3. QUẢN LÝ KHÁCH HÀNG (KẾT NỐI API THẬT)
// ==========================================
export function AdminKhachHangPage() {
  const [saving, setSaving] = useState(false);
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ hoTen: "", sdt: "", email: "", password: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadData = () => {
    setLoading(true); setError("");
    return adminApi.getKhachHang().then((res) => setList(res.data || []))
      .catch((err) => setError(err.message || "Không tải được danh sách."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = list.filter((user) => {
    const text = `${user.hoTen || ""} ${user.username || ""} ${user.sdt || ""} ${user.email || ""}`.toLowerCase();
    return !searchTerm || text.includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ hoTen: "", sdt: "", email: "", password: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ hoTen: item.hoTen || item.username, sdt: item.sdt || "", email: item.email || "" });
    setShowModal(true);
  };

  const handleSave = useExclusiveAction(async () => {
    if (saving) return;
    if (!formData.hoTen || (!editingItem && (!formData.email || (formData.password || "").length < 8))) {
      return alert("Nhập họ tên, email và mật khẩu ít nhất 8 ký tự để tạo tài khoản.");
    }
    setSaving(true);
    try {
      if (editingItem) {
        await adminApi.suaKhachHang(editingItem.id, formData);
      } else {
        await adminApi.themKhachHang(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err?.message || "Lỗi lưu thông tin khách hàng!");
    } finally { setSaving(false); }
  });

  const toggleKhoa = useExclusiveAction(async (id) => {
    try {
      await adminApi.toggleKhoaKhachHang(id);
      await loadData();
    } catch (err) {
      alert(err?.message || "Cập nhật trạng thái khóa thất bại!");
    }
  });

  const handleDelete = useExclusiveAction(async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
    try {
      await adminApi.xoaKhachHang(id);
      await loadData();
    } catch (err) {
      alert(err?.message || "Xóa khách hàng thất bại!");
    }
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Customer management</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">QUẢN LÝ KHÁCH HÀNG</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Theo dõi tài khoản khách hàng và trạng thái hoạt động.</p>
        </div>
        <button onClick={handleOpenAdd} className="rounded-xl bg-[#DA1A32] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-none transition hover:bg-[#B51228]">
          + Thêm khách hàng
        </button>
      </div>

      {loading && <p role="status">Đang tải danh sách...</p>}
      {error && <p role="alert" className="text-red-700">{error} <button type="button" onClick={loadData}>Thử lại</button></p>}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="relative block">
          <span className="sr-only">Tìm kiếm khách hàng</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
          />
        </label>
      </div>

      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm font-semibold text-slate-500">
          Không tìm thấy khách hàng phù hợp.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-red-700">
                          {(user.hoTen || user.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{user.hoTen || user.username}</div>
                          <div className="text-[11px] text-slate-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{user.sdt || "Chưa có SĐT"}</div>
                      <div className="text-slate-400">{user.email || "Chưa có Email"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${user.trangThai ? "bg-emerald-50 text-red-700" : "bg-red-50 text-red-700"}`}>
                        {user.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(user)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700">Sửa</button>
                        <button onClick={() => toggleKhoa(user.id)} className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100">{user.trangThai ? "Khóa" : "Mở"}</button>
                        <button onClick={() => handleDelete(user.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <DialogShell label="Biểu mẫu quản trị" onClose={() => { if (!saving) setShowModal(false); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-lg font-extrabold text-gray-900">{editingItem ? "Sửa Khách Hàng" : "Thêm Khách Hàng"}</h2>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-6">Họ tên</label>
              <input id="adminpages-field-6" type="text" value={formData.hoTen} onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-7">Số điện thoại</label>
              <input id="adminpages-field-7" type="text" value={formData.sdt} onChange={(e) => setFormData({ ...formData, sdt: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-8">Email</label>
              <input id="adminpages-field-8" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            {!editingItem && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-9">Mật khẩu tạm thời</label>
                <input id="adminpages-field-9" type="password" minLength={8} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 font-bold py-2 rounded-xl text-xs text-gray-600">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#DA1A32] text-white font-bold py-2 rounded-xl text-xs">{saving ? "Đang lưu…" : "Lưu lại"}</button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}

// ==========================================
// 4. QUẢN LÝ NHÂN VIÊN (KẾT NỐI API THẬT)
// ==========================================
export function AdminNhanVienPage() {
  const [saving, setSaving] = useState(false);
  const [staffs, setStaffs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ hoTen: "", sdt: "", email: "", vaiTro: "NHAN_VIEN_PAGE", password: "" });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadData = () => {
    setLoading(true); setError("");
    return adminApi.getNhanVien().then((res) => setStaffs(res.data || []))
      .catch((err) => setError(err.message || "Không tải được danh sách."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStaffs = staffs.filter((staff) => {
    const text = `${staff.hoTen || ""} ${staff.username || ""} ${staff.sdt || ""} ${staff.email || ""} ${staff.vaiTro || ""}`.toLowerCase();
    return !searchTerm || text.includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ hoTen: "", sdt: "", email: "", vaiTro: "NHAN_VIEN_PAGE", password: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ hoTen: item.hoTen || item.username, sdt: item.sdt || "", email: item.email || "", vaiTro: item.vaiTro || "NHAN_VIEN_PAGE" });
    setShowModal(true);
  };

  const handleSave = useExclusiveAction(async () => {
    if (saving) return;
    if (!formData.hoTen || (!editingItem && (!formData.email || (formData.password || "").length < 8))) {
      return alert("Nhập họ tên, email và mật khẩu ít nhất 8 ký tự để tạo tài khoản.");
    }
    setSaving(true);
    try {
      if (editingItem) {
        await adminApi.suaNhanVien(editingItem.id, formData);
      } else {
        await adminApi.themNhanVien(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert(err?.message || "Lỗi lưu thông tin nhân viên!");
    } finally { setSaving(false); }
  });

  const toggleKhoa = useExclusiveAction(async (id) => {
    try {
      await adminApi.toggleKhoaNhanVien(id);
      await loadData();
    } catch (err) {
      alert(err?.message || "Cập nhật trạng thái thất bại!");
    }
  });

  const handleDelete = useExclusiveAction(async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản nhân viên này?")) return;
    try {
      await adminApi.xoaNhanVien(id);
      await loadData();
    } catch (err) {
      alert(err?.message || "Xóa nhân viên thất bại!");
    }
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700">Staff management</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">QUẢN LÝ NHÂN VIÊN</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Phân quyền và quản lý tài khoản nhân viên nội bộ.</p>
        </div>
        <button onClick={handleOpenAdd} className="rounded-xl bg-[#DA1A32] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-none transition hover:bg-[#B51228]">
          + Thêm nhân viên
        </button>
      </div>

      {loading && <p role="status">Đang tải danh sách...</p>}
      {error && <p role="alert" className="text-red-700">{error} <button type="button" onClick={loadData}>Thử lại</button></p>}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="relative block">
          <span className="sr-only">Tìm kiếm nhân viên</span>
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại, vai trò"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-600/10"
          />
        </label>
      </div>

      {filteredStaffs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm font-semibold text-slate-500">
          Không tìm thấy nhân viên phù hợp.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStaffs.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-black text-slate-900">{staff.hoTen || staff.username}</td>
                    <td className="px-4 py-3">
                      <div>{staff.sdt || "N/A"}</div>
                      <div className="text-slate-400">{staff.email || "N/A"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${staff.vaiTro === "ADMIN" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                        {staff.vaiTro}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${staff.trangThai ? "bg-emerald-50 text-red-700" : "bg-red-50 text-red-700"}`}>
                        {staff.trangThai ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(staff)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-red-300 hover:text-red-700">Sửa</button>
                        <button onClick={() => toggleKhoa(staff.id)} className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100">{staff.trangThai ? "Khóa" : "Mở"}</button>
                        <button onClick={() => handleDelete(staff.id)} className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 transition hover:bg-red-100">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <DialogShell label="Biểu mẫu quản trị" onClose={() => { if (!saving) setShowModal(false); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-lg font-extrabold text-gray-900">{editingItem ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}</h2>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-10">Họ tên</label>
              <input id="adminpages-field-10" type="text" value={formData.hoTen} onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-11">Số điện thoại</label>
              <input id="adminpages-field-11" type="text" value={formData.sdt} onChange={(e) => setFormData({ ...formData, sdt: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-12">Email</label>
              <input id="adminpages-field-12" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
            </div>
            {!editingItem && (
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-13">Mật khẩu tạm thời</label>
                <input id="adminpages-field-13" type="password" minLength={8} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1" htmlFor="adminpages-field-14">Vai trò</label>
              <select id="adminpages-field-14" value={formData.vaiTro} onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value })} className="w-full border rounded-xl p-2.5 text-xs">
                <option value="NHAN_VIEN_PAGE">Nhân viên Trực Page</option>
                <option value="NHAN_VIEN_SAN">Nhân viên Lễ tân POS</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 font-bold py-2 rounded-xl text-xs text-gray-600">Hủy</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#DA1A32] text-white font-bold py-2 rounded-xl text-xs">{saving ? "Đang lưu…" : "Lưu lại"}</button>
            </div>
          </div>
        </DialogShell>
      )}
    </div>
  );
}

// ==========================================
// 5. THỐNG KÊ DOANH THU
// ==========================================
export function AdminDoanhThuPage() {
  const todayIso = vietnamDate();
  const monthStart = `${todayIso.slice(0, 7)}-01`;
  const [tuNgay, setTuNgay] = useState(monthStart);
  const [denNgay, setDenNgay] = useState(todayIso);
  const [stats, setStats] = useState({ tongDoanhThu: 0, soGiaoDich: 0, doanhThuTheoNgay: [], doanhThuTheoSan: {}, doanhThuTheoCum: {} });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (start, end) => {
    if (!validDateRange(start, end)) { setError("Chọn khoảng ngày hợp lệ."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getRevenue(start, end);
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không tải được doanh thu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(monthStart, todayIso); }, [load, monthStart, todayIso]);
  const soNgay = Math.max(1, Math.floor((new Date(`${denNgay}T00:00:00`) - new Date(`${tuNgay}T00:00:00`)) / 86400000) + 1);
  const maxDaily = Math.max(...(stats.doanhThuTheoNgay || []).map((item) => Number(item.giaTri || 0)), 1);

  return (
    <div className="min-h-screen space-y-6 bg-[#F5F6F8] p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#DA1A32]">Revenue</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#0B0F14]">Thống kê doanh thu</h1>
        </div>
        <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] shadow-sm">
          {tuNgay} → {denNgay}
        </div>
      </div>

      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-[0_12px_28px_rgba(7,26,23,0.04)] sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] p-1 text-xs font-black">
            <button type="button" onClick={() => { const end = todayIso; const startDate = new Date(`${end}T00:00:00`); startDate.setDate(startDate.getDate() - 6); const start = daysBefore(end, 6); setTuNgay(start); setDenNgay(end); load(start, end); }} className="rounded-xl bg-white px-3 py-1.5 text-[#0B0F14] shadow-sm">Tuần</button>
            <button type="button" onClick={() => { setTuNgay(monthStart); setDenNgay(todayIso); load(monthStart, todayIso); }} className="rounded-xl px-3 py-1.5 text-[#64748B]">Tháng</button>
          </div>
          <input type="date" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm font-medium text-[#0B0F14] outline-none focus:border-[#DA1A32] focus:ring-4 focus:ring-[#DA1A32]/10" />
          <span className="text-[#64748B]">—</span>
          <input type="date" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} className="rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm font-medium text-[#0B0F14] outline-none focus:border-[#DA1A32] focus:ring-4 focus:ring-[#DA1A32]/10" />
          <button onClick={() => load(tuNgay, denNgay)} disabled={loading} className="rounded-xl bg-[#DA1A32] px-4 py-2 text-sm font-black text-white hover:bg-[#B51228] disabled:opacity-60">
            {loading ? "Đang tải..." : "Lọc dữ liệu"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">Tổng doanh thu</span>
          <div className="mt-1 text-2xl font-black text-[#0B0F14]">{Number(stats.tongDoanhThu || 0).toLocaleString("vi-VN")} <span className="text-xs font-semibold text-[#64748B]">đồng</span></div>
        </div>
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">Số giao dịch thành công</span>
          <div className="mt-1 text-2xl font-black text-[#0B0F14]">{stats.soGiaoDich || 0}</div>
        </div>
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">TB/ngày</span>
          <div className="mt-1 text-2xl font-black text-[#0B0F14]">{Math.round(Number(stats.tongDoanhThu || 0) / soNgay).toLocaleString("vi-VN")} <span className="text-xs font-semibold text-[#64748B]">đ</span></div>
        </div>
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">Số sân có doanh thu</span>
          <div className="mt-1 text-2xl font-black text-[#B51228]">{Object.keys(stats.doanhThuTheoSan || {}).length}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Doanh thu theo ngày</h2>
          <div className="space-y-3">
            {(stats.doanhThuTheoNgay || []).map((item) => (
              <div key={item.ngay} className="grid grid-cols-[80px_1fr_130px] items-center gap-3 text-xs">
                <span className="font-semibold text-[#64748B]">{item.ngay}</span>
                <div className="h-2.5 rounded-full bg-[#F0F2F5]">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-[#DA1A32] to-[#F8B9C2]" style={{ width: `${Math.max(0, Number(item.giaTri || 0) / maxDaily * 100)}%` }} />
                </div>
                <span className="text-right font-bold text-[#0B0F14]">{Number(item.giaTri || 0).toLocaleString("vi-VN")} đ</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Theo sân / cụm</h2>
          <div className="space-y-2">
            {[...Object.entries(stats.doanhThuTheoSan || {}).map(([name, amount]) => [`Sân · ${name}`, amount]), ...Object.entries(stats.doanhThuTheoCum || {}).map(([name, amount]) => [`Cụm · ${name}`, amount])].map(([name, amount]) => (
              <div key={name} className="flex justify-between border-b border-[#E5E7EB] py-2.5 text-sm">
                <span className="text-[#64748B]">{name}</span>
                <strong className="font-black text-[#0B0F14]">{Number(amount).toLocaleString("vi-VN")} đ</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. XUẤT BÁO CÁO (XUẤT FILE & LƯU MINIO)
// ==========================================
export function AdminBaoCaoPage() {
  const todayIso = vietnamDate();
  const monthStart = `${todayIso.slice(0, 7)}-01`;
  const [tuNgay, setTuNgay] = useState(monthStart);
  const [denNgay, setDenNgay] = useState(todayIso);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const [downloadUrl, setDownloadUrl] = useState("");
  const handleExport = useExclusiveAction(async (format, start = tuNgay, end = denNgay) => {
    if (loading) return;
    if (!validDateRange(start, end)) { setError("Chọn khoảng ngày hợp lệ."); return; }
    setDownloadUrl("");
    setLoading(format);
    setError("");
    try {
      const res = format === "Excel" ? await adminApi.exportExcel(start, end) : await adminApi.exportPdf(start, end);
      if (res.data?.url) {
        const url = new URL(res.data.url, window.location.origin);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error("Đường dẫn không hợp lệ.");
        setDownloadUrl(url.href);
      } else { throw new Error("Hệ thống chưa trả đường dẫn báo cáo."); }
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Xuất ${format} thất bại.`);
    } finally {
      setLoading("");
    }
  });

  return (
    <div className="min-h-screen space-y-6 bg-[#F5F6F8] p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#DA1A32]">Reports</p>
          <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#0B0F14]">Xuất báo cáo tài chính</h1>
        </div>
        <div className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] shadow-sm">
          Báo cáo doanh thu
        </div>
      </div>

      {error && <p role="alert" className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      {downloadUrl && <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-emerald-50 p-4 font-bold text-red-700">Báo cáo đã sẵn sàng — nhấn để tải (liên kết có thời hạn)</a>}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Tạo báo cáo tùy chỉnh</h3>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#64748B]" htmlFor="adminpages-field-15">Loại báo cáo</label>
            <select id="adminpages-field-15" className="w-full rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2.5 text-sm font-medium text-[#0B0F14] outline-none transition focus:border-[#DA1A32] focus:ring-4 focus:ring-[#DA1A32]/10">
              <option>Báo cáo tổng hợp doanh thu</option>
              <option disabled>Tần suất đặt sân — chưa có API</option>
              <option disabled>Khách thân thiết — chưa có API</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-semibold text-[#64748B]">Từ ngày<input type="date" value={tuNgay} onChange={(event) => setTuNgay(event.target.value)} className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm text-[#0B0F14] outline-none focus:border-[#DA1A32] focus:ring-4 focus:ring-[#DA1A32]/10" /></label>
            <label className="text-sm font-semibold text-[#64748B]">Đến ngày<input type="date" value={denNgay} onChange={(event) => setDenNgay(event.target.value)} className="mt-1 w-full rounded-2xl border border-[#E5E7EB] bg-[#F8F9FB] px-3 py-2 text-sm text-[#0B0F14] outline-none focus:border-[#DA1A32] focus:ring-4 focus:ring-[#DA1A32]/10" /></label>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => handleExport("Excel")} disabled={Boolean(loading)} className="flex-1 rounded-2xl bg-[#DA1A32] px-4 py-3 text-sm font-black text-white hover:bg-[#B51228] disabled:opacity-60">
              {loading === "Excel" ? "Đang xuất..." : "Xuất Excel"}
            </button>
            <button onClick={() => handleExport("PDF")} disabled={Boolean(loading)} className="flex-1 rounded-2xl border border-[#bfead9] bg-[#FFF0F2] px-4 py-3 text-sm font-black text-[#B51228] hover:bg-[#FDE5E9] disabled:opacity-60">
              {loading === "PDF" ? "Đang xuất..." : "Xuất PDF"}
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-[0_12px_28px_rgba(7,26,23,0.04)]">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Tải nhanh báo cáo kỳ</h3>
          {[
            { ten: `Hôm nay (${todayIso})`, start: todayIso, end: todayIso },
            { ten: `7 ngày gần nhất (${daysBefore(todayIso, 6)} → ${todayIso})`, start: daysBefore(todayIso, 6), end: todayIso },
            { ten: `Tháng ${todayIso.slice(0, 7)}`, start: monthStart, end: todayIso },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-2xl bg-[#F8F9FB] p-3 text-sm font-medium text-[#0B0F14]">
              <span>{item.ten}</span>
              <div className="space-x-2">
                <button onClick={() => handleExport("Excel", item.start, item.end)} className="font-bold text-[#B51228] hover:underline">Excel</button>
                <button onClick={() => handleExport("PDF", item.start, item.end)} className="font-bold text-[#0f6fe8] hover:underline">PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
