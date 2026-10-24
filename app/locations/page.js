"use client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { sortBy } from "@/lib/utils";
import { PageHeader, SearchBox, Modal, Field, Confirm, SortTh, useTable, Empty, Pager } from "@/components/ui";

export default function Locations() {
  const { s, t, act, can, fmt } = useApp();
  const [q, setQ] = useState(""), [form, setForm] = useState(null), [err, setErr] = useState({}), [del, setDel] = useState(null);
  const all = useMemo(() => s.locations.map((l) => ({ ...l, assets: s.assets.filter((a) => a.locationId === l.id).length, people: s.employees.filter((e) => e.locationId === l.id).length, stock: s.consumables.filter((c) => c.locationId === l.id).length })), [s]);
  const rows = all.filter((l) => !q || `${l.name} ${l.site}`.toLowerCase().includes(q.toLowerCase()));
  const table = useTable(rows, { sort: "name", size: s.settings.pageSize });
  const page = table.slice(sortBy(rows, table.key, table.dir));
  function save() {
    const e = {};
    if (!form.name.trim()) e.name = t("err.required");
    if (s.locations.some((l) => l.id !== form.id && l.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = t("err.dupName");
    setErr(e); if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), site: form.site.trim() };
    if (form.id ? act("loc/update", { id: form.id, patch: data }, t("toast.saved")) : act("loc/add", data, t("toast.created"))) setForm(null);
  }
  return (
    <>
      <PageHeader title={t("nav.locations")} sub={t("loc.sub", { n: s.locations.length })} actions={can("edit") && <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ name: "", site: "" }); }}><Plus size={15} aria-hidden /> {t("loc.new")}</button>} />
      <div className="card">
        <div className="border-b border-line p-3"><SearchBox className="sm:max-w-sm" value={q} onChange={setQ} placeholder={t("loc.search")} /></div>
        {rows.length === 0 ? <Empty text={t("noResults")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[480px]">
            <thead className="border-b border-line bg-sunk"><tr><SortTh k="name" table={table}>{t("loc.name")}</SortTh><SortTh k="site" table={table} className="max-md:hidden">{t("loc.site")}</SortTh><SortTh k="assets" table={table}>{t("loc.assets")}</SortTh><SortTh k="people" table={table}>{t("loc.people")}</SortTh><SortTh k="stock" table={table} className="max-md:hidden">{t("loc.stock")}</SortTh><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>{page.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-sunk">
                <td className="td font-medium">{l.name}</td><td className="td max-md:hidden">{l.site || "–"}</td><td className="td tabular-nums">{fmt.num(l.assets)}</td><td className="td tabular-nums">{fmt.num(l.people)}</td><td className="td max-md:hidden tabular-nums">{fmt.num(l.stock)}</td>
                <td className="td no-print"><div className="flex justify-end gap-1">
                  {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${l.name}`} onClick={() => { setErr({}); setForm({ ...l }); }}><Pencil size={14} /></button>}
                  {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${l.name}`} onClick={() => setDel(l)}><Trash2 size={14} /></button>}
                </div></td>
              </tr>))}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? t("loc.edit") : t("loc.new")} footer={<><button className="btn" onClick={() => setForm(null)}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
        {form && <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-3">
          <Field label={`${t("loc.name")} *`} error={err.name}><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label={t("loc.site")}><input className="input" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} /></Field>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("loc.deleteAsk", { name: del?.name || "" })} yes={t("delete")} onYes={() => act("loc/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
