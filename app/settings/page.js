"use client";
import { useEffect, useState } from "react";
import { Download, Upload, RotateCcw, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { download } from "@/lib/csv";
import { PageHeader, Field, Select, Confirm } from "@/components/ui";
import UsersAdmin from "@/components/UsersAdmin";
import CustomFields from "@/components/CustomFields";

const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "ALL"];
export default function Settings() {
  const { s, t, set, act, can, resetDemo, clearAll, toast, live } = useApp();
  const st = s.settings, admin = can("admin");
  const [f, setF] = useState(st), [err, setErr] = useState({}), [ask, setAsk] = useState(null);
  useEffect(() => setF(st), [st]);
  const up = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function save() {
    const e = {};
    if (!f.company.trim()) e.company = t("err.required");
    if (!f.user.trim()) e.user = t("err.required");
    for (const [k, min] of [["depreciationYears", 1], ["warrantyAlertDays", 0], ["maintenanceAlertDays", 0]]) if (!(Number(f[k]) >= min) || !Number.isInteger(Number(f[k]))) e[k] = t("err.number");
    setErr(e); if (Object.keys(e).length) return;
    set({ company: f.company.trim(), user: f.user.trim(), currency: f.currency, depreciationYears: Number(f.depreciationYears), warrantyAlertDays: Number(f.warrantyAlertDays), maintenanceAlertDays: Number(f.maintenanceAlertDays) }, t("set.saved"));
  }
  const backup = () => download(`it-asset-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(s, null, 2), "application/json");
  const restore = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
    try {
      const d = JSON.parse((await file.text()).replace(/^﻿/, ""));
      if (!["assets", "employees", "locations", "vendors", "maintenance", "licenses", "consumables", "activity"].every((k) => Array.isArray(d[k])) || !d.settings) throw new Error("bad");
      act("replace", d, t("set.restoreDone"));
    } catch { toast(t("set.restoreBad"), "bad"); }
  };
  const Sec = ({ title, children }) => <section className="card p-4 sm:p-5"><h2 className="mb-3 text-sm font-semibold">{title}</h2>{children}</section>;
  return (
    <>
      <PageHeader title={t("nav.settings")} sub={t("set.sub")} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Sec title={t("set.company")}>
          {!admin && <p className="mb-3 text-xs text-warn">{t("set.adminOnly")}</p>}
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
            <Field label={`${t("set.name")} *`} error={err.company} className="sm:col-span-2"><input className="input" disabled={!admin} value={f.company} onChange={up("company")} /></Field>
            <Field label={t("set.currency")}><Select disabled={!admin} value={f.currency} onChange={(v) => setF({ ...f, currency: v })} options={CURRENCIES.map((c) => [c, c])} /></Field>
            <Field label={`${t("set.user")} *`} error={err.user}><input className="input" disabled={!admin || live} value={f.user} onChange={up("user")} /></Field>
            <Field label={t("set.dep")} error={err.depreciationYears}><input type="number" min="1" className="input" disabled={!admin} value={f.depreciationYears} onChange={up("depreciationYears")} /></Field>
            <Field label={t("set.warr")} error={err.warrantyAlertDays}><input type="number" min="0" className="input" disabled={!admin} value={f.warrantyAlertDays} onChange={up("warrantyAlertDays")} /></Field>
            <Field label={t("set.maintAlert")} error={err.maintenanceAlertDays}><input type="number" min="0" className="input" disabled={!admin} value={f.maintenanceAlertDays} onChange={up("maintenanceAlertDays")} /></Field>
            <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={!admin}>{t("save")}</button></div>
          </form>
        </Sec>
        <div className="space-y-5">
          <Sec title={t("set.appearance")}>
            <div className="grid gap-3 sm:grid-cols-2">
              {!live && <Field label={t("role.label")}><Select value={st.role} onChange={(v) => set({ role: v })} options={["admin", "technician", "viewer"].map((r) => [r, t(`role.${r}`)])} /></Field>}
              <Field label={t("set.theme")}><Select value={st.theme} onChange={(v) => set({ theme: v })} options={[["light", t("set.light")], ["dark", t("set.dark")]]} /></Field>
              <Field label={t("set.lang")}><Select value={st.lang} onChange={(v) => set({ lang: v })} options={[["en", "English"], ["de", "Deutsch"]]} /></Field>
              <Field label={t("set.page")}><Select value={String(st.pageSize)} onChange={(v) => set({ pageSize: Number(v) })} options={[10, 15, 25, 50].map((n) => [String(n), String(n)])} /></Field>
            </div>
          </Sec>
          <Sec title={t("set.data")}>
            <p className="mb-1 text-xs text-mute">{live ? t("db.live") : t("db.demo")}</p>
            {live && <p className="mb-3 text-xs text-warn">{t("set.liveWarn")}</p>}
            {!live && <div className="mb-2" />}
            <div className="flex flex-wrap gap-2">
              <button className="btn" onClick={backup}><Download size={15} aria-hidden /> {t("set.backup")}</button>
              <label className={`btn ${admin ? "cursor-pointer" : "pointer-events-none opacity-50"}`}><Upload size={15} aria-hidden /> {t("set.restore")}<input type="file" accept="application/json,.json" className="sr-only" disabled={!admin} onChange={restore} /></label>
              <button className="btn" disabled={!admin} onClick={() => setAsk("reset")}><RotateCcw size={15} aria-hidden /> {t("set.reset")}</button>
              <button className="btn btn-danger" disabled={!admin} onClick={() => setAsk("clear")}><Trash2 size={15} aria-hidden /> {t("set.clear")}</button>
            </div>
          </Sec>
        </div>
      </div>
      <div className="mt-5"><CustomFields /></div>
      {live && <div className="mt-5"><UsersAdmin /></div>}
      <Confirm open={ask === "reset"} onClose={() => setAsk(null)} title={t("set.reset")} text={t("set.resetAsk")} yes={t("confirm")} danger={false} onYes={resetDemo} />
      <Confirm open={ask === "clear"} onClose={() => setAsk(null)} title={t("set.clear")} text={t("set.clearAsk")} yes={t("delete")} onYes={clearAll} />
    </>
  );
}
