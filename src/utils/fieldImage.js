export function fieldImageUrl(reference) {
  if (typeof reference !== "string" || !reference.trim()) return "/assets/court-placeholder.svg";
  const base = (import.meta.env?.VITE_MINIO_PUBLIC_URL || "").trim().replace(/\/+$/, "");
  // No fallback to storage owned by another project/account.
  if (!base) return "/assets/court-placeholder.svg";
  try { const endpoint = new URL(base); if (!/^https?:$/.test(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return "/assets/court-placeholder.svg"; }
  catch { return "/assets/court-placeholder.svg"; }
  let key = reference.trim();
  if (/^https?:\/\//i.test(key)) {
    try { const url = new URL(key); const endpoint = new URL(base); if (url.origin !== endpoint.origin || !url.pathname.startsWith(endpoint.pathname + "/")) return "/assets/court-placeholder.svg"; key = url.pathname.slice(endpoint.pathname.length + 1); }
    catch { return "/assets/court-placeholder.svg"; }
  }
  key = key.replace(/^\/+/, "");
  const bucket = base.split("/").pop();
  if (key.startsWith(bucket + "/")) key = key.slice(bucket.length + 1);
  if (!key || key.includes("..") || key.includes("\\") || key.includes(":")) return "/assets/court-placeholder.svg";
  try { return `${base}/${key.split("/").map(segment => encodeURIComponent(decodeURIComponent(segment))).join("/")}`; }
  catch { return "/assets/court-placeholder.svg"; }
}
