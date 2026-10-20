export function vietnamDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function daysBefore(iso, days) {
  const date = new Date(`${iso}T12:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() - days);
  return vietnamDate(date);
}
export function validDateRange(start, end) {
  return /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start <= end;
}
