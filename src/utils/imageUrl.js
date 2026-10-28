export function validateImageUrl(value) {
  const text = value.trim();
  let url;
  try { url = new URL(text); } catch { throw new Error("Nhập URL ảnh HTTPS hợp lệ."); }
  const host = url.hostname;
  if (text.length > 255 || url.href.length > 255 || url.protocol !== "https:"
    || !host.includes(".") || host.endsWith(".") || /^[\d.]+$/.test(host)
    || host.includes(":") || /\.(localhost|local|internal)$/.test(host)
    || url.username || url.password || url.search || url.hash
    || (url.port && url.port !== "443") || url.pathname.length < 2) {
    throw new Error("Dùng URL ảnh HTTPS công khai, tối đa 255 ký tự, không có tài khoản, query hoặc fragment.");
  }
  return url.href;
}

export function loadImageUrl(value, ImageClass = Image) {
  const url = validateImageUrl(value);
  return new Promise((resolve, reject) => {
    const image = new ImageClass();
    const finish = (error) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (error) reject(new Error("Không tải được ảnh từ URL. Ảnh cũ được giữ nguyên."));
      else resolve(url);
    };
    const timer = setTimeout(() => finish(true), 10000);
    image.onload = () => finish(!image.naturalWidth);
    image.onerror = () => finish(true);
    image.referrerPolicy = "no-referrer";
    image.src = url;
  });
}
