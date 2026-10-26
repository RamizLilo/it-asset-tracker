// Translates between the app state (camelCase objects) and the database tables (snake_case rows),
// loads everything from Supabase and writes only what changed.

const nul = (v) => (v === "" || v === undefined ? null : v);
const str = (v) => (v == null ? "" : v);
const num = (v) => (v == null ? null : Number(v));

// Order matters: a table must come after the tables it points to (foreign keys).
export const TABLES = [
  { key: "locations", table: "locations",
    to: (x) => ({ id: x.id, name: x.name, site: x.site || "" }),
    from: (r) => ({ id: r.id, name: r.name, site: str(r.site) }) },
  { key: "vendors", table: "vendors",
    to: (x) => ({ id: x.id, name: x.name, contact: x.contact || "", email: x.email || "", phone: x.phone || "", website: x.website || "" }),
    from: (r) => ({ id: r.id, name: r.name, contact: str(r.contact), email: str(r.email), phone: str(r.phone), website: str(r.website) }) },
  { key: "employees", table: "employees",
    to: (x) => ({ id: x.id, name: x.name, email: x.email || "", department: x.department || "", title: x.title || "", location_id: nul(x.locationId), active: x.active !== false }),
    from: (r) => ({ id: r.id, name: r.name, email: str(r.email), department: str(r.department), title: str(r.title), locationId: r.location_id, active: r.active }) },
  { key: "assets", table: "assets",
    to: (x) => ({ id: x.id, tag: x.tag, name: x.name, category: x.category, manufacturer: x.manufacturer || "", model: x.model || "", serial: x.serial || "", status: x.status, condition: x.condition || "good",
      location_id: nul(x.locationId), assignee_id: nul(x.assigneeId), vendor_id: nul(x.vendorId), purchase_date: nul(x.purchaseDate), price: x.price == null || x.price === "" ? null : Number(x.price),
      warranty_end: nul(x.warrantyEnd), invoice: x.invoice || "", notes: x.notes || "", maintenance_every: Number(x.maintenanceEvery) || 0, created_at: x.createdAt || new Date().toISOString(), custom: x.custom || {} }),
    from: (r) => ({ id: r.id, tag: r.tag, name: r.name, category: r.category, manufacturer: str(r.manufacturer), model: str(r.model), serial: str(r.serial), status: r.status, condition: r.condition,
      locationId: r.location_id, assigneeId: r.assignee_id, vendorId: r.vendor_id, purchaseDate: str(r.purchase_date), price: num(r.price), warrantyEnd: str(r.warranty_end), invoice: str(r.invoice),
      notes: str(r.notes), maintenanceEvery: r.maintenance_every || 0, createdAt: r.created_at, custom: r.custom || {} }) },
  { key: "maintenance", table: "maintenance",
    to: (x) => ({ id: x.id, asset_id: x.assetId, type: x.type, title: x.title, status: x.status, due: x.due, done_date: nul(x.doneDate), cost: Number(x.cost) || 0, technician: x.technician || "", notes: x.notes || "" }),
    from: (r) => ({ id: r.id, assetId: r.asset_id, type: r.type, title: r.title, status: r.status, due: r.due, doneDate: str(r.done_date), cost: num(r.cost) || 0, technician: str(r.technician), notes: str(r.notes) }) },
  { key: "licenses", table: "licenses",
    to: (x) => ({ id: x.id, name: x.name, vendor_id: nul(x.vendorId), kind: x.kind || "subscription", seats: Number(x.seats), cost: Number(x.cost) || 0, key: x.key || "", purchase_date: nul(x.purchaseDate), expiry: nul(x.expiry), notes: x.notes || "" }),
    from: (r) => ({ id: r.id, name: r.name, vendorId: r.vendor_id, kind: r.kind, seats: r.seats, cost: num(r.cost) || 0, key: str(r.key), purchaseDate: str(r.purchase_date), expiry: str(r.expiry), notes: str(r.notes), assigned: [] }) },
  { key: "consumables", table: "consumables",
    to: (x) => ({ id: x.id, name: x.name, category: x.category || "other", stock: Number(x.stock) || 0, reorder_at: Number(x.reorderAt) || 0, unit: x.unit || "pcs", cost: Number(x.cost) || 0, location_id: nul(x.locationId) }),
    from: (r) => ({ id: r.id, name: r.name, category: r.category, stock: r.stock, reorderAt: r.reorder_at, unit: r.unit, cost: num(r.cost) || 0, locationId: r.location_id }) },
  { key: "activity", table: "activity", appendOnly: true,
    to: (x) => ({ id: x.id, ts: x.ts, user_name: x.user || "", role: x.role || "", action: x.action, entity: x.entity, entity_id: x.entityId || "", label: x.label || "", detail: x.detail || "" }),
    from: (r) => ({ id: r.id, ts: r.ts, user: r.user_name, role: r.role, action: r.action, entity: r.entity, entityId: r.entity_id, label: r.label, detail: r.detail }) },
];

