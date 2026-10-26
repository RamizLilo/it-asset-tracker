import { uid, PREFIX } from "./utils";

const MAX_LOG = 500;
export function nextTag(assets, category) {
  const pre = PREFIX[category] || "OT";
  const max = assets.reduce((m, a) => (a.tag.startsWith(pre + "-") ? Math.max(m, parseInt(a.tag.slice(pre.length + 1), 10) || 0) : m), 0);
  return `${pre}-${String(max + 1).padStart(4, "0")}`;
}

function log(s, action, entity, entityId, label, detail = "") {
  const entry = { id: uid("h"), ts: new Date().toISOString(), user: s.settings.user, role: s.settings.role, action, entity, entityId, label, detail };
  return [entry, ...s.activity].slice(0, MAX_LOG);
}
const nameOf = (list, id) => list.find((x) => x.id === id)?.name || "–";

// Pure state changes. The checks (permissions, "still in use") happen before in store.jsx.
export function reduce(s, a) {
  const p = a.payload;
  switch (a.type) {
    case "asset/add": {
      const asset = { id: uid("a"), createdAt: new Date().toISOString(), notes: "", maintenanceEvery: 0, ...p, tag: p.tag || nextTag(s.assets, p.category) };
      return { ...s, assets: [asset, ...s.assets], activity: log(s, "create", "asset", asset.id, asset.tag, asset.name) };
    }
    case "asset/update": {
      const old = s.assets.find((x) => x.id === p.id);
      if (!old) return s;
      const next = { ...old, ...p.patch };
      const diffs = [];
      if (old.status !== next.status) diffs.push(`status: ${old.status} → ${next.status}`);
      if (old.assigneeId !== next.assigneeId) diffs.push(`user: ${nameOf(s.employees, old.assigneeId)} → ${nameOf(s.employees, next.assigneeId)}`);
      if (old.locationId !== next.locationId) diffs.push(`location: ${nameOf(s.locations, old.locationId)} → ${nameOf(s.locations, next.locationId)}`);
      if (old.condition !== next.condition) diffs.push(`condition: ${old.condition} → ${next.condition}`);
      return { ...s, assets: s.assets.map((x) => (x.id === p.id ? next : x)), activity: log(s, "update", "asset", old.id, next.tag, diffs.join("; ") || "details edited") };
    }
    case "asset/delete": {
      const gone = s.assets.filter((x) => p.ids.includes(x.id));
      return {
        ...s, assets: s.assets.filter((x) => !p.ids.includes(x.id)), maintenance: s.maintenance.filter((m) => !p.ids.includes(m.assetId)),
        activity: log(s, "delete", "asset", gone[0]?.id || "", gone.length === 1 ? gone[0].tag : `${gone.length} assets`, gone.map((g) => g.tag).join(", ").slice(0, 120)),
      };
    }
    case "asset/bulk": {
      const keys = Object.keys(p.patch).join(", ");
      return { ...s, assets: s.assets.map((x) => (p.ids.includes(x.id) ? { ...x, ...p.patch } : x)), activity: log(s, "bulk", "asset", "", `${p.ids.length} assets`, `set ${keys}`) };
    }
    case "asset/checkout": {
      const e = s.employees.find((x) => x.id === p.employeeId);
      const old = s.assets.find((x) => x.id === p.id);
      return {
        ...s, assets: s.assets.map((x) => (x.id === p.id ? { ...x, assigneeId: p.employeeId, status: "in_use", locationId: e?.locationId || x.locationId } : x)),
        activity: log(s, "checkout", "asset", p.id, old.tag, `${e?.name || "–"}${p.note ? ` · ${p.note}` : ""}`),
      };
    }
    case "asset/checkin": {
      const old = s.assets.find((x) => x.id === p.id);
      return {
        ...s, assets: s.assets.map((x) => (x.id === p.id ? { ...x, assigneeId: null, status: "in_stock", locationId: p.locationId || "loc5" } : x)),
        activity: log(s, "checkin", "asset", p.id, old.tag, `${nameOf(s.employees, old.assigneeId)}${p.note ? ` · ${p.note}` : ""}`),
      };
    }
    case "asset/duplicate": {
      const old = s.assets.find((x) => x.id === p.id);
      const copy = { ...old, id: uid("a"), tag: nextTag(s.assets, old.category), serial: "", assigneeId: null, status: "in_stock", createdAt: new Date().toISOString() };
      return { ...s, assets: [copy, ...s.assets], activity: log(s, "create", "asset", copy.id, copy.tag, `copy of ${old.tag}`) };
    }
    case "asset/import": {
      let assets = [...s.assets];
      p.rows.forEach((r) => { assets = [{ id: uid("a"), notes: "", maintenanceEvery: 0, createdAt: new Date().toISOString(), ...r, tag: r.tag || nextTag(assets, r.category) }, ...assets]; });
      return { ...s, assets, activity: log(s, "import", "asset", "", `${p.rows.length} assets`, "CSV import") };
    }

    case "emp/add": { const e = { id: uid("e"), active: true, ...p }; return { ...s, employees: [...s.employees, e], activity: log(s, "create", "employee", e.id, e.name) }; }
    case "emp/update": return { ...s, employees: s.employees.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "employee", p.id, nameOf(s.employees, p.id), "details edited") };
    case "emp/delete": return { ...s, employees: s.employees.filter((x) => x.id !== p.id), licenses: s.licenses.map((l) => ({ ...l, assigned: l.assigned.filter((i) => i !== p.id) })), activity: log(s, "delete", "employee", p.id, nameOf(s.employees, p.id)) };

    case "loc/add": { const l = { id: uid("loc"), ...p }; return { ...s, locations: [...s.locations, l], activity: log(s, "create", "location", l.id, l.name) }; }
    case "loc/update": return { ...s, locations: s.locations.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "location", p.id, nameOf(s.locations, p.id)) };
    case "loc/delete": return { ...s, locations: s.locations.filter((x) => x.id !== p.id), activity: log(s, "delete", "location", p.id, nameOf(s.locations, p.id)) };

    case "vendor/add": { const v = { id: uid("v"), ...p }; return { ...s, vendors: [...s.vendors, v], activity: log(s, "create", "vendor", v.id, v.name) }; }
    case "vendor/update": return { ...s, vendors: s.vendors.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "vendor", p.id, nameOf(s.vendors, p.id)) };
    case "vendor/delete": return { ...s, vendors: s.vendors.filter((x) => x.id !== p.id), activity: log(s, "delete", "vendor", p.id, nameOf(s.vendors, p.id)) };

    case "maint/add": { const m = { id: uid("m"), doneDate: "", notes: "", cost: 0, ...p }; return { ...s, maintenance: [m, ...s.maintenance], activity: log(s, "create", "maintenance", m.id, s.assets.find((x) => x.id === m.assetId)?.tag || "", m.title) }; }
    case "maint/update": return { ...s, maintenance: s.maintenance.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "maintenance", p.id, s.maintenance.find((x) => x.id === p.id)?.title || "") };
    case "maint/complete": {
      const m = s.maintenance.find((x) => x.id === p.id);
      const done = { ...m, status: "done", doneDate: new Date().toISOString().slice(0, 10), cost: p.cost ?? m.cost };
      const asset = s.assets.find((x) => x.id === m.assetId);
      // a finished repair brings the asset back into stock
      const assets = asset && asset.status === "in_repair" && m.type === "repair" ? s.assets.map((x) => (x.id === asset.id ? { ...x, status: x.assigneeId ? "in_use" : "in_stock", locationId: x.assigneeId ? s.employees.find((e) => e.id === x.assigneeId)?.locationId || "loc5" : "loc5" } : x)) : s.assets;
      return { ...s, assets, maintenance: s.maintenance.map((x) => (x.id === p.id ? done : x)), activity: log(s, "complete", "maintenance", p.id, asset?.tag || "", m.title) };
    }
    case "maint/delete": return { ...s, maintenance: s.maintenance.filter((x) => x.id !== p.id), activity: log(s, "delete", "maintenance", p.id, s.maintenance.find((x) => x.id === p.id)?.title || "") };

    case "lic/add": { const l = { id: uid("l"), assigned: [], notes: "", ...p }; return { ...s, licenses: [...s.licenses, l], activity: log(s, "create", "license", l.id, l.name) }; }
    case "lic/update": return { ...s, licenses: s.licenses.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "license", p.id, s.licenses.find((x) => x.id === p.id)?.name || "") };
    case "lic/delete": return { ...s, licenses: s.licenses.filter((x) => x.id !== p.id), activity: log(s, "delete", "license", p.id, s.licenses.find((x) => x.id === p.id)?.name || "") };
    case "lic/assign": return { ...s, licenses: s.licenses.map((x) => (x.id === p.id ? { ...x, assigned: [...new Set([...x.assigned, p.employeeId])] } : x)), activity: log(s, "assign", "license", p.id, s.licenses.find((x) => x.id === p.id)?.name || "", nameOf(s.employees, p.employeeId)) };
    case "lic/unassign": return { ...s, licenses: s.licenses.map((x) => (x.id === p.id ? { ...x, assigned: x.assigned.filter((i) => i !== p.employeeId) } : x)), activity: log(s, "unassign", "license", p.id, s.licenses.find((x) => x.id === p.id)?.name || "", nameOf(s.employees, p.employeeId)) };

    case "cons/add": { const c = { id: uid("c"), ...p }; return { ...s, consumables: [...s.consumables, c], activity: log(s, "create", "consumable", c.id, c.name) }; }
    case "cons/update": return { ...s, consumables: s.consumables.map((x) => (x.id === p.id ? { ...x, ...p.patch } : x)), activity: log(s, "update", "consumable", p.id, s.consumables.find((x) => x.id === p.id)?.name || "") };
    case "cons/delete": return { ...s, consumables: s.consumables.filter((x) => x.id !== p.id), activity: log(s, "delete", "consumable", p.id, s.consumables.find((x) => x.id === p.id)?.name || "") };
    case "cons/adjust": {
      const c = s.consumables.find((x) => x.id === p.id);
      const stock = Math.max(0, c.stock + p.delta);
      return { ...s, consumables: s.consumables.map((x) => (x.id === p.id ? { ...x, stock } : x)), activity: log(s, "stock", "consumable", p.id, c.name, `${p.delta > 0 ? "+" : ""}${p.delta} → ${stock}`) };
    }

    case "stocktake/log": return { ...s, activity: log(s, "stocktake", "location", p.locationId, nameOf(s.locations, p.locationId), p.summary) };

    case "settings/update": return { ...s, settings: { ...s.settings, ...p } };
    case "replace": return p;
    default: return s;
  }
}
