import PublicLayout from "./PublicLayout";
import Brand from "./Brand";
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { NAV, ROLE_COLORS, ROLE_LABELS } from "./navigationConfig";

export default function Layout({ role, userName, currentPage, onNavigate, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const sidebar = useRef(null), toggleButton = useRef(null);
  useEffect(() => {
    if (!menuOpen) return undefined;
    sidebar.current?.querySelector("button")?.focus();
    const key = (event) => {
      if (event.key === "Escape") { setMenuOpen(false); toggleButton.current?.focus(); }
      if (event.key === "Tab") {
        const items = [...sidebar.current.querySelectorAll("button")].filter((item) => item.offsetParent !== null);
        const first=items[0],last=items[items.length-1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menuOpen]);
  const displayName = userName;
  const isCustomer = role === "customer";
  const navItems = NAV[role] || [];
  const currentLabel = navItems.find((item) => item.page === currentPage)?.label || "Hồ sơ cá nhân";
  const homePage = role === "admin" ? "dashboard" : role === "staff_page" ? "staffpage-matrix" : role === "staff_onsite" ? "onsite-pos" : "home";

  if (isCustomer) return <PublicLayout onNavigate={onNavigate} onLogout={onLogout} currentPage={currentPage} userName={displayName}>{children}</PublicLayout>;

  return (
    <div className="operations-shell flex min-h-screen">
      <aside ref={sidebar} role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen ? "true" : undefined} aria-label="Điều hướng điều hành" className={`${menuOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto lg:static lg:block operations-sidebar shrink-0 p-4`}>
        <div className="operations-brand"><Brand onNavigate={() => onNavigate(homePage)} light /></div>
        {menuOpen && <button type="button" className="operations-close lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Đóng menu điều hành">×</button>}

        <nav className="space-y-1.5">
          {role === "admin" && <p className="px-3.5 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#64748B]">Quản trị hệ thống</p>}
          {navItems.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => { onNavigate(item.page); setMenuOpen(false); }}
              aria-current={currentPage === item.page ? "page" : undefined}
              className={`operations-nav flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                currentPage === item.page
                  ? "active"
                  : ""
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-[#f4d5d5] bg-[#fff3f3] px-3.5 py-2.5 text-sm font-bold text-[#dc2626] transition hover:bg-[#fee2e2]"
          >
            ↪ Đăng xuất
          </button>
        </nav>
      </aside>

      {menuOpen && <button type="button" aria-label="Đóng menu" className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="operations-header sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white/85 px-4 backdrop-blur-sm sm:px-8">
          <button ref={toggleButton} type="button" aria-label="Mở menu điều hướng" aria-expanded={menuOpen} className="mr-3 h-11 w-11 shrink-0 rounded-xl border border-slate-200 lg:hidden" onClick={() => setMenuOpen((open) => !open)}>☰</button>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#DA1A32]">{ROLE_LABELS[role] || "Trung tâm điều hành"}</p>
            <p className="truncate text-sm font-black text-[#0B0F14]">{currentLabel}</p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("profile")}
            aria-label="Mở hồ sơ cá nhân"
            className="flex shrink-0 items-center gap-2.5 rounded-full border border-[#FFF0F2] bg-[#FFF0F2] px-3 py-1.5 transition hover:bg-[#FDE5E9]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DA1A32] text-xs font-black text-white shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden text-sm font-bold text-[#0B0F14] sm:inline">{displayName}</span>
            <span className={`hidden rounded-full px-2 py-1 text-[10px] font-black sm:inline-flex ${ROLE_COLORS[role] || ROLE_COLORS.guest}`}>
              {ROLE_LABELS[role] || ROLE_LABELS.guest}
            </span>
          </button>
        </header>

        <main className="operations-content flex-1">{children}</main>
      </div>
    </div>
  );
}

Layout.propTypes = {
  role: PropTypes.string.isRequired,
  userName: PropTypes.string,
  currentPage: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  children: PropTypes.node,
};
