import PaymentResultPage from "./pages/PaymentResultPage";
import { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import GuestLayout from "./components/GuestLayout";
import { getPhien, xoaPhien, SESSION_EVENT } from "./api/http";
import FavoriteFieldsPage from "./pages/FavoritePages";

import {
  HomePage,
  FieldDetailPage,
  BookingHistoryPage,
  ProfilePage,
  RegisterPage,
  LoginPage,
  ForgotPasswordPage,
} from "./pages/GuestPages";

import {
  BookingRequestsPage,
  ScheduleMatrixPage as StaffPageMatrixPage,
} from "./pages/StaffPagePages";
import {
  PosCheckinPage,
  ScheduleMatrixPage as StaffOnsiteMatrixPage,
  WalkinBookingPage,
} from "./pages/StaffOnsitePages";

import {
  AdminDashboardPage,
  AdminQuanLySanPage,
  AdminKhachHangPage,
  AdminNhanVienPage,
  AdminDoanhThuPage,
  AdminBaoCaoPage,
} from "./pages/AdminPages";
import { AdminCumSanPage, AdminPaymentsPage, AdminSchedulePage } from "./pages/AdminOperationsPages";

// Ánh xạ vai trò từ Backend Spring Boot sang Frontend Key
const VAI_TRO_TO_ROLE = {
  KHACH_HANG: "customer",
  NHAN_VIEN_PAGE: "staff_page",
  NHAN_VIEN_SAN: "staff_onsite",
  ADMIN: "admin",
  ROLE_ADMIN: "admin",
};

// Ánh xạ URL Path -> Page Key
const PATH_TO_PAGE = {
  "/ket-qua-thanh-toan": "payment-result",
  "/": "home",
  "/tim-san": "search",
  "/admin": "dashboard",
  "/admin/dashboard": "dashboard",
  "/admin/quan-ly-san": "quan-ly-san",
  "/admin/khung-gio-gia": "khung-gio-gia",
  "/admin/cum-san": "cum-san",
  "/admin/thanh-toan": "thanh-toan",
  "/admin/khach-hang": "khach-hang",
  "/admin/nhan-vien": "nhan-vien",
  "/admin/doanh-thu": "doanh-thu",
  "/admin/bao-cao": "bao-cao",
  "/ma-tran-lich": "staffpage-matrix",
  "/staff-page/requests": "staffpage-requests",
  "/staff-page/matrix": "staffpage-matrix",
  "/onsite/pos": "onsite-pos",
  "/onsite/thanh-toan": "onsite-payments",
  "/onsite/walkin": "onsite-walkin",
  "/onsite/matrix": "onsite-matrix",
  "/pos": "onsite-pos",
  "/lich-su": "history",
  "/lich-su-dat-san": "history",
  "/yeu-thich": "favorites",
  "/ho-so": "profile",
  "/dang-nhap": "login",
  "/dang-ky": "register",
  "/quen-mat-khau": "forgot-password",
};

// Ánh xạ Page Key -> URL Path
const PAGE_TO_PATH = {
  "payment-result": "/ket-qua-thanh-toan",
  home: "/",
  search: "/tim-san",
  featured: "/#courts",
  about: "/#about",
  "how-it-works": "/#how-it-works",
  dashboard: "/admin/dashboard",
  "quan-ly-san": "/admin/quan-ly-san",
  "khung-gio-gia": "/admin/khung-gio-gia",
  "cum-san": "/admin/cum-san",
  "thanh-toan": "/admin/thanh-toan",
  "khach-hang": "/admin/khach-hang",
  "nhan-vien": "/admin/nhan-vien",
  "doanh-thu": "/admin/doanh-thu",
  "bao-cao": "/admin/bao-cao",
  "staffpage-requests": "/staff-page/requests",
  "staffpage-matrix": "/staff-page/matrix",
  "onsite-pos": "/onsite/pos",
  "onsite-payments": "/onsite/thanh-toan",
  "onsite-walkin": "/onsite/walkin",
  "onsite-matrix": "/onsite/matrix",
  history: "/lich-su-dat-san",
  favorites: "/yeu-thich",
  profile: "/ho-so",
  login: "/dang-nhap",
  register: "/dang-ky",
  "forgot-password": "/quen-mat-khau",
};

// Phân quyền trang theo vai trò; quyền trên API vẫn phải được kiểm tra ở backend.
const ROLE_PERMISSIONS = {
  admin: new Set([
    "dashboard",
    "quan-ly-san",
    "khung-gio-gia",
    "cum-san",
    "thanh-toan",
    "khach-hang",
    "nhan-vien",
    "doanh-thu",
    "bao-cao",
    "staffpage-requests",
    "staffpage-matrix",
    "onsite-pos",
    "onsite-walkin",
    "onsite-matrix",
    "profile",
  ]),
  staff_page: new Set(["staffpage-requests", "staffpage-matrix", "profile"]),
  staff_onsite: new Set(["onsite-pos", "onsite-walkin", "onsite-matrix", "onsite-payments", "profile"]),
  customer: new Set(["home", "search", "featured", "about", "how-it-works", "history", "favorites", "profile", "field-detail"]),
  guest: new Set(["home", "search", "featured", "about", "how-it-works", "favorites", "field-detail", "register", "forgot-password", "login"]),
};

// Trích xuất linh hoạt Role từ phiên lưu trong localStorage/JWT
function extractRoleFromPhien(phien) {
  if (!phien) return "guest";
  const r = phien.role || phien.vaiTro || phien.user?.role || phien.user?.vaiTro;
  if (r === "ADMIN" || r === "admin" || r === "ROLE_ADMIN") {
    return "admin";
  }
  return VAI_TRO_TO_ROLE[r] || "customer";
}

function resolveFromLocation() {
  const path = window.location.pathname;
  if (path === "/" && window.location.hash) {
    const sections = { "#courts": "featured", "#about": "about", "#how-it-works": "how-it-works" };
    if (sections[window.location.hash]) return { page: sections[window.location.hash], fieldId: null };
  }
  const fieldMatch = /^\/san\/(\d+)$/.exec(path);
  if (fieldMatch) {
    return { page: "field-detail", fieldId: Number(fieldMatch[1]) };
  }
  return { page: PATH_TO_PAGE[path] || "home", fieldId: null };
}

function pathFor(page, fieldId) {
  if (page === "field-detail") return `/san/${fieldId}`;
  return PAGE_TO_PATH[page] || "/";
}

export default function App() {
  const initial = resolveFromLocation();
  const [page, setPage] = useState(initial.page);
  const [fieldId, setFieldId] = useState(initial.fieldId);

  const phienLuu = getPhien();
  const [role, setRole] = useState(extractRoleFromPhien(phienLuu));

  const [session, setSession] = useState(phienLuu);
  useEffect(() => {
    const sync = () => { const next = getPhien(); setSession(next); setRole(extractRoleFromPhien(next)); };
    window.addEventListener(SESSION_EVENT, sync); window.addEventListener("storage", sync);
    return () => { window.removeEventListener(SESSION_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  // Lắng nghe sự kiện đổi URL / Back-Forward trình duyệt
  useEffect(() => {
    const onPopState = () => {
      const resolved = resolveFromLocation();
      setPage(resolved.page);
      setFieldId(resolved.fieldId);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const goTo = useCallback((nextPage, nextFieldId = null) => {
    setPage(nextPage);
    setFieldId(nextFieldId);
    if (!["featured", "about", "how-it-works"].includes(nextPage)) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const url = pathFor(nextPage, nextFieldId);
    if (window.location.pathname + window.location.hash !== url) {
      window.history.pushState(null, "", url);
    }
  }, []);

  // Hàm kiểm tra Route Guard bảo mật
  const canAccess = (targetPage, userRole) => {
    if (userRole === "admin") return true;
    const allowedPages = ROLE_PERMISSIONS[userRole] || new Set(["home", "field-detail"]);
    return allowedPages.has(targetPage);
  };

  const handleNavigate = (pathOrKey) => {
    const matchField = /^field-(\d+)$/.exec(pathOrKey);
    if (matchField) {
      goTo("field-detail", Number(matchField[1]));
      return;
    }

    let targetPage = PATH_TO_PAGE[pathOrKey] || pathOrKey;
    const legacyAliases = {
      "/admin": "dashboard",
      matrix: "staffpage-matrix",
      pos: "onsite-pos",
    };
    targetPage = legacyAliases[targetPage] || targetPage;
    if (pathOrKey === "/") {
      targetPage = role === "admin" ? "dashboard" : "home";
    }

    if (targetPage === "login" && page === "history" && role === "guest") sessionStorage.setItem("postLoginPage", "history");
    if (targetPage === "history" && role === "guest") {
      sessionStorage.setItem("postLoginPage", "history");
      goTo("login");
      return;
    }
    if (!canAccess(targetPage, role)) {
      alert("Bạn không có quyền truy cập vào chức năng này!");
      return;
    }

    goTo(targetPage);
  };

  // Đăng nhập thành công -> Điều hướng đúng Trang chủ của từng Role
  const handleLoginSuccess = (phien) => {
    const newRole = extractRoleFromPhien(phien);
    setRole(newRole);

    const returnToHistory = sessionStorage.getItem("postLoginPage") === "history";
    sessionStorage.removeItem("postLoginPage");
    if (newRole === "customer" && returnToHistory) {
      goTo("history");
    } else if (newRole === "admin") {
      goTo("dashboard");
    } else if (newRole === "staff_onsite") {
      goTo("onsite-pos");
    } else if (newRole === "staff_page") {
      goTo("staffpage-matrix");
    } else {
      goTo("home");
    }
  };

  const handleLogout = () => {
    xoaPhien();
    setRole("guest");
    goTo("home");
  };

  const renderPage = () => {
    // Nếu truy cập trái phép -> Hiển thị thông báo 403
    if (!canAccess(page, role)) {
      return (
        <div className="p-8 text-center text-red-600 font-extrabold text-lg">
          403 - TỪ CHỐI TRUY CẬP (BẠN KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY)
        </div>
      );
    }

    switch (page) {
      case "home":
      case "featured":
      case "about":
      case "how-it-works":
        return <HomePage onNavigate={handleNavigate} section={page} />;
      case "search":
        return <HomePage onNavigate={handleNavigate} listing />;

      case "dashboard":
        return <AdminDashboardPage />;

      case "quan-ly-san":
        return <AdminQuanLySanPage />;

      case "khung-gio-gia":
        return <AdminSchedulePage />;

      case "cum-san":
        return <AdminCumSanPage />;

      case "onsite-payments":
      case "thanh-toan":
        return <AdminPaymentsPage />;

      case "khach-hang":
        return <AdminKhachHangPage />;

      case "nhan-vien":
        return <AdminNhanVienPage />;

      case "doanh-thu":
        return <AdminDoanhThuPage />;

      case "bao-cao":
        return <AdminBaoCaoPage />;

      case "field-detail":
        return <FieldDetailPage fieldId={fieldId} onNavigate={handleNavigate} />;

      case "staffpage-requests":
        return <BookingRequestsPage />;

      case "staffpage-matrix":
        return <StaffPageMatrixPage />;

      case "onsite-pos":
        return <PosCheckinPage />;

      case "onsite-walkin":
        return <WalkinBookingPage />;

      case "onsite-matrix":
        return <StaffOnsiteMatrixPage />;

      case "history":
        return <BookingHistoryPage />;

      case "favorites":
        return <FavoriteFieldsPage onNavigate={handleNavigate} />;

      case "profile":
        return <ProfilePage />;

      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;

      case "forgot-password":
        return <ForgotPasswordPage onNavigate={handleNavigate} />;

      default:
        return role === "admin" ? <AdminDashboardPage /> : <HomePage onNavigate={handleNavigate} />;
    }
  };

  if (page === "history" && role === "guest") return <GuestLayout onNavigate={handleNavigate} currentPage={page}><section className="mx-auto my-8 max-w-xl rounded-2xl bg-white p-6"><h1 className="text-2xl font-bold">Lịch sử đặt sân</h1><p className="my-4">Đăng nhập để xem lịch sử đặt sân của bạn.</p><button className="club-button" onClick={() => handleNavigate("history")}>Đăng nhập</button></section></GuestLayout>;
  if (page === "login") return <LoginPage onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  if (page === "register" && canAccess(page, role)) return <RegisterPage onNavigate={handleNavigate} />;

  if (page === "payment-result") return <GuestLayout onNavigate={handleNavigate} currentPage={page}><PaymentResultPage onNavigate={handleNavigate} /></GuestLayout>;

  const GUEST_PAGES = new Set(["home", "search", "featured", "about", "how-it-works", "favorites", "field-detail", "forgot-password"]);
  if (role === "guest" && GUEST_PAGES.has(page)) {
    return <GuestLayout onNavigate={handleNavigate} currentPage={page}>{renderPage()}</GuestLayout>;
  }

  const phienHienTai = session;
  const rawName = phienHienTai?.hoTen || phienHienTai?.username || "Người dùng";
  const userNameReal = rawName.includes("@") ? rawName.split("@")[0] : rawName;

  return (
    <Layout
      role={role}
      userName={userNameReal}
      currentPage={page}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}
