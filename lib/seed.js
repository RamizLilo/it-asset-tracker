import { addDays, PREFIX } from "./utils";

// Demo data for a made-up company. Dates are relative to today, so warranty and maintenance alerts always show something.
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const CATALOG = {
  laptop: { n: 18, items: [["Dell", "Latitude 5540", 1180], ["Dell", "Latitude 7440", 1590], ["HP", "EliteBook 840 G10", 1450], ["Lenovo", "ThinkPad T14 Gen 4", 1290], ["Apple", "MacBook Pro 14 M3", 2299], ["Lenovo", "ThinkPad X1 Carbon Gen 11", 1890]] },
  desktop: { n: 6, items: [["Dell", "OptiPlex 7010 SFF", 899], ["HP", "EliteDesk 800 G9", 949], ["Lenovo", "ThinkCentre M90q", 879]] },
  monitor: { n: 14, items: [["Dell", "UltraSharp U2723QE 27\"", 549], ["Dell", "P2422H 24\"", 219], ["LG", "27UP850 27\"", 389]] },
  phone: { n: 8, items: [["Apple", "iPhone 15", 849], ["Samsung", "Galaxy S24", 799], ["Samsung", "Galaxy XCover7", 449]] },
  tablet: { n: 4, items: [["Apple", "iPad 10th Gen", 429], ["Samsung", "Galaxy Tab Active5", 589]] },
  printer: { n: 4, items: [["HP", "LaserJet Pro M404dn", 289], ["Brother", "HL-L6400DW", 419], ["Canon", "imageRUNNER C3326i", 2890]] },
  network: { n: 6, items: [["Cisco", "Catalyst 2960-X 48P", 2100], ["Ubiquiti", "UniFi U6-Pro", 159], ["Fortinet", "FortiGate 60F", 699]] },
  server: { n: 2, items: [["Dell", "PowerEdge R650", 5890], ["HPE", "ProLiant DL360 Gen10", 4990]] },
  peripheral: { n: 10, items: [["Logitech", "MX Master 3S", 99], ["Jabra", "Evolve2 65", 249], ["Dell", "WD22TB4 Dock", 289], ["Logitech", "C920 Webcam", 79]] },
};

const EMP = [
  ["Anna Keller", "IT", "Systems administrator"], ["Markus Brandt", "IT", "IT support specialist"], ["Elena Hoxha", "Finance", "Financial controller"],
  ["Jonas Weber", "Sales", "Account manager"], ["Sofia Marin", "HR", "HR business partner"], ["Daniel Roth", "Operations", "Operations lead"],
  ["Lena Fischer", "Finance", "Accountant"], ["Arben Gashi", "IT", "Junior developer"], ["Katrin Vogel", "Management", "Managing director"],
  ["Tobias Lang", "Sales", "Sales representative"], ["Mira Petrova", "Logistics", "Dispatcher"], ["Felix Baumann", "Logistics", "Warehouse manager"],
  ["Nora Schmid", "HR", "Recruiter"], ["Luca Bianchi", "Operations", "Process analyst"], ["Petra Novak", "Finance", "Payroll specialist"], ["Emir Kaya", "Sales", "Key account manager"],
];

