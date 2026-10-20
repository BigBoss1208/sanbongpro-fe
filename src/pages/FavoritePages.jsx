import { useExclusiveAction } from "../utils/useExclusiveAction";
import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { favoriteApi } from "../api/favoriteApi";
import { getPhien } from "../api/http";
import CourtCard from "../components/CourtCard";
export default function FavoriteFieldsPage({ onNavigate }) {
 const [fields, setFields] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [busyId, setBusyId] = useState(null);
 const loggedIn = !!getPhien();
 const load = useCallback(() => {
  if (!loggedIn) { setLoading(false); return Promise.resolve(); }
  setLoading(true); setError("");
  return favoriteApi.list().then((data) => { if (!Array.isArray(data)) throw new Error("API trả danh sách yêu thích không hợp lệ."); setFields(data); }).catch((err) => setError(err.message || "Không tải được danh sách sân yêu thích.")).finally(() => setLoading(false));
 }, [loggedIn]);
 useEffect(() => { load(); }, [load]);
 const remove = useExclusiveAction(async (fieldId) => {
  setBusyId(fieldId); setError("");
  try { await favoriteApi.remove(fieldId); setFields((current) => current.filter((field) => field.id !== fieldId)); }
  catch (err) { setError(err.message || "Không thể bỏ yêu thích."); } finally { setBusyId(null); }
 });
 return <section className="club-container club-favorites"><div className="club-section-heading"><div><p className="club-eyebrow">SÂN QUEN CHO MỖI TRẬN ĐẤU</p><h1>Sân yêu thích<span>.</span></h1><p>Các sân bạn đã lưu trong tài khoản.</p></div>{loggedIn && <button className="club-button club-button-outline" onClick={load} disabled={loading}>Làm mới</button>}</div>{error && <p role="alert" className="club-alert">{error} <button onClick={load}>Thử lại</button></p>}{!loggedIn ? <div className="club-empty"><span aria-hidden="true">♡</span><h2>Lưu những sân bạn yêu thích</h2><p>Đăng nhập để xem và quản lý danh sách sân yêu thích của bạn.</p><button className="club-button" onClick={() => onNavigate("login")}>Đăng nhập</button></div> : loading ? <div role="status" className="court-grid">{[0,1,2].map((key) => <div className="court-skeleton" key={key}><div /><span /><span /></div>)}<span className="sr-only">Đang tải sân yêu thích…</span></div> : !fields.length && !error ? <div className="club-empty"><span aria-hidden="true">♡</span><h2>Bạn chưa có sân yêu thích</h2><p>Chọn biểu tượng trái tim trên sân để lưu vào tài khoản.</p><button className="club-button" onClick={() => onNavigate("search")}>Khám phá sân bóng</button></div> : <div className="court-grid">{fields.map((court) => <CourtCard key={court.id} court={court} saved busy={busyId !== null} onFavorite={() => remove(court.id)} onNavigate={onNavigate} />)}</div>}</section>;
}
FavoriteFieldsPage.propTypes = { onNavigate: PropTypes.func.isRequired };
