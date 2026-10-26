"use client";
import { useState } from "react";
import { Upload, Download } from "lucide-react";
import { useApp } from "@/lib/store";
import { parseCsv, download, toCsv } from "@/lib/csv";
import { CATEGORIES, STATUSES, CONDITIONS } from "@/lib/utils";
import { assetColumns } from "@/lib/columns";
import { Modal } from "./ui";

export default function ImportAssets({ open, onClose }) {
  const { s, t, act, byId, fmt } = useApp();
  const [text, setText] = useState(""), [res, setRes] = useState(null);
  const find = (list, name) => list.find((x) => x.name.toLowerCase() === String(name || "").toLowerCase())?.id || null;

  const fields = s.settings.customFields || [];
  function check(raw) {
    const { header, records } = parseCsv(raw);
    if (!records.length) { setRes({ fatal: t("import.empty") }); return; }
    const missing = ["name", "category"].filter((h) => !header.includes(h));
    if (missing.length) { setRes({ fatal: t("import.missing", { cols: missing.join(", ") }) }); return; }
    const rows = [], errors = [];
    const seen = new Set(s.assets.map((a) => a.tag.toLowerCase()));
    records.forEach((r, i) => {
      const n = i + 2, bad = (m) => errors.push(`${t("import.line")} ${n}: ${m}`);
      const cat = r.category.toLowerCase(), status = (r.status || "in_stock").toLowerCase(), cond = (r.condition || "good").toLowerCase();
      if (!r.name) return bad(t("err.required"));
      if (!CATEGORIES.includes(cat)) return bad(`${t("f.category")} "${r.category}"`);
      if (!STATUSES.includes(status)) return bad(`${t("f.status")} "${r.status}"`);
      if (r.price && Number.isNaN(Number(r.price))) return bad(`${t("f.price")} "${r.price}"`);
      for (const k of ["purchaseDate", "warrantyEnd"]) if (r[k] && !/^\d{4}-\d{2}-\d{2}$/.test(r[k])) return bad(`${t(`f.${k}`)} "${r[k]}" (YYYY-MM-DD)`);
      const custom = {};
      for (const f of fields) {
        const v = (r[f.label] || "").trim();
        if (!v) continue;
        if (f.type === "number" && Number.isNaN(Number(v))) return bad(`${f.label} "${v}"`);
        if (f.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return bad(`${f.label} "${v}" (YYYY-MM-DD)`);
        custom[f.id] = v;
      }
      if (r.tag && seen.has(r.tag.toLowerCase())) return bad(`${t("f.tag")} "${r.tag}" ${t("import.exists")}`);
      if (r.tag) seen.add(r.tag.toLowerCase());
      rows.push({
        tag: r.tag || "", name: r.name, category: cat, manufacturer: r.manufacturer || "", model: r.model || "", serial: r.serial || "", status,
        condition: CONDITIONS.includes(cond) ? cond : "good", assigneeId: find(s.employees, r.assignee), locationId: find(s.locations, r.location), vendorId: find(s.vendors, r.vendor),
        purchaseDate: r.purchaseDate || "", price: r.price ? Number(r.price) : null, warrantyEnd: r.warrantyEnd || "", invoice: r.invoice || "", notes: r.notes || "", custom,
      });
    });
    setRes({ rows, errors });
  }
  const file = async (e) => { const f = e.target.files?.[0]; if (!f) return; const x = await f.text(); setText(x); check(x); };
  const template = () => download("asset-template.csv", toCsv([{ tag: "", name: "Dell Latitude 5540", category: "laptop", manufacturer: "Dell", model: "Latitude 5540", serial: "ABC123", status: "in_stock", condition: "new", assignee: "", location: s.locations[0]?.name || "", vendor: "", purchaseDate: "2026-01-15", price: 1180, warrantyEnd: "2029-01-15", invoice: "", notes: "" }], assetColumns(t, byId, fmt, fields).map((c) => ({ label: c.label, get: (r) => r[c.key] ?? "" }))));
  const close = () => { setText(""); setRes(null); onClose(); };

  return (
    <Modal open={open} onClose={close} wide title={t("import.title")}
      footer={<><button className="btn" onClick={close}>{t("cancel")}</button><button className="btn btn-primary" disabled={!res?.rows?.length} onClick={() => { if (act("asset/import", { rows: res.rows }, t("import.done", { n: res.rows.length }))) close(); }}>{t("import.run", { n: res?.rows?.length || 0 })}</button></>}>
      <p className="text-sm text-mute">{t("import.help")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="btn cursor-pointer"><Upload size={15} aria-hidden /> {t("import.choose")}<input type="file" accept=".csv,text/csv" className="sr-only" onChange={file} /></label>
        <button className="btn" onClick={template}><Download size={15} aria-hidden /> {t("import.template")}</button>
      </div>
      <textarea className="input mt-3 min-h-24 font-mono text-xs" placeholder={t("import.paste")} value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} />
      <button className="btn mt-2" onClick={() => check(text)} disabled={!text.trim()}>{t("import.check")}</button>
      {res?.fatal && <p role="alert" className="mt-3 text-sm text-bad">{res.fatal}</p>}
      {res?.rows && (
        <div className="mt-3 space-y-2 text-sm">
          <p className="text-ok">{t("import.valid", { n: res.rows.length })}</p>
          {res.errors.length > 0 && <div><p className="text-bad">{t("import.invalid", { n: res.errors.length })}</p><ul className="mt-1 max-h-32 list-disc overflow-y-auto pl-5 text-xs text-bad scroll-thin">{res.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>}
        </div>
      )}
    </Modal>
  );
}
