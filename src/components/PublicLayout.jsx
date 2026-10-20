import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Brand from "./Brand";
import { PUBLIC_NAV } from "./navigationConfig";

export default function PublicLayout({ onNavigate, onLogout, currentPage = "home", userName, children }) {
 const [open, setOpen] = useState(false);
 const trigger = useRef(null);
 const account = useRef(null);
 const drawer = useRef(null);
 const navigate = (page) => { setOpen(false); account.current?.removeAttribute("open"); onNavigate(page); };
 useEffect(() => {
  if (!open) return undefined;
  drawer.current?.querySelector("a, button")?.focus();
  const close = (event) => {
   if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
   if (event.key === "Tab") {
    const items = [...drawer.current.querySelectorAll("a, button")];
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
   }
  };
  document.addEventListener("keydown", close);
  return () => document.removeEventListener("keydown", close);
 }, [open]);
 const navItems = userName ? [...PUBLIC_NAV.slice(0, 4), { label: "Lịch sử đặt sân", page: "history", href: "/lich-su-dat-san" }, ...PUBLIC_NAV.slice(4)] : PUBLIC_NAV;
 const links = navItems.map((item) => <a key={item.page} href={item.href} aria-current={currentPage === item.page ? "page" : undefined} className={`club-nav-link ${currentPage === item.page ? "active" : ""}`} onClick={(event) => { if (event.ctrlKey || event.metaKey || event.shiftKey) return; event.preventDefault(); navigate(item.page); }}>{item.label}</a>);
 return <div className="public-shell">
  <a href="#main-content" className="skip-link">Đến nội dung chính</a>
  <header className="club-header"><div className="club-header-inner">
   <Brand onNavigate={navigate} light />
   <nav className="club-desktop-nav" aria-label="Điều hướng chính">{links}</nav>
   <div className="club-header-actions">{userName ? <details ref={account} className="club-account"><summary><span className="club-avatar">{userName.charAt(0).toUpperCase()}</span><span className="club-user-name">{userName}</span><span aria-hidden="true">⌄</span></summary><div className="club-account-menu"><button onClick={() => navigate("history")}>Lịch sử đặt sân</button><button onClick={() => navigate("favorites")}>Sân yêu thích</button><button onClick={() => navigate("profile")}>Hồ sơ & mật khẩu</button><button onClick={onLogout}>Đăng xuất</button></div></details> : <><button className="club-login" onClick={() => navigate("login")}>Đăng nhập</button><button className="club-register" onClick={() => navigate("register")}>Đăng ký</button></>}
    <button ref={trigger} className="club-menu-trigger" aria-label="Mở menu điều hướng" aria-expanded={open} aria-controls="public-menu" onClick={() => setOpen((value) => !value)}>☰</button>
   </div>
  </div></header>
  {open && <div className="club-drawer-backdrop" onClick={() => setOpen(false)}><nav ref={drawer} id="public-menu" className="club-mobile-nav" aria-label="Điều hướng mobile" onClick={(event) => event.stopPropagation()}><button className="club-drawer-close" onClick={() => { setOpen(false); trigger.current?.focus(); }} aria-label="Đóng menu">×</button>{links}{!userName && <button onClick={() => navigate("login")}>Đăng nhập</button>}</nav></div>}
  <main id="main-content">{children}</main>
  <footer className="club-footer"><div><Brand onNavigate={navigate} light /><p>Tìm sân phù hợp. Chọn lịch rõ ràng.<br />Sẵn sàng cho trận đấu tiếp theo.</p></div><nav aria-label="Điều hướng cuối trang"><a href="/tim-san" onClick={(event) => { event.preventDefault(); navigate("search"); }}>Tìm sân bóng</a><a href="/yeu-thich" onClick={(event) => { event.preventDefault(); navigate("favorites"); }}>Sân yêu thích</a><a href="/#how-it-works" onClick={(event) => { event.preventDefault(); navigate("how-it-works"); }}>Cách đặt sân</a></nav><span>© {new Date().getFullYear()} SÂN BÓNG PRO<br /><small>YOUR NEXT GAME STARTS HERE.</small></span></footer>
 </div>;
}
PublicLayout.propTypes = { onNavigate: PropTypes.func.isRequired, onLogout: PropTypes.func, currentPage: PropTypes.string, userName: PropTypes.string, children: PropTypes.node };
