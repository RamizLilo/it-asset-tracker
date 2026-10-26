"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES, CONDITIONS, todayIso } from "@/lib/utils";
import { Modal, Field, Select } from "./ui";

const EMPTY = { name: "", category: "laptop", manufacturer: "", model: "", serial: "", tag: "", status: "in_stock", condition: "new", locationId: "loc5", assigneeId: "", vendorId: "", purchaseDate: "", price: "", warrantyEnd: "", invoice: "", maintenanceEvery: 0, notes: "" };

export default function AssetForm({ open, onClose, asset }) {
  const { s, t, act } = useApp();
  const [f, setF] = useState(EMPTY), [err, setErr] = useState({});
  useEffect(() => { if (open) { setF(asset ? { ...EMPTY, ...asset, custom: asset.custom || {}, assigneeId: asset.assigneeId || "", vendorId: asset.vendorId || "", locationId: asset.locationId || "", price: asset.price ?? "" } : { ...EMPTY, locationId: s.locations[0]?.id || "" }); setErr({}); } }, [open, asset, s.locations]);
  const fields = s.settings.customFields || [];
  const up = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const upCustom = (id) => (v) => setF((x) => ({ ...x, custom: { ...(x.custom || {}), [id]: v } }));
  const inp = (k, props = {}) => <input className="input" value={f[k] ?? ""} onChange={(e) => up(k)(e.target.value)} {...props} />;

  function save() {
    const e = {};
    if (!f.name.trim()) e.name = t("err.required");
    if (f.price !== "" && (Number.isNaN(Number(f.price)) || Number(f.price) < 0)) e.price = t("err.number");
    if (f.purchaseDate && f.purchaseDate > todayIso()) e.purchaseDate = t("err.future");
    if (f.warrantyEnd && f.purchaseDate && f.warrantyEnd < f.purchaseDate) e.warrantyEnd = t("err.warranty");
    if (f.status === "in_use" && !f.assigneeId && !f.locationId) e.assigneeId = t("err.inUse");
    for (const cf of fields) if (cf.type === "number" && f.custom?.[cf.id] && Number.isNaN(Number(f.custom[cf.id]))) e[`cf_${cf.id}`] = t("err.number");
    setErr(e);
    if (Object.keys(e).length) return;
    // keep status and user consistent
    let status = f.status, assigneeId = f.assigneeId || null;
    if (assigneeId && ["in_stock", "retired", "lost"].includes(status)) assigneeId = null;
    if (assigneeId && status === "in_stock") status = "in_use";
    const data = { ...f, name: f.name.trim(), tag: f.tag.trim(), price: f.price === "" ? null : Number(f.price), assigneeId, status, locationId: f.locationId || null, vendorId: f.vendorId || null, maintenanceEvery: Number(f.maintenanceEvery) || 0,
      custom: Object.fromEntries(Object.entries(f.custom || {}).filter(([id, v]) => v !== "" && fields.some((cf) => cf.id === id))) };
    const ok = asset ? act("asset/update", { id: asset.id, patch: data }, t("toast.saved")) : act("asset/add", data, t("toast.created"));
    if (ok) onClose();
  }

  const loc = s.locations.map((l) => [l.id, l.name]), emp = s.employees.filter((e) => e.active || e.id === f.assigneeId).map((e) => [e.id, e.name]);
  return (
    <Modal open={open} onClose={onClose} wide title={asset ? t("assets.edit") : t("assets.new")}
      footer={<><button className="btn" onClick={onClose}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
        <Field label={`${t("f.name")} *`} error={err.name} className="sm:col-span-2">{inp("name", { placeholder: "Dell Latitude 5540" })}</Field>
        <Field label={t("f.category")}><Select value={f.category} onChange={up("category")} options={CATEGORIES.map((c) => [c, t(`cat.${c}`)])} /></Field>
        <Field label={t("f.tag")} hint={t("f.tagHint")}>{inp("tag", { placeholder: "LT-0019" })}</Field>
        <Field label={t("f.manufacturer")}>{inp("manufacturer")}</Field>
        <Field label={t("f.model")}>{inp("model")}</Field>
        <Field label={t("f.serial")}>{inp("serial")}</Field>
        <Field label={t("f.invoice")}>{inp("invoice")}</Field>
        <Field label={t("f.status")}><Select value={f.status} onChange={up("status")} options={STATUSES.map((c) => [c, t(`status.${c}`)])} /></Field>
        <Field label={t("f.condition")}><Select value={f.condition} onChange={up("condition")} options={CONDITIONS.map((c) => [c, t(`cond.${c}`)])} /></Field>
        <Field label={t("f.assignee")} error={err.assigneeId}><Select value={f.assigneeId} onChange={up("assigneeId")} placeholder={t("none")} options={emp} /></Field>
        <Field label={t("f.location")}><Select value={f.locationId} onChange={up("locationId")} placeholder={t("none")} options={loc} /></Field>
        <Field label={t("f.vendor")}><Select value={f.vendorId} onChange={up("vendorId")} placeholder={t("none")} options={s.vendors.map((v) => [v.id, v.name])} /></Field>
        <Field label={`${t("f.price")} (${s.settings.currency})`} error={err.price}>{inp("price", { inputMode: "decimal" })}</Field>
        <Field label={t("f.purchaseDate")} error={err.purchaseDate}>{inp("purchaseDate", { type: "date" })}</Field>
        <Field label={t("f.warrantyEnd")} error={err.warrantyEnd}>{inp("warrantyEnd", { type: "date" })}</Field>
        <Field label={t("f.maintEvery")} hint={t("f.maintHint")}>{inp("maintenanceEvery", { type: "number", min: 0 })}</Field>
        {fields.map((cf) => (
          <Field key={cf.id} label={cf.label} error={err[`cf_${cf.id}`]}>
            <input className="input" type={cf.type === "number" ? "text" : cf.type} inputMode={cf.type === "number" ? "decimal" : undefined} value={f.custom?.[cf.id] ?? ""} onChange={(e) => upCustom(cf.id)(e.target.value)} />
          </Field>
        ))}
        <Field label={t("f.notes")} className="sm:col-span-2"><textarea className="input min-h-20" value={f.notes || ""} onChange={(e) => up("notes")(e.target.value)} /></Field>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}

export function CheckoutModal({ open, onClose, asset }) {
  const { s, t, act } = useApp();
  const router = useRouter();
  const [emp, setEmp] = useState(""), [note, setNote] = useState(""), [form, setForm] = useState(false);
  useEffect(() => { if (open) { setEmp(""); setNote(""); setForm(false); } }, [open]);
  if (!asset) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${t("assets.checkout")}: ${asset.tag}`}
      footer={<><button className="btn" onClick={onClose}>{t("cancel")}</button><button className="btn btn-primary" disabled={!emp} onClick={() => { if (act("asset/checkout", { id: asset.id, employeeId: emp, note }, t("toast.checkedOut"))) { onClose(); if (form) router.push(`/handover?asset=${asset.id}&emp=${emp}&type=handover`); } }}>{t("assets.checkout")}</button></>}>
      <div className="space-y-3">
        <Field label={t("f.assignee")}><Select value={emp} onChange={setEmp} placeholder={t("choose")} options={s.employees.filter((e) => e.active).map((e) => [e.id, `${e.name} · ${e.department}`])} /></Field>
        <Field label={t("f.note")}><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form} onChange={(e) => setForm(e.target.checked)} /> {t("ho.after")}</label>
      </div>
    </Modal>
  );
}

export function CheckinModal({ open, onClose, asset }) {
  const { s, t, act } = useApp();
  const router = useRouter();
  const [loc, setLoc] = useState("loc5"), [note, setNote] = useState(""), [form, setForm] = useState(false);
  useEffect(() => { if (open) { setLoc(s.locations.find((l) => /storage/i.test(l.name))?.id || s.locations[0]?.id || ""); setNote(""); setForm(false); } }, [open, s.locations]);
  if (!asset) return null;
  return (
    <Modal open={open} onClose={onClose} title={`${t("assets.checkin")}: ${asset.tag}`}
      footer={<><button className="btn" onClick={onClose}>{t("cancel")}</button><button className="btn btn-primary" onClick={() => { const who = asset.assigneeId; if (act("asset/checkin", { id: asset.id, locationId: loc, note }, t("toast.checkedIn"))) { onClose(); if (form) router.push(`/handover?asset=${asset.id}&emp=${who}&type=return`); } }}>{t("assets.checkin")}</button></>}>
      <div className="space-y-3">
        <Field label={t("assets.returnTo")}><Select value={loc} onChange={setLoc} options={s.locations.map((l) => [l.id, l.name])} /></Field>
        <Field label={t("f.note")}><input className="input" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form} onChange={(e) => setForm(e.target.checked)} /> {t("ho.afterReturn")}</label>
      </div>
    </Modal>
  );
}