export const settingsToRow = (s) => ({ id: 1, company: s.company, currency: s.currency, depreciation_years: s.depreciationYears, warranty_alert_days: s.warrantyAlertDays, maintenance_alert_days: s.maintenanceAlertDays, custom_fields: s.customFields || [] });
export const settingsFromRow = (r) => ({ company: r.company, currency: r.currency, depreciationYears: r.depreciation_years, warrantyAlertDays: r.warranty_alert_days, maintenanceAlertDays: r.maintenance_alert_days, customFields: r.custom_fields || [] });

const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
const chunks = (a, n = 400) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

export async function loadAll(sb) {
  const out = {};
  for (const T of TABLES) {
    let q = sb.from(T.table).select("*");
    if (T.key === "activity") q = q.order("ts", { ascending: false }).limit(500);
    out[T.key] = ok(await q).map(T.from);
  }
  const seats = ok(await sb.from("license_seats").select("*"));
  out.licenses.forEach((l) => { l.assigned = seats.filter((s) => s.license_id === l.id).map((s) => s.employee_id); });
  const st = ok(await sb.from("settings").select("*").eq("id", 1));
  return { ...out, settingsRow: st[0] ? settingsFromRow(st[0]) : {} };
}

const seatKey = (l, e) => `${l}|${e}`;
const seatsOf = (licenses) => new Set(licenses.flatMap((l) => l.assigned.map((e) => seatKey(l.id, e))));

// Compare the old and the new state and send only the difference.
export async function syncDiff(sb, prev, next) {
  const dels = [];
  for (const T of TABLES) {
    const before = new Map(prev[T.key].map((x) => [x.id, JSON.stringify(T.to(x))]));
    const rows = next[T.key].map(T.to).filter((r) => before.get(r.id) !== JSON.stringify(r));
    for (const part of chunks(rows)) ok(await sb.from(T.table).upsert(part));
    if (T.key === "licenses") {
      // seats come right after the licenses exist
      const a = seatsOf(prev.licenses), b = seatsOf(next.licenses);
      const add = [...b].filter((k) => !a.has(k)).map((k) => { const [license_id, employee_id] = k.split("|"); return { license_id, employee_id }; });
      for (const part of chunks(add)) ok(await sb.from("license_seats").upsert(part));
      for (const k of [...a].filter((k) => !b.has(k))) { const [l, e] = k.split("|"); ok(await sb.from("license_seats").delete().eq("license_id", l).eq("employee_id", e)); }
    }
    const nextIds = new Set(next[T.key].map((x) => x.id));
    const gone = prev[T.key].filter((x) => !nextIds.has(x.id)).map((x) => x.id);
    // the log only shrinks when the whole log is cleared
    if (gone.length && (!T.appendOnly || next[T.key].length === 0)) dels.push([T.table, gone]);
  }
  // deletes run backwards, so a table is emptied before the tables it points to
  for (const [table, ids] of dels.reverse()) for (const part of chunks(ids)) ok(await sb.from(table).delete().in("id", part));
  const sp = settingsToRow(prev.settings), sn = settingsToRow(next.settings);
  if (JSON.stringify(sp) !== JSON.stringify(sn)) ok(await sb.from("settings").upsert(sn));
}
