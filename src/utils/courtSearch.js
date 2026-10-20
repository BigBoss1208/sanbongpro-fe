export function normalizedText(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
}

export function filterCourts(courts, { keyword = "", cluster = "", type = "", sort = "name" } = {}) {
  const query = normalizedText(keyword);
  const price = (court) => court.giaThapNhat == null || !Number.isFinite(Number(court.giaThapNhat)) ? null : Number(court.giaThapNhat);
  return courts.filter((court) => (!cluster || String(court.cumSanId) === cluster)
    && (!type || court.loaiSan === type)
    && normalizedText(`${court.tenSan ?? ""} ${court.tenCumSan ?? ""} ${court.moTa ?? ""}`).includes(query))
    .sort((a, b) => {
      if (sort !== "name") {
        const first = price(a), second = price(b);
        if (first === null && second !== null) return 1;
        if (second === null && first !== null) return -1;
        if (first !== null && second !== null && first !== second) return sort === "price-desc" ? second - first : first - second;
      }
      return String(a.tenSan ?? "").localeCompare(String(b.tenSan ?? ""), "vi");
    });
}