export function makeSeed(user = "Admin") {
  const r = rng(42);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const now = new Date().toISOString();

  const locations = [
    { id: "loc1", name: "HQ Stuttgart, 1st floor", site: "Stuttgart" }, { id: "loc2", name: "HQ Stuttgart, 2nd floor", site: "Stuttgart" },
    { id: "loc3", name: "HQ Stuttgart, 3rd floor", site: "Stuttgart" }, { id: "loc4", name: "Server room", site: "Stuttgart" },
    { id: "loc5", name: "IT storage", site: "Stuttgart" }, { id: "loc6", name: "Warehouse Esslingen", site: "Esslingen" },
    { id: "loc7", name: "Home office", site: "Remote" }, { id: "loc8", name: "External repair", site: "Service partner" },
  ];
  const vendors = [
    { id: "v1", name: "Schwaben IT-Handel GmbH", contact: "Sabine Haas", email: "sales@schwaben-it.example", phone: "+49 711 555 0101", website: "schwaben-it.example" },
    { id: "v2", name: "Rhein Systemhaus AG", contact: "Michael Dorn", email: "business@rhein-systemhaus.example", phone: "+49 221 555 0142", website: "rhein-systemhaus.example" },
    { id: "v3", name: "Netzwerk24", contact: "Ilka Braun", email: "kontakt@netzwerk24.example", phone: "+49 30 555 0188", website: "netzwerk24.example" },
    { id: "v4", name: "ServiceDirekt GmbH", contact: "Tim Engel", email: "support@servicedirekt.example", phone: "+49 711 555 0177", website: "servicedirekt.example" },
    { id: "v5", name: "Mobilfunk Partner Süd", contact: "Jana Lutz", email: "firmen@mobilfunk-sued.example", phone: "+49 711 555 0123", website: "mobilfunk-sued.example" },
    { id: "v6", name: "Software-Lizenzhaus", contact: "Oliver Pohl", email: "orders@lizenzhaus.example", phone: "+49 89 555 0166", website: "lizenzhaus.example" },
  ];
  const employees = EMP.map(([name, department, title], i) => ({
    id: `e${i + 1}`, name, department, title, email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@neckar-logistik.example`,
    locationId: i % 5 === 0 ? "loc7" : ["loc1", "loc2", "loc3"][i % 3], active: true,
  }));
  employees[14].active = false; // left the company, keeps showing how returns work

  // assets
  const counters = {};
  const assets = [];
  let n = 0;
  for (const [cat, def] of Object.entries(CATALOG)) {
    for (let i = 0; i < def.n; i++) {
      n++;
      const [maker, model, price] = pick(def.items);
      const ageDays = Math.floor(r() * 1500) + 30;
      const purchaseDate = addDays(-ageDays);
      const warrantyYears = ["server", "network"].includes(cat) ? 5 : cat === "monitor" ? 3 : cat === "peripheral" ? 1 : 3;
      const warrantyEnd = addDays(-ageDays + warrantyYears * 365 + (r() < 0.12 ? 0 : Math.floor(r() * 30)));
      const personal = ["laptop", "phone", "tablet", "peripheral", "monitor", "desktop"].includes(cat);
      let status = "in_use", assigneeId = null, locationId = pick(["loc1", "loc2", "loc3"]);
      const roll = r();
      if (cat === "server") locationId = "loc4";
      else if (cat === "network") locationId = pick(["loc4", "loc1", "loc2", "loc6"]);
      else if (cat === "printer") locationId = pick(["loc1", "loc2", "loc6"]);
      else if (personal) {
        if (roll < 0.12) { status = "in_stock"; locationId = "loc5"; }
        else if (roll < 0.18) { status = "in_repair"; locationId = "loc8"; }
        else if (roll < 0.24 && cat !== "monitor") { status = "retired"; locationId = "loc5"; }
        else { const e = employees[Math.floor(r() * 14)]; assigneeId = e.id; locationId = e.locationId; }
      }
      counters[cat] = (counters[cat] || 0) + 1;
      assets.push({
        id: `a${n}`, tag: `${PREFIX[cat]}-${String(counters[cat]).padStart(4, "0")}`, name: `${maker} ${model}`, category: cat,
        manufacturer: maker, model, serial: `${maker.slice(0, 2).toUpperCase()}${Math.floor(r() * 9e7 + 1e7)}${String.fromCharCode(65 + Math.floor(r() * 26))}`,
        status, condition: ageDays > 1100 ? pick(["fair", "fair", "poor"]) : ageDays < 200 ? "new" : "good",
        locationId, assigneeId, vendorId: pick(["v1", "v2", "v3", "v4"]), purchaseDate, price: Math.round(price * (0.92 + r() * 0.16)),
        warrantyEnd, invoice: `RE-${2021 + Math.floor(r() * 5)}-${Math.floor(r() * 9000 + 1000)}`, notes: "", maintenanceEvery: ["server", "network", "printer"].includes(cat) ? 180 : 0,
        createdAt: now,
      });
    }
  }
  // a few special cases that make the demo interesting
  assets[2].status = "lost"; assets[2].assigneeId = null; assets[2].locationId = null; assets[2].notes = "Reported lost on a business trip.";
  assets[5].notes = "Spare unit for new starters."; assets[5].status = "in_stock"; assets[5].assigneeId = null; assets[5].locationId = "loc5";
  // one laptop still sits with an employee who has left, so the demo shows a return to do
  const stale = assets.find((a) => a.category === "laptop" && a.status === "in_use");
  if (stale) { stale.assigneeId = "e15"; stale.locationId = "loc7"; }
  // an asset must not be "in use" without a user or a place
  assets.forEach((a) => { if (a.status === "in_use" && !a.assigneeId && !a.locationId) a.locationId = "loc1"; });

  // maintenance
  const maintenance = [];
  const mTypes = [["repair", "Display flickers"], ["repair", "Battery swelling, replace"], ["preventive", "Dust cleaning and thermal paste"], ["inspection", "Yearly safety inspection"], ["upgrade", "RAM upgrade to 32 GB"], ["preventive", "Firmware update and test"], ["repair", "Keyboard keys not working"]];
  const mAssets = assets.filter((a) => ["laptop", "server", "network", "printer", "desktop"].includes(a.category));
  for (let i = 0; i < 22; i++) {
    const a = mAssets[(i * 3) % mAssets.length], [type, title] = mTypes[i % mTypes.length];
    const done = i % 3 === 0, prog = i % 7 === 1;
    const due = addDays(done ? -Math.floor(r() * 120) - 5 : Math.floor(r() * 60) - 12);
    maintenance.push({
      id: `m${i + 1}`, assetId: a.id, type, title, status: done ? "done" : prog ? "in_progress" : "scheduled", due,
      doneDate: done ? addDays(-Math.floor(r() * 4), new Date(due)) : "", cost: done || prog ? Math.round(r() * 280) + 20 : 0, technician: pick(["Markus Brandt", "Anna Keller", "ServiceDirekt GmbH"]), notes: "",
    });
  }
  assets.filter((a) => a.status === "in_repair").forEach((a, i) => maintenance.push({
    id: `m${100 + i}`, assetId: a.id, type: "repair", title: "Sent to external repair", status: "in_progress", due: addDays(5 + i * 3), doneDate: "", cost: 0, technician: "ServiceDirekt GmbH", notes: "",
  }));

  const licenses = [
    ["Microsoft 365 Business Premium", "v6", 18, 22.0, 340, "subscription"], ["Adobe Acrobat Pro", "v6", 4, 19.99, 24, "subscription"], ["JetBrains All Products", "v6", 3, 29.9, 150, "subscription"],
    ["Atlassian Jira Software", "v6", 20, 8.15, 90, "subscription"], ["Zoom Workplace", "v6", 16, 13.99, 200, "subscription"], ["ESET Endpoint Security", "v1", 20, 38, 12, "subscription"],
    ["1Password Business", "v6", 20, 7.99, 260, "subscription"], ["Windows Server 2022 CAL", "v2", 25, 45, null, "perpetual"],
  ].map(([name, vendorId, seats, perSeat, daysLeft, kind], i) => {
    const active = employees.filter((e) => e.active);
    const used = Math.min(seats, Math.round(seats * (0.45 + r() * 0.5)), active.length);
    return {
      id: `l${i + 1}`, name, vendorId, kind, seats, cost: Math.round(perSeat * seats * 12 * (kind === "perpetual" ? 0.08 : 1)), key: `XXXX-${Math.floor(r() * 9000 + 1000)}-${Math.floor(r() * 9000 + 1000)}`,
      purchaseDate: addDays(-(365 - (daysLeft ?? 0))), expiry: daysLeft == null ? "" : addDays(daysLeft), assigned: active.slice(0, used).map((e) => e.id), notes: "",
    };
  });

  const consumables = [
    ["Toner HP 59A black", "printer", 6, 4, "pcs", 89, "loc5"], ["Toner Brother TN-3480", "printer", 2, 3, "pcs", 64, "loc5"], ["USB-C cable 2 m", "cable", 24, 10, "pcs", 9, "loc5"],
    ["HDMI cable 2 m", "cable", 9, 8, "pcs", 7, "loc5"], ["USB-C charger 65 W", "power", 5, 4, "pcs", 39, "loc5"], ["Wireless mouse", "peripheral", 7, 5, "pcs", 18, "loc5"],
    ["Keyboard, German layout", "peripheral", 3, 5, "pcs", 22, "loc5"], ["Patch cable Cat6 1 m", "cable", 40, 20, "pcs", 3, "loc4"], ["AA batteries (pack of 10)", "other", 4, 3, "pack", 8, "loc5"],
  ].map(([name, category, stock, reorderAt, unit, cost, locationId], i) => ({ id: `c${i + 1}`, name, category, stock, reorderAt, unit, cost, locationId }));

  const activity = assets.slice(0, 6).map((a, i) => ({
    id: `h${i}`, ts: new Date(Date.now() - (i + 1) * 3600e3 * 7).toISOString(), user, action: "create", entity: "asset", entityId: a.id, label: a.tag, detail: a.name,
  }));

  return {
    settings: { company: "Neckar Logistik GmbH", currency: "EUR", lang: "en", theme: "light", role: "admin", user, depreciationYears: 4, warrantyAlertDays: 60, maintenanceAlertDays: 14, pageSize: 15 },
    assets, employees, locations, vendors, maintenance, licenses, consumables, activity, counters,
  };
}
