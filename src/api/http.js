export const BASE_URL = (import.meta.env?.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
export const SESSION_EVENT = "san-bong-session";
export function getPhien() {
  try {
    const value = JSON.parse((sessionStorage.getItem("phien") || localStorage.getItem("phien")) || "null");
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}
export function getToken() { return sessionStorage.getItem("token") || localStorage.getItem("token") || localStorage.getItem("accessToken") || getPhien()?.token; }
export function savePhien(value, remember = !sessionStorage.getItem("phien")) {
  const storage = remember ? localStorage : sessionStorage;
  for (const other of [localStorage, sessionStorage]) {
    ["token", "accessToken", "phien"].forEach((key) => other.removeItem(key));
  }
  storage.setItem("phien", JSON.stringify(value));
  const token = value?.token || value?.accessToken;
  if (token) storage.setItem("token", token);
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export function xoaPhien() {
  for (const storage of [localStorage, sessionStorage]) {
    ["token", "accessToken", "phien"].forEach((key) => storage.removeItem(key));
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}
export async function http(endpoint, options = {}) {
  const { params, ...fetchOptions } = options;
  const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value != null)).toString();
  const url = `${BASE_URL}${endpoint}${query ? `${endpoint.includes("?") ? "&" : "?"}${query}` : ""}`;
  if (window.location.protocol === "https:" && /^http:\/\//i.test(url)) throw new Error("API cần dùng HTTPS trên trang HTTPS. Kiểm tra VITE_API_BASE_URL.");
  const token = getToken();
  const response = await fetch(url, {
    ...fetchOptions,
    headers: { ...(fetchOptions.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...fetchOptions.headers },
  });
  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); }
    catch {
      if (response.ok && response.headers.get("content-type")?.includes("application/json")) throw new Error("API trả dữ liệu JSON không hợp lệ.");
      data = raw;
    }
  }
  if (!response.ok) {
    if (response.status === 401 && token) xoaPhien();
    const details = data?.fields ? Object.values(data.fields).join("; ") : "";
    const message = typeof data === "string" ? data : data?.message || data?.error;
    const error = new Error([message || (response.status === 403 ? "Bạn không có quyền thực hiện thao tác này." : `Lỗi HTTP ${response.status}`), details].filter(Boolean).join(": "));
    error.status = response.status;
    error.response = { data, status: response.status };
    throw error;
  }
  return { data, status: response.status, ok: true };
}
http.get = (endpoint, options = {}) => http(endpoint, { ...options, method: "GET" });
for (const method of ["post", "put", "patch"]) {
  http[method] = (endpoint, body, options = {}) => http(endpoint, { ...options, method: method.toUpperCase(), body: body instanceof FormData ? body : JSON.stringify(body) });
}
http.delete = (endpoint, options = {}) => http(endpoint, { ...options, method: "DELETE" });
