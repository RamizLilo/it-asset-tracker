"use client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { sortBy } from "@/lib/utils";
import { PageHeader, SearchBox, Modal, Field, Confirm, SortTh, useTable, Empty, Pager } from "@/components/ui";

const BLANK = { name: "", contact: "", email: "", phone: "", website: "" };
export default function Vendors() {
  const { s, t, act, can, fmt } = useApp();
  const [q, setQ] = useState(""), [form, setForm] = useState(null), [err, setErr] = useState({}), [del, setDel] = useState(null);
  const all = useMemo(() => s.vendors.map((v) => { const as = s.assets.filter((a) => a.vendorId === v.id); return { ...v, assets: as.length, spend: as.reduce((n, a) => n + (a.price || 0), 0) }; }), [s]);
  const rows = all.filter((v) => !q || `${v.name} ${v.contact} ${v.email}`.toLowerCase().includes(q.toLowerCase()));
  const table = useTable(rows, { sort: "name", size: s.settings.pageSize });
  const page = table.slice(sortBy(rows, table.key, table.dir));
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  function save() {
    const e = {};
    if (!form.name.trim()) e.name = t("err.required");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("err.email");
    setErr(e); if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), contact: form.contact, email: form.email, phone: form.phone, website: form.website };
    if (form.id ? act("vendor/update", { id: form.id, patch: data }, t("toast.saved")) : act("vendor/add", data, t("toast.created"))) setForm(null);
  }
  return (
    <>
      <PageHeader title={t("nav.vendors")} sub={t("vendor.sub", { n: s.vendors.length })} actions={can("edit") && <button className="btn btn-primary" onClick={() => { setErr({}); setForm(BLANK); }}><Plus size={15} aria-hidden /> {t("vendor.new")}</button>} />
      <div className="card">
        <div className="border-b border-line p-3"><SearchBox className="sm:max-w-sm" value={q} onChange={setQ} placeholder={t("vendor.search")} /></div>
        {rows.length === 0 ? <Empty text={t("noResults")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[520px]">
            <thead className="border-b border-line bg-sunk"><tr><SortTh k="name" table={table}>{t("loc.name")}</SortTh><SortTh k="contact" table={table} className="max-md:hidden">{t("vendor.contact")}</SortTh><th className="th max-lg:hidden">{t("vendor.email")}</th><th className="th max-lg:hidden">{t("vendor.phone")}</th><SortTh k="assets" table={table}>{t("vendor.assets")}</SortTh><SortTh k="spend" table={table} className="text-right">{t("vendor.spend")}</SortTh><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>{page.map((v) => (
              <tr key={v.id} className="border-b border-line last:border-0 hover:bg-sunk">
                <td className="td"><p className="font-medium">{v.name}</p>{v.website && <p className="text-xs text-mute">{v.website}</p>}</td><td className="td max-md:hidden">{v.contact || "–"}</td>
                <td className="td max-lg:hidden">{v.email ? <a className="text-accent hover:underline" href={`mailto:${v.email}`}>{v.email}</a> : "–"}</td><td className="td max-lg:hidden whitespace-nowrap">{v.phone || "–"}</td>
                <td className="td tabular-nums">{fmt.num(v.assets)}</td><td className="td text-right tabular-nums">{fmt.money(v.spend)}</td>
                <td className="td no-print"><div className="flex justify-end gap-1">
                  {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${v.name}`} onClick={() => { setErr({}); setForm({ ...BLANK, ...v }); }}><Pencil size={14} /></button>}
                  {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${v.name}`} onClick={() => setDel(v)}><Trash2 size={14} /></button>}
                </div></td>
              </tr>))}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? t("vendor.edit") : t("vendor.new")} footer={<><button className="btn" onClick={() => setForm(null)}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
        {form && <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t("loc.name")} *`} error={err.name} className="sm:col-span-2"><input className="input" value={form.name} onChange={up("name")} /></Field>
          <Field label={t("vendor.contact")}><input className="input" value={form.contact} onChange={up("contact")} /></Field>
          <Field label={t("vendor.phone")}><input className="input" value={form.phone} onChange={up("phone")} /></Field>
          <Field label={t("vendor.email")} error={err.email}><input className="input" value={form.email} onChange={up("email")} /></Field>
          <Field label={t("vendor.website")}><input className="input" value={form.website} onChange={up("website")} /></Field>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("vendor.deleteAsk", { name: del?.name || "" })} yes={t("delete")} onYes={() => act("vendor/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
