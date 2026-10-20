import { paymentLabel, methodLabel, dayTypeLabel } from "../utils/statusLabels";
import { useExclusiveAction } from "../utils/useExclusiveAction";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../api/adminApi";

function errorMessage(error, fallback) {
  return error.response?.data?.message || error.response?.data || error.message || fallback;
}

export function AdminSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [fields, setFields] = useState([]);
  const [slots, setSlots] = useState([]);
  const [prices, setPrices] = useState([]);
  const [selectedField, setSelectedField] = useState("");
  const [slotForm, setSlotForm] = useState({ gioBatDau: "07:00", gioKetThuc: "08:00" });
  const [priceForm, setPriceForm] = useState({ khungGioId: "", gia: "", loaiNgay: "TAT_CA" });
  const [editingPrice, setEditingPrice] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSlots = () => adminApi.getKhungGio().then((response) => setSlots(response.data || []));
  const loadPrices = useCallback((fieldId = selectedField) => {
    if (!fieldId) return setPrices([]);
    return adminApi.getGiaSan(fieldId).then((response) => setPrices(response.data || []));
  }, [selectedField]);

  useEffect(() => {
    setLoading(true);
    setError("");
    let active = true;
    Promise.all([adminApi.getSanBong(), adminApi.getKhungGio()]).then(([fieldResponse, slotResponse]) => {
      if (!active) return;
      const data = fieldResponse.data || [];
      setFields(data); setSlots(slotResponse.data || []);
      setSelectedField((current) => data.some((field) => String(field.id) === current) ? current : String(data[0]?.id || ""));
    }).catch((err) => { if (active) setError(errorMessage(err, "Không tải được sân và khung giờ.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  useEffect(() => {
    let active = true;
    setPrices([]);
    if (selectedField) adminApi.getGiaSan(selectedField)
      .then((response) => { if (active) setPrices(response.data || []); })
      .catch((err) => { if (active) setError(errorMessage(err, "Không tải được bảng giá.")); });
    return () => { active = false; };
  }, [selectedField, reload]);

  const createSlot = useExclusiveAction(async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (editingSlot) await adminApi.suaKhungGio(editingSlot.id, slotForm);
      else await adminApi.taoKhungGio(slotForm);
      setMessage(editingSlot ? "Đã sửa khung giờ." : "Đã tạo khung giờ.");
      setEditingSlot(null);
      await loadSlots();
    } catch (err) {
      setError(errorMessage(err, "Không thể tạo khung giờ."));
    } finally { setBusy(false); }
  });

  const deleteSlot = useExclusiveAction(async (slot) => {
    if (!window.confirm(`Xóa khung ${slot.gioBatDau} - ${slot.gioKetThuc}?`)) return;
    try {
      await adminApi.xoaKhungGio(slot.id);
      setMessage("Đã xóa khung giờ.");
      await loadSlots();
      await loadPrices();
    } catch (err) {
      setError(errorMessage(err, "Không thể xóa khung giờ đang được sử dụng."));
    }
  });

  const savePrice = useExclusiveAction(async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!selectedField || !priceForm.khungGioId) return setError("Chọn sân và khung giờ trước.");
    const payload = {
      sanId: Number(selectedField),
      khungGioId: Number(priceForm.khungGioId),
      gia: Number(priceForm.gia),
      loaiNgay: priceForm.loaiNgay,
    };
    setBusy(true); setError(""); setMessage("");
    try {
      if (editingPrice) await adminApi.suaGiaSan(editingPrice.id, payload);
      else await adminApi.taoGiaSan(payload);
      setEditingPrice(null);
      setPriceForm({ khungGioId: "", gia: "", loaiNgay: "TAT_CA" });
      setMessage("Đã lưu bảng giá.");
      await loadPrices();
    } catch (err) {
      setError(errorMessage(err, "Không thể lưu bảng giá."));
    } finally { setBusy(false); }
  });

  const editPrice = (price) => {
    setEditingPrice(price);
    setPriceForm({ khungGioId: String(price.khungGioId), gia: String(price.gia), loaiNgay: price.loaiNgay || "TAT_CA" });
  };

  const deletePrice = useExclusiveAction(async (price) => {
    try {
      await adminApi.xoaGiaSan(price.id);
      setMessage("Đã xóa bảng giá.");
      await loadPrices();
    } catch (err) {
      setError(errorMessage(err, "Không thể xóa bảng giá."));
    }
  });

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:p-6">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Cấu hình vận hành</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Khung giờ và giá sân</h1>
      </header>
      {loading && <p role="status">Đang tải khung giờ và bảng giá…</p>}
      {busy && <p role="status">Đang lưu thay đổi…</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error} <button type="button" onClick={() => { setReload((key) => key + 1); Promise.resolve(loadPrices()).catch((err) => setError(errorMessage(err, "Không tải được bảng giá."))); }}>Thử lại</button></p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-black text-slate-900">Khung giờ dùng chung</h2>
          <form onSubmit={createSlot} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-bold text-slate-600">Bắt đầu<input required type="time" value={slotForm.gioBatDau} onInput={(event) => setSlotForm((current) => ({ ...current, gioBatDau: event.target.value }))} onChange={(event) => setSlotForm((current) => ({ ...current, gioBatDau: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label className="text-xs font-bold text-slate-600">Kết thúc<input required type="time" value={slotForm.gioKetThuc} onInput={(event) => setSlotForm((current) => ({ ...current, gioKetThuc: event.target.value }))} onChange={(event) => setSlotForm((current) => ({ ...current, gioKetThuc: event.target.value }))} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <button disabled={busy || loading} className="self-end rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">{editingSlot ? "Lưu giờ" : "Thêm giờ"}</button>
            {editingSlot && <button type="button" onClick={() => { setEditingSlot(null); setSlotForm({ gioBatDau: "07:00", gioKetThuc: "08:00" }); }}>Hủy sửa</button>}
          </form>
          <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-100">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                <span className="font-bold text-slate-800">{slot.gioBatDau?.slice(0, 5)} – {slot.gioKetThuc?.slice(0, 5)}</span>
                <div className="flex gap-2"><button type="button" disabled={busy} onClick={() => { setEditingSlot(slot); setSlotForm({ gioBatDau: slot.gioBatDau?.slice(0, 5), gioKetThuc: slot.gioKetThuc?.slice(0, 5) }); }} className="text-sm font-bold">Sửa</button><button type="button" disabled={busy} onClick={() => deleteSlot(slot)} className="rounded-md px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50">Xóa</button></div>
              </div>
            ))}
            {!slots.length && <p className="p-4 text-sm text-slate-500">Chưa có khung giờ.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-black text-slate-900">Bảng giá theo sân</h2>
          <label className="mt-3 block text-xs font-bold text-slate-600">Sân
            <select value={selectedField} onChange={(event) => setSelectedField(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {fields.map((field) => <option key={field.id} value={field.id}>{field.tenSan}</option>)}
            </select>
          </label>
          <form onSubmit={savePrice} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-600">Khung giờ<select required value={priceForm.khungGioId} onChange={(event) => setPriceForm({ ...priceForm, khungGioId: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Chọn giờ</option>{slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.gioBatDau?.slice(0, 5)} – {slot.gioKetThuc?.slice(0, 5)}</option>)}</select></label>
            <label className="text-xs font-bold text-slate-600">Loại ngày<select value={priceForm.loaiNgay} onChange={(event) => setPriceForm({ ...priceForm, loaiNgay: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="TAT_CA">Tất cả ngày</option><option value="NGAY_THUONG">Ngày thường</option><option value="CUOI_TUAN">Cuối tuần</option></select></label>
            <label className="text-xs font-bold text-slate-600 sm:col-span-2">Giá (VNĐ)<input required min="1" step="1" type="number" value={priceForm.gia} onChange={(event) => setPriceForm({ ...priceForm, gia: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <div className="flex gap-2 sm:col-span-2"><button disabled={busy || loading} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">{editingPrice ? "Cập nhật giá" : "Thêm giá"}</button>{editingPrice && <button type="button" onClick={() => { setEditingPrice(null); setPriceForm({ khungGioId: "", gia: "", loaiNgay: "TAT_CA" }); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">Hủy sửa</button>}</div>
          </form>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100">
            <table className="w-full min-w-[420px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-2.5">Khung giờ</th><th className="p-2.5">Loại ngày</th><th className="p-2.5">Giá</th><th className="p-2.5 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{prices.map((price) => <tr key={price.id}><td className="p-2.5 font-semibold">{price.gioBatDau?.slice(0, 5)} – {price.gioKetThuc?.slice(0, 5)}</td><td className="p-2.5">{dayTypeLabel(price.loaiNgay || "TAT_CA")}</td><td className="p-2.5 font-bold">{Number(price.gia).toLocaleString("vi-VN")} đ</td><td className="p-2.5 text-right"><button type="button" onClick={() => editPrice(price)} className="mr-2 font-bold text-blue-700">Sửa</button><button type="button" onClick={() => deletePrice(price)} className="font-bold text-red-700">Xóa</button></td></tr>)}</tbody></table>
            {!prices.length && <p className="p-3 text-sm text-slate-500">Sân chưa có bảng giá.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

export function AdminCumSanPage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ tenCum: "", diaChi: "", moTa: "" });
  const [editing, setEditing] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true); setError("");
    return Promise.all([adminApi.getCumSan(), adminApi.getNhanVien()]).then(([clusterResponse, staffResponse]) => {
    const clusterRows = clusterResponse.data || [];
    const staffRows = staffResponse.data || [];
    setClusters(clusterRows);
    setStaff(staffRows);
    setAssignments(Object.fromEntries(staffRows.map((person) => [person.id, person.cumSanId ? String(person.cumSanId) : ""])));
    }).catch((err) => setError(errorMessage(err, "Không tải được dữ liệu cụm sân."))).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useExclusiveAction(async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (editing) await adminApi.suaCumSan(editing.id, form);
      else await adminApi.taoCumSan(form);
      setEditing(null);
      setForm({ tenCum: "", diaChi: "", moTa: "" });
      setMessage("Đã lưu cụm sân.");
      await load();
    } catch (err) { setError(errorMessage(err, "Không thể lưu cụm sân.")); } finally { setBusy(false); }
  });

  const assign = useExclusiveAction(async (person) => {
    try {
      await adminApi.phanCongCumSan(person.id, assignments[person.id] ? Number(assignments[person.id]) : null);
      setMessage(`Đã cập nhật cụm phụ trách cho ${person.hoTen || person.email}.`);
    } catch (err) { setError(errorMessage(err, "Không thể phân công nhân viên.")); }
  });

  const remove = useExclusiveAction(async (cluster) => {
    try {
      await adminApi.xoaCumSan(cluster.id);
      setMessage("Đã xóa cụm sân.");
      await load();
    } catch (err) { setError(errorMessage(err, "Không thể xóa cụm sân đang có sân.")); }
  });

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5 p-4 sm:p-6">
      <header><p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Quản trị hệ thống</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Quản lý cụm sân</h1></header>
      {loading && <p role="status">Đang tải cụm sân và nhân viên…</p>}{busy && <p role="status">Đang lưu…</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error} <button type="button" onClick={load}>Thử lại</button></p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
      <form onSubmit={save} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
        <h2 className="text-lg font-black text-slate-900 sm:col-span-2">{editing ? "Sửa cụm sân" : "Tạo cụm sân"}</h2>
        <label className="text-xs font-bold text-slate-600">Tên cụm<input required maxLength={100} value={form.tenCum} onChange={(event) => setForm({ ...form, tenCum: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="text-xs font-bold text-slate-600">Địa chỉ<input maxLength={255} value={form.diaChi} onChange={(event) => setForm({ ...form, diaChi: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <label className="text-xs font-bold text-slate-600 sm:col-span-2">Mô tả<textarea rows={2} value={form.moTa} onChange={(event) => setForm({ ...form, moTa: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
        <div className="flex gap-2 sm:col-span-2"><button disabled={busy || loading} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">{editing ? "Cập nhật" : "Tạo cụm"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ tenCum: "", diaChi: "", moTa: "" }); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold">Hủy sửa</button>}</div>
      </form>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Cụm</th><th className="p-3">Địa chỉ</th><th className="p-3">Số sân</th><th className="p-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{clusters.map((cluster) => <tr key={cluster.id}><td className="p-3 font-bold">{cluster.tenCum}</td><td className="p-3">{cluster.diaChi || "—"}</td><td className="p-3">{cluster.soSan}</td><td className="p-3 text-right"><button type="button" onClick={() => { setEditing(cluster); setForm({ tenCum: cluster.tenCum, diaChi: cluster.diaChi || "", moTa: cluster.moTa || "" }); }} className="mr-3 font-bold text-blue-700">Sửa</button><button type="button" onClick={() => remove(cluster)} className="font-bold text-red-700">Xóa</button></td></tr>)}</tbody></table></div>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4"><h2 className="font-black text-slate-900">Phân công nhân viên</h2></div>
        <div className="divide-y divide-slate-100">{staff.filter((person) => person.vaiTro === "NHAN_VIEN_PAGE" || person.vaiTro === "NHAN_VIEN_SAN").map((person) => <div key={person.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{person.hoTen || person.email}</p><p className="text-xs text-slate-500">{person.vaiTro}</p></div><select aria-label={`Cụm phụ trách của ${person.hoTen || person.email}`} value={assignments[person.id] || ""} onChange={(event) => setAssignments({ ...assignments, [person.id]: event.target.value })} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Chưa phân công</option>{clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{cluster.tenCum}</option>)}</select><button type="button" onClick={() => assign(person)} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">Lưu phân công</button></div>)}</div>
      </section>
    </section>
  );
}

export function AdminPaymentsPage() {
  const [status, setStatus] = useState("CHO_THANH_TOAN");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    return adminApi.getPayments(status)
      .then((response) => setPayments(response.data || []))
      .catch((err) => setError(errorMessage(err, "Không tải được danh sách giao dịch.")))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const confirm = useExclusiveAction(async (payment) => {
    setBusyId(payment.id);
    setError("");
    try {
      await adminApi.confirmPayment(payment.id);
      setMessage(`Đã xác nhận giao dịch cho đơn #${payment.datSanId}.`);
      await load();
    } catch (err) {
      setError(errorMessage(err, "Không thể xác nhận giao dịch."));
    } finally {
      setBusyId(null);
    }
  });

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
      <header><p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Đối soát</p><h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Giao dịch thanh toán</h1></header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{message}</p>}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <label className="text-xs font-bold uppercase text-slate-500" htmlFor="payment-status">Trạng thái</label>
        <select id="payment-status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><option value="CHO_THANH_TOAN">Chờ thanh toán</option><option value="THANH_CONG">Thành công</option><option value="THAT_BAI">Thất bại</option></select>
        <button type="button" onClick={load} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Làm mới</button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-10 text-center text-sm font-semibold text-slate-500">Đang tải giao dịch...</p> : payments.length === 0 ? <p className="p-10 text-center text-sm font-semibold text-slate-500">Không có giao dịch ở trạng thái này.</p> : (
          <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-3">Mã GD</th><th className="p-3">Đơn / Khách</th><th className="p-3">Sân / Ngày</th><th className="p-3">Phương thức</th><th className="p-3">Số tiền</th><th className="p-3">Trạng thái</th><th className="p-3 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-slate-100">{payments.map((payment) => <tr key={payment.id}><td className="p-3 font-bold">#{payment.id}</td><td className="p-3"><span className="font-bold">Đơn #{payment.datSanId}</span><br /><span className="text-xs text-slate-500">{payment.tenKhachHang} · {payment.soDienThoai}</span></td><td className="p-3">{payment.tenSan}<br /><span className="text-xs text-slate-500">{payment.ngayDat}</span></td><td className="p-3">{methodLabel(payment.phuongThuc)}</td><td className="p-3 font-bold">{Number(payment.soTien || 0).toLocaleString("vi-VN")} đ</td><td className="p-3">{paymentLabel(payment.trangThai)}</td><td className="p-3 text-right">{payment.trangThai === "CHO_THANH_TOAN" && payment.phuongThuc !== "VNPAY" && <button type="button" disabled={busyId !== null} onClick={() => confirm(payment)} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50">{busyId === payment.id ? "Đang lưu..." : "Xác nhận đã thu"}</button>}</td></tr>)}</tbody></table>
        )}
      </div>
    </section>
  );
}
