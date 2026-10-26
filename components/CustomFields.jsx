"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { uid } from "@/lib/utils";
import { Select } from "./ui";

const TYPES = ["text", "number", "date"];
const MAX = 8;

// Settings card: extra fields every asset can have (for example "SIM number" or "Windows version")
export default function CustomFields() {
  const { s, t, set, can } = useApp();
  const list = s.settings.customFields || [], admin = can("admin");
  const [label, setLabel] = useState(""), [type, setType] = useState("text"), [err, setErr] = useState("");

  function add(e) {
    e.preventDefault();
    const l = label.trim();
    if (!l) return setErr(t("err.required"));
    if (list.some((x) => x.label.toLowerCase() === l.toLowerCase())) return setErr(t("err.dupName"));
    if (list.length >= MAX) return setErr(t("cf.max", { n: MAX }));
    if (set({ customFields: [...list, { id: uid("cf"), label: l, type }] }, t("cf.added"))) { setLabel(""); setType("text"); setErr(""); }
  }
  const remove = (id) => set({ customFields: list.filter((x) => x.id !== id) }, t("cf.removed"));

  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{t("cf.title")}</h2>
      <p className="mb-3 mt-1 text-xs text-mute">{t("cf.sub")}</p>
      {list.length === 0 ? <p className="mb-3 text-sm text-mute">{t("cf.none")}</p> : (
        <ul className="mb-3 divide-y divide-line rounded-md border border-line">
          {list.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 truncate font-medium">{f.label} <span className="ml-1 text-xs font-normal text-mute">{t(`cf.type.${f.type}`)}</span></span>
              <button className="btn btn-sm !px-2" disabled={!admin} aria-label={`${t("delete")}: ${f.label}`} title={t("delete")} onClick={() => remove(f.id)}><Trash2 size={14} aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
      {admin ? (
        <form onSubmit={add} className="flex flex-wrap items-start gap-2">
          <div className="min-w-[11rem] flex-1">
            <label className="sr-only" htmlFor="cf-label">{t("cf.label")}</label>
            <input id="cf-label" className="input" value={label} maxLength={40} placeholder={t("cf.placeholder")} onChange={(e) => { setLabel(e.target.value); setErr(""); }} aria-invalid={!!err} />
            {err && <p role="alert" className="mt-1 text-xs text-bad">{err}</p>}
          </div>
          <Select aria-label={t("cf.type")} value={type} onChange={setType} options={TYPES.map((x) => [x, t(`cf.type.${x}`)])} className="!w-auto" />
          <button type="submit" className="btn btn-primary"><Plus size={15} aria-hidden /> {t("cf.add")}</button>
        </form>
      ) : <p className="text-xs text-warn">{t("set.adminOnly")}</p>}
      <p className="mt-3 text-xs text-mute">{t("cf.hint")}</p>
    </section>
  );
}
