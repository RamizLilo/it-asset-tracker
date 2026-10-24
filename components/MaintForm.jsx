"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { MAINT_TYPES, MAINT_STATUSES, addDays } from "@/lib/utils";
import { Modal, Field, Select } from "./ui";

export default function MaintForm({ open, onClose, maint, assetId }) {
  const { s, t, act } = useApp();
  const blank = { assetId: assetId || "", type: "repair", title: "", status: "scheduled", due: addDays(7), cost: "", technician: "", notes: "" };
  const [f, setF] = useState(blank), [err, setErr] = useState({});
  useEffect(() => { if (open) { setF(maint ? { ...maint, cost: maint.cost || "" } : blank); setErr({}); } }, [open, maint, assetId]); // eslint-disable-line
  const up = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  function save() {
    const e = {};
    if (!f.assetId) e.assetId = t("err.required");
    if (!f.title.trim()) e.title = t("err.required");
    if (!f.due) e.due = t("err.required");
    if (f.cost !== "" && (Number.isNaN(Number(f.cost)) || Number(f.cost) < 0)) e.cost = t("err.number");
    setErr(e); if (Object.keys(e).length) return;
    const data = { ...f, title: f.title.trim(), cost: Number(f.cost) || 0, doneDate: f.status === "done" ? f.doneDate || new Date().toISOString().slice(0, 10) : "" };
    if (maint) { if (act("maint/update", { id: maint.id, patch: data }, t("toast.saved"))) onClose(); }
    else if (act("maint/add", data, t("toast.created"))) {
      // sending a device to repair also changes its status
      if (data.type === "repair" && data.status === "in_progress") act("asset/update", { id: data.assetId, patch: { status: "in_repair" } });
      onClose();
    }
  }
  return (
    <Modal open={open} onClose={onClose} title={maint ? t("maint.edit") : t("maint.new")}
      footer={<><button className="btn" onClick={onClose}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
        <Field label={`${t("maint.asset")} *`} error={err.assetId} className="sm:col-span-2"><Select value={f.assetId} onChange={up("assetId")} placeholder={t("choose")} disabled={!!assetId && !maint} options={s.assets.map((a) => [a.id, `${a.tag} · ${a.name}`])} /></Field>
        <Field label={`${t("maint.title")} *`} error={err.title} className="sm:col-span-2"><input className="input" value={f.title} onChange={(e) => up("title")(e.target.value)} /></Field>
        <Field label={t("maint.type")}><Select value={f.type} onChange={up("type")} options={MAINT_TYPES.map((x) => [x, t(`mtype.${x}`)])} /></Field>
        <Field label={t("f.status")}><Select value={f.status} onChange={up("status")} options={MAINT_STATUSES.map((x) => [x, t(`status.${x}`)])} /></Field>
        <Field label={`${t("maint.due")} *`} error={err.due}><input type="date" className="input" value={f.due} onChange={(e) => up("due")(e.target.value)} /></Field>
        <Field label={`${t("maint.cost")} (${s.settings.currency})`} error={err.cost}><input className="input" inputMode="decimal" value={f.cost} onChange={(e) => up("cost")(e.target.value)} /></Field>
        <Field label={t("maint.tech")} className="sm:col-span-2"><input className="input" value={f.technician} onChange={(e) => up("technician")(e.target.value)} /></Field>
        <Field label={t("f.notes")} className="sm:col-span-2"><textarea className="input min-h-16" value={f.notes || ""} onChange={(e) => up("notes")(e.target.value)} /></Field>
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
