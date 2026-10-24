// Small helpers shared by all pages
export const todayIso = () => new Date().toISOString().slice(0, 10);
export const addDays = (n, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const daysUntil = (iso) => (iso ? Math.round((new Date(iso + "T00:00:00") - new Date(todayIso() + "T00:00:00")) / 86400000) : null);
export const uid = (p = "x") => `${p}_${Math.random().toString(36).slice(2, 9)}`;

export const STATUSES = ["in_use", "in_stock", "in_repair", "retired", "lost"];
export const CATEGORIES = ["laptop", "desktop", "monitor", "phone", "tablet", "printer", "network", "server", "peripheral", "other"];
export const CONDITIONS = ["new", "good", "fair", "poor"];
export const MAINT_TYPES = ["repair", "preventive", "inspection", "upgrade"];
export const MAINT_STATUSES = ["scheduled", "in_progress", "done"];
export const ROLES = ["admin", "technician", "viewer"];
export const PREFIX = { laptop: "LT", desktop: "DT", monitor: "MN", phone: "PH", tablet: "TB", printer: "PR", network: "NW", server: "SV", peripheral: "PE", other: "OT" };

export function makeFormatters(lang, currency) {
  const locale = lang === "de" ? "de-DE" : "en-GB";
  const money = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
  const money2 = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" });
  const dt = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  return {
    locale,
    money: (n) => (n == null || Number.isNaN(n) ? "–" : money.format(n)),
    money2: (n) => (n == null || Number.isNaN(n) ? "–" : money2.format(n)),
    num: (n) => num.format(n ?? 0),
    date: (iso) => (iso ? date.format(new Date(iso.length > 10 ? iso : iso + "T00:00:00")) : "–"),
    dt: (iso) => (iso ? dt.format(new Date(iso)) : "–"),
  };
}

// Straight-line depreciation, no residual value
export function bookValue(asset, years) {
  if (!asset.price || !asset.purchaseDate) return null;
  const age = (Date.now() - new Date(asset.purchaseDate).getTime()) / (365.25 * 86400000);
  return Math.max(0, asset.price * (1 - age / Math.max(1, years)));
}
export const ageYears = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / (365.25 * 86400000) : null);

// warranty: none | expired | soon | ok
export function warrantyState(asset, alertDays) {
  if (!asset.warrantyEnd) return "none";
  const d = daysUntil(asset.warrantyEnd);
  if (d < 0) return "expired";
  return d <= alertDays ? "soon" : "ok";
}

export function sortBy(rows, key, dir, get) {
  const g = get || ((r) => r[key]);
  return [...rows].sort((a, b) => {
    const x = g(a), y = g(b);
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    const c = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: "base" });
    return dir === "desc" ? -c : c;
  });
}
