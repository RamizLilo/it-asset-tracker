"use client";
import { Fragment, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useApp } from "@/lib/store";
import { sortBy, daysUntil } from "@/lib/utils";
import { PageHeader, SearchBox, Kpi, Badge, Modal, Field, Select, Confirm, SortTh, useTable, Empty, Pager } from "@/components/ui";

const BLANK = { name: "", vendorId: "", kind: "subscription", seats: 1, cost: "", purchaseDate: "", expiry: "", key: "", notes: "" };

export default function Licenses() {
  const { s, t, act, byId, can, fmt } = useApp();
  const [q, setQ] = useState(""), [form, setForm] = useState(null), [err, setErr] = useState({}), [del, setDel] = useState(null), [open, setOpen] = useState(null), [pick, setPick] = useState("");
  const rows = useMemo(() => s.licenses.filter((l) => !q || `${l.name} ${byId.vendor[l.vendorId]?.name || ""}`.toLowerCase().includes(q.toLowerCase())), [s.licenses, q, byId]);
  const table = useTable(rows, { sort: "name", size: s.settings.pageSize });
  const getters = { vendor: (l) => byId.vendor[l.vendorId]?.name, used: (l) => l.assigned.length / l.seats, expiry: (l) => l.expiry || "9999" };
  const page = table.slice(sortBy(rows, table.key, table.dir, getters[table.key]));
  const seats = s.licenses.reduce((n, l) => n + l.seats, 0), used = s.licenses.reduce((n, l) => n + l.assigned.length, 0);
  const cost = s.licenses.reduce((n, l) => n + (l.cost || 0), 0), ending = s.licenses.filter((l) => l.expiry && daysUntil(l.expiry) <= 45).length;
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function save() {
    const e = {};
    if (!form.name.trim()) e.name = t("err.required");
    if (!(Number(form.seats) >= 1)) e.seats = t("err.number");
    if (form.cost !== "" && !(Number(form.cost) >= 0)) e.cost = t("err.number");
    if (form.id && Number(form.seats) < form.assigned.length) e.seats = t("err.seatsBelow", { n: form.assigned.length });
    setErr(e); if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), vendorId: form.vendorId || null, kind: form.kind, seats: Number(form.seats), cost: Number(form.cost) || 0, purchaseDate: form.purchaseDate, expiry: form.kind === "perpetual" ? "" : form.expiry, key: form.key, notes: form.notes };
    if (form.id ? act("lic/update", { id: form.id, patch: data }, t("toast.saved")) : act("lic/add", data, t("toast.created"))) setForm(null);
  }
  const expiry = (l) => { if (!l.expiry) return <span className="text-mute">{t("lic.never")}</span>; const d = daysUntil(l.expiry); return <Badge tone={d < 0 ? "bad" : d <= 45 ? "warn" : "mute"}>{fmt.date(l.expiry)}{d >= 0 && d <= 45 ? ` · ${t("lic.expiresIn", { n: d })}` : d < 0 ? ` · ${t("lic.expired")}` : ""}</Badge>; };

  return (
    <>
      <PageHeader title={t("nav.licenses")} sub={t("lic.sub")} actions={can("edit") && <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ ...BLANK, vendorId: s.vendors[0]?.id || "" }); }}><Plus size={15} aria-hidden /> {t("lic.new")}</button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t("lic.kpi.count")} value={fmt.num(s.licenses.length)} /><Kpi label={t("lic.kpi.seats")} value={`${used} / ${seats}`} />
        <Kpi label={t("lic.kpi.cost")} value={fmt.money(cost)} /><Kpi label={t("lic.kpi.expiring")} value={fmt.num(ending)} tone={ending ? "warn" : undefined} />
      </div>
      <div className="card">
        <div className="border-b border-line p-3"><SearchBox className="sm:max-w-sm" value={q} onChange={setQ} placeholder={t("lic.search")} /></div>
        {rows.length === 0 ? <Empty text={t("noResults")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[560px]">
            <thead className="border-b border-line bg-sunk"><tr><th className="th w-8" /><SortTh k="name" table={table}>{t("col.name")}</SortTh><SortTh k="vendor" table={table} className="max-lg:hidden">{t("col.vendor")}</SortTh><SortTh k="used" table={table}>{t("lic.seats")}</SortTh><SortTh k="expiry" table={table}>{t("lic.expiry")}</SortTh><SortTh k="cost" table={table} className="max-md:hidden text-right">{t("lic.cost")}</SortTh><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>{page.map((l) => {
              const left = l.seats - l.assigned.length;
              return (
                <Fragment key={l.id}>
                  <tr className="border-b border-line hover:bg-sunk">
                    <td className="td"><button aria-label={t("expand")} aria-expanded={open === l.id} onClick={() => { setOpen(open === l.id ? null : l.id); setPick(""); }} className="text-mute">{open === l.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button></td>
                    <td className="td"><p className="font-medium">{l.name}</p><p className="text-xs text-mute">{t(`lic.kind.${l.kind}`)}</p></td>
                    <td className="td max-lg:hidden">{byId.vendor[l.vendorId]?.name || "–"}</td>
                    <td className="td min-w-[8rem]"><div className="flex items-center justify-between text-xs tabular-nums"><span>{l.assigned.length} / {l.seats}</span><span className={left === 0 ? "text-warn" : "text-mute"}>{left === 0 ? t("lic.full") : t("lic.free", { n: left })}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sunk"><div className={`h-full ${left === 0 ? "bg-warn" : "bg-accent"}`} style={{ width: `${(l.assigned.length / l.seats) * 100}%` }} /></div></td>
                    <td className="td">{expiry(l)}</td><td className="td max-md:hidden text-right tabular-nums">{fmt.money(l.cost)}</td>
                    <td className="td no-print"><div className="flex justify-end gap-1">
                      {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${l.name}`} onClick={() => { setErr({}); setForm({ ...BLANK, ...l, cost: l.cost || "" }); }}><Pencil size={14} /></button>}
                      {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${l.name}`} onClick={() => setDel(l)}><Trash2 size={14} /></button>}
                    </div></td>
                  </tr>
                  {open === l.id && (
                    <tr className="border-b border-line bg-sunk"><td /><td colSpan={6} className="px-3 py-3">
                      {l.assigned.length === 0 ? <p className="text-sm text-mute">{t("lic.noAssigned")}</p> : (
                        <ul className="flex flex-wrap gap-2">{l.assigned.map((id) => { const e = byId.emp[id]; return (
                          <li key={id} className="inline-flex items-center gap-2 rounded-md border border-line bg-surface py-1 pl-2.5 pr-1 text-xs">{e?.name || id}{e && !e.active && <Badge tone="bad">{t("lic.leaverSeat")}</Badge>}
                            {can("edit") && <button className="rounded p-1 text-mute hover:bg-sunk hover:text-bad" aria-label={t("lic.remove", { name: e?.name || id })} onClick={() => act("lic/unassign", { id: l.id, employeeId: id })}><X size={13} /></button>}</li>); })}</ul>
                      )}
                      {can("edit") && left > 0 && (
                        <div className="mt-3 flex max-w-md flex-wrap gap-2">
                          <div className="min-w-[10rem] flex-1"><Select aria-label={t("lic.assign")} value={pick} onChange={setPick} placeholder={t("lic.assignPick")} options={s.employees.filter((e) => e.active && !l.assigned.includes(e.id)).map((e) => [e.id, e.name])} /></div>
                          <button className="btn btn-primary" disabled={!pick} onClick={() => { if (act("lic/assign", { id: l.id, employeeId: pick })) setPick(""); }}>{t("lic.assign")}</button>
                        </div>)}
                      {l.key && <p className="mt-3 text-xs text-mute">{t("lic.key")}: <span className="font-mono">{l.key}</span></p>}
                    </td></tr>
                  )}
                </Fragment>
              );
            })}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? t("lic.edit") : t("lic.new")} footer={<><button className="btn" onClick={() => setForm(null)}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
        {form && <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t("col.name")} *`} error={err.name} className="sm:col-span-2"><input className="input" value={form.name} onChange={up("name")} /></Field>
          <Field label={t("col.vendor")}><Select value={form.vendorId} onChange={(v) => setForm({ ...form, vendorId: v })} placeholder={t("none")} options={s.vendors.map((v) => [v.id, v.name])} /></Field>
          <Field label={t("lic.kind")}><Select value={form.kind} onChange={(v) => setForm({ ...form, kind: v })} options={[["subscription", t("lic.kind.subscription")], ["perpetual", t("lic.kind.perpetual")]]} /></Field>
          <Field label={t("lic.seats")} error={err.seats}><input type="number" min="1" className="input" value={form.seats} onChange={up("seats")} /></Field>
          <Field label={`${t("lic.cost")} (${s.settings.currency})`} error={err.cost}><input className="input" inputMode="decimal" value={form.cost} onChange={up("cost")} /></Field>
          <Field label={t("lic.purchased")}><input type="date" className="input" value={form.purchaseDate} onChange={up("purchaseDate")} /></Field>
          {form.kind === "subscription" && <Field label={t("lic.expiry")}><input type="date" className="input" value={form.expiry} onChange={up("expiry")} /></Field>}
          <Field label={t("lic.key")} className="sm:col-span-2"><input className="input font-mono" value={form.key} onChange={up("key")} /></Field>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("lic.deleteAsk", { name: del?.name || "" })} yes={t("delete")} onYes={() => act("lic/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
