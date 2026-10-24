"use client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Minus } from "lucide-react";
import { useApp } from "@/lib/store";
import { sortBy } from "@/lib/utils";
import { PageHeader, SearchBox, Kpi, Badge, Modal, Field, Select, Confirm, SortTh, useTable, Empty, Pager } from "@/components/ui";

const CATS = ["printer", "cable", "power", "peripheral", "other"];
const BLANK = { name: "", category: "other", stock: 0, reorderAt: 0, unit: "pcs", cost: "", locationId: "" };

export default function Consumables() {
  const { s, t, act, byId, can, fmt } = useApp();
  const [q, setQ] = useState(""), [lowOnly, setLowOnly] = useState(false), [form, setForm] = useState(null), [err, setErr] = useState({}), [del, setDel] = useState(null);
  const low = (c) => c.stock <= c.reorderAt;
  const rows = useMemo(() => s.consumables.filter((c) => (!lowOnly || low(c)) && (!q || c.name.toLowerCase().includes(q.toLowerCase()))), [s.consumables, q, lowOnly]);
  const table = useTable(rows, { sort: "name", size: s.settings.pageSize });
  const page = table.slice(sortBy(rows, table.key, table.dir, table.key === "location" ? (c) => byId.loc[c.locationId]?.name : table.key === "value" ? (c) => c.stock * (c.cost || 0) : undefined));
  const value = s.consumables.reduce((n, c) => n + c.stock * (c.cost || 0), 0);
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  function save() {
    const e = {};
    if (!form.name.trim()) e.name = t("err.required");
    for (const k of ["stock", "reorderAt"]) if (!(Number(form[k]) >= 0) || !Number.isInteger(Number(form[k]))) e[k] = t("err.number");
    if (form.cost !== "" && !(Number(form.cost) >= 0)) e.cost = t("err.number");
    setErr(e); if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), category: form.category, stock: Number(form.stock), reorderAt: Number(form.reorderAt), unit: form.unit || "pcs", cost: Number(form.cost) || 0, locationId: form.locationId || null };
    if (form.id ? act("cons/update", { id: form.id, patch: data }, t("toast.saved")) : act("cons/add", data, t("toast.created"))) setForm(null);
  }
  return (
    <>
      <PageHeader title={t("nav.consumables")} sub={t("cons.sub")} actions={can("edit") && <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ ...BLANK, locationId: s.locations[0]?.id || "" }); }}><Plus size={15} aria-hidden /> {t("cons.new")}</button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Kpi label={t("cons.kpi.items")} value={fmt.num(s.consumables.length)} /><Kpi label={t("cons.kpi.low")} value={fmt.num(s.consumables.filter(low).length)} tone={s.consumables.some(low) ? "warn" : undefined} /><Kpi label={t("cons.kpi.value")} value={fmt.money(value)} />
      </div>
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <SearchBox className="min-w-[12rem] flex-1 sm:max-w-sm" value={q} onChange={setQ} placeholder={t("cons.search")} />
          <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} /> {t("cons.lowOnly")}</label>
        </div>
        {rows.length === 0 ? <Empty text={t("noResults")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[520px]">
            <thead className="border-b border-line bg-sunk"><tr><SortTh k="name" table={table}>{t("col.name")}</SortTh><SortTh k="category" table={table} className="max-md:hidden">{t("cons.category")}</SortTh><SortTh k="stock" table={table}>{t("cons.stock")}</SortTh><SortTh k="reorderAt" table={table} className="max-md:hidden">{t("cons.reorder")}</SortTh><SortTh k="location" table={table} className="max-lg:hidden">{t("col.location")}</SortTh><SortTh k="value" table={table} className="max-lg:hidden text-right">{t("cons.value")}</SortTh><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>{page.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0 hover:bg-sunk">
                <td className="td font-medium">{c.name}</td><td className="td max-md:hidden">{t(`ccat.${c.category}`)}</td>
                <td className="td"><div className="flex items-center gap-2">
                  {can("edit") && <button className="btn btn-sm !px-1.5" disabled={c.stock === 0} aria-label={t("cons.less", { name: c.name })} onClick={() => act("cons/adjust", { id: c.id, delta: -1 })}><Minus size={13} /></button>}
                  <span className="min-w-[3.5rem] text-center tabular-nums">{c.stock} {c.unit}</span>
                  {can("edit") && <button className="btn btn-sm !px-1.5" aria-label={t("cons.more", { name: c.name })} onClick={() => act("cons/adjust", { id: c.id, delta: 1 })}><Plus size={13} /></button>}
                  {low(c) ? <Badge tone="warn" dot>{t("cons.low")}</Badge> : <Badge tone="ok" dot>{t("cons.ok")}</Badge>}
                </div></td>
                <td className="td max-md:hidden tabular-nums">{c.reorderAt}</td><td className="td max-lg:hidden">{byId.loc[c.locationId]?.name || "–"}</td><td className="td max-lg:hidden text-right tabular-nums">{fmt.money(c.stock * (c.cost || 0))}</td>
                <td className="td no-print"><div className="flex justify-end gap-1">
                  {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${c.name}`} onClick={() => { setErr({}); setForm({ ...BLANK, ...c, cost: c.cost || "" }); }}><Pencil size={14} /></button>}
                  {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${c.name}`} onClick={() => setDel(c)}><Trash2 size={14} /></button>}
                </div></td>
              </tr>))}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? t("cons.edit") : t("cons.new")} footer={<><button className="btn" onClick={() => setForm(null)}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
        {form && <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t("col.name")} *`} error={err.name} className="sm:col-span-2"><input className="input" value={form.name} onChange={up("name")} /></Field>
          <Field label={t("cons.category")}><Select value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATS.map((c) => [c, t(`ccat.${c}`)])} /></Field>
          <Field label={t("col.location")}><Select value={form.locationId} onChange={(v) => setForm({ ...form, locationId: v })} placeholder={t("none")} options={s.locations.map((l) => [l.id, l.name])} /></Field>
          <Field label={t("cons.stock")} error={err.stock}><input type="number" min="0" className="input" value={form.stock} onChange={up("stock")} /></Field>
          <Field label={t("cons.reorder")} error={err.reorderAt}><input type="number" min="0" className="input" value={form.reorderAt} onChange={up("reorderAt")} /></Field>
          <Field label={t("cons.unit")}><input className="input" value={form.unit} onChange={up("unit")} /></Field>
          <Field label={`${t("cons.cost")} (${s.settings.currency})`} error={err.cost}><input className="input" inputMode="decimal" value={form.cost} onChange={up("cost")} /></Field>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("cons.deleteAsk", { name: del?.name || "" })} yes={t("delete")} onYes={() => act("cons/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
