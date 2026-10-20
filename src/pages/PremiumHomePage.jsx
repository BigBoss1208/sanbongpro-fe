import CourtCard from "../components/CourtCard";
import { useExclusiveAction } from "../utils/useExclusiveAction";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { sanApi } from "../api/sanApi";
import { favoriteApi } from "../api/favoriteApi";
import { getPhien } from "../api/http";
import { filterCourts } from "../utils/courtSearch";
import "./Homepage.css";

const HERO_IMAGE = "/assets/stadium-hero.png";

export default function HomePage({ onNavigate, listing = false, section = "home" }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [cluster, setCluster] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("name");
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [busyFavorites, setBusyFavorites] = useState(new Set());
  const [favoriteError, setFavoriteError] = useState("");
  const [favoriteReload, setFavoriteReload] = useState(0);
  const session = getPhien();
  const role = session?.role || session?.vaiTro || session?.user?.role;
  const userId = role === "KHACH_HANG" || role === "customer" ? session?.user?.id || session?.username : null;


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    sanApi.danhSachSan().then((data) => {
      if (!Array.isArray(data)) throw new Error("Dữ liệu danh sách sân không hợp lệ.");
      if (active) setCourts(data);
    }).catch((err) => { if (active) setError(err.message || "Không thể tải danh sách sân."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  useEffect(() => {
    let active = true;
    if (!userId) { setFavoriteIds(new Set()); return undefined; }
    setFavoriteError("");
    favoriteApi.list().then((items) => {
      if (!Array.isArray(items)) throw new Error("Dữ liệu sân yêu thích không hợp lệ.");
      if (active) setFavoriteIds(new Set(items.map((item) => item.id)));
    }).catch((err) => { if (active) setFavoriteError(err.message || "Không thể tải sân yêu thích."); });
    return () => { active = false; };
  }, [userId, favoriteReload]);

  const filtered = useMemo(() => filterCourts(courts, { keyword, cluster, type, sort }), [courts, keyword, cluster, type, sort]);
  const clusters = [...new Map(courts.filter((court) => court.cumSanId != null && court.tenCumSan).map((court) => [court.cumSanId, court.tenCumSan])).entries()];
  const types = [...new Set(courts.map((court) => court.loaiSan).filter(Boolean))];
  const scrollToCourts = () => document.getElementById("courts")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  const toggleFavorite = useExclusiveAction(async (id) => {
    if (busyFavorites.has(id)) return;
    setBusyFavorites((current) => new Set(current).add(id));
    setFavoriteError("");
    try {
      if (favoriteIds.has(id)) await favoriteApi.remove(id);
      else await favoriteApi.add(id);
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    } catch (err) { setFavoriteError(err.message || "Không thể cập nhật sân yêu thích."); }
    finally { setBusyFavorites((current) => { const next = new Set(current); next.delete(id); return next; }); }
  });


  useEffect(() => {
    const target = { featured: "courts", about: "about", "how-it-works": "how-it-works" }[section];
    if (target) document.getElementById(target)?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [section]);
  const searchBar = <form className="club-search-bar" onSubmit={(event) => { event.preventDefault(); scrollToCourts(); }} aria-label="Tìm sân bóng"><label><span>⌕ Tên sân</span><input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên sân, khu vực…" /></label><label><span>⌖ Khu vực</span><select value={cluster} onChange={(event) => setCluster(event.target.value)}><option value="">Tất cả cụm sân</option>{clusters.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label><span>⚽ Loại sân</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="">Tất cả loại sân</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><button type="submit" className="club-button">Tìm sân <span aria-hidden="true">→</span></button></form>;
  const searchHint = "Chọn ngày và khung giờ tại chi tiết sân để kiểm tra lịch trống và giá chính xác.";
  return <div className={`club-home ${listing ? "club-directory" : ""}`}>
    <section className={listing ? "club-search-hero" : "club-hero"} style={{ backgroundImage: `linear-gradient(90deg, rgba(11,15,20,.86), rgba(11,15,20,.14)), url(${HERO_IMAGE})` }} aria-labelledby="home-heading"><div className="club-container">
      <p className="club-eyebrow">{listing ? "SÂN BÓNG PRO / TÌM SÂN" : "TRẢI NGHIỆM SÂN BÓNG ĐẲNG CẤP"}</p>
      {listing ? <h1 id="home-heading">Tìm sân bóng<span>.</span></h1> : <h1 id="home-heading">TÌM SÂN.<br /><span>ĐẶT GIỜ.</span></h1>}
      <p className="club-hero-description">{listing ? "Khám phá sân phù hợp cho trận đấu tiếp theo của bạn." : <>Nền tảng đặt sân bóng hiện đại, nhanh chóng và tiện lợi.<br />Cho những trận cầu đỉnh cao của bạn.</>}</p>
      {!listing && <button type="button" onClick={scrollToCourts} className="club-button club-hero-cta">Đặt sân ngay <span aria-hidden="true">→</span></button>}
      {listing ? <>{searchBar}<p className="club-search-hint">{searchHint}</p></> : <div className="club-hero-image-space" aria-hidden="true"><div /><p className="club-search-hint">{searchHint}</p></div>}
      {!listing && <div className="club-trust-strip"><span>◷ Đặt sân thuận tiện</span><span>⚽ Tìm sân phù hợp</span><span>▦ Quản lý lịch rõ ràng</span><span>♡ Lưu sân yêu thích</span></div>}
    </div></section>
    <div className={listing ? "" : "club-discovery"}>
    <section id="courts" className="club-container club-courts" aria-label="Danh sách sân bóng">
      {!listing && <>{searchBar}<p className="club-search-hint">{searchHint}</p></>}
      <div className={listing ? "club-section-heading" : "club-sort-row"}>
        {listing && <div><p className="club-eyebrow">DANH SÁCH SÂN ĐANG HOẠT ĐỘNG</p><h2>Sân bóng dành cho bạn</h2><p>Danh sách từ hệ thống. Lịch trống được kiểm tra khi bạn chọn ngày.</p></div>}
        <label className="club-sort">Sắp xếp<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Tên A–Z</option><option value="price-asc">Giá thấp trước</option><option value="price-desc">Giá cao trước</option></select></label>
      </div>
      {favoriteError && <div role="alert" className="club-alert">{favoriteError}<button type="button" onClick={() => setFavoriteReload((value) => value + 1)}>Thử tải lại</button></div>}
      {loading ? <div className="court-grid" role="status" aria-label="Đang tải danh sách sân">{[0, 1, 2, 3].map((item) => <div className="court-skeleton" key={item}><div /><span /><span /></div>)}<span className="sr-only">Đang tải danh sách sân…</span></div> : error ? <div role="alert" className="club-empty"><span aria-hidden="true">!</span><h3>Chưa thể tải danh sách sân</h3><p>{error}</p><button className="club-button" onClick={() => setReload((value) => value + 1)}>Thử lại</button></div> : !filtered.length ? <div className="club-empty"><span aria-hidden="true">⌕</span><h3>{courts.length ? "Chưa tìm thấy sân phù hợp" : "Danh sách sân đang được cập nhật"}</h3><p>Thử thay đổi tên sân, khu vực hoặc loại sân.</p><button className="club-button" onClick={() => { setKeyword(""); setCluster(""); setType(""); setReload((value) => value + 1); }}>Tải lại danh sách</button></div> : <><p className="club-results" role="status">Tìm thấy <strong>{filtered.length}</strong> sân bóng</p><div className="court-grid">{filtered.map((court) => <CourtCard key={court.id} court={court} saved={favoriteIds.has(court.id)} busy={busyFavorites.has(court.id)} onFavorite={() => userId ? toggleFavorite(court.id) : onNavigate("login")} onNavigate={onNavigate} />)}</div></>}
    </section>
    </div>
    {!listing && <><section id="how-it-works" className="club-process" style={{ backgroundImage: `linear-gradient(rgba(11,15,20,.88),rgba(11,15,20,.88)), url(${HERO_IMAGE})` }}><div className="club-container"><div className="club-section-heading"><div><h2>QUY TRÌNH <span>ĐẶT SÂN</span> ĐƠN GIẢN</h2><p>Chỉ với 3 bước, bạn đã có thể chuẩn bị cho trận đấu.</p></div></div><div className="club-steps">{[["01", "⌕", "Tìm sân phù hợp", "Chọn khu vực, loại sân và xem thông tin sân phù hợp với đội của bạn."], ["02", "▦", "Chọn ngày và khung giờ", "Xem lịch trống, chọn thời gian và kiểm tra giá trước khi đặt."], ["03", "✓", "Theo dõi yêu cầu đặt sân", "Đăng nhập, gửi yêu cầu và theo dõi xác nhận trong lịch sử đặt sân."]].map(([number, icon, title, text]) => <article key={number}><b>{number}</b><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section><section id="about" className="club-container club-about"><div><p className="club-eyebrow">VỀ SÂN BÓNG PRO</p><h2>VÌ SAO CHỌN <span>SÂN BÓNG PRO</span></h2><p>Một nơi để tìm sân, quản lý lịch đặt và lưu những sân bạn yêu thích.</p></div><div className="club-benefits">{[["⚽", "Thông tin sân rõ ràng", "Xem loại sân và cụm sân trước khi lựa chọn."], ["◷", "Đặt sân thuận tiện", "Chọn thời gian phù hợp từ lịch sân."], ["▦", "Quản lý lịch linh hoạt", "Theo dõi yêu cầu và hóa đơn trong tài khoản."], ["♡", "Sân quen luôn bên bạn", "Lưu sân yêu thích để quay lại dễ dàng."]].map(([icon, title, text]) => <article key={title}><span aria-hidden="true">{icon}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section></>}
  </div>;
}
HomePage.propTypes = { onNavigate: PropTypes.func.isRequired, listing: PropTypes.bool, section: PropTypes.string };
