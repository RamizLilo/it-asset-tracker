"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, FileSignature, Trash2, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/lib/store";
import { sortBy } from "@/lib/utils";
import { toCsv, download } from "@/lib/csv";
import { useQueryParam } from "@/lib/hooks";
import { PageHeader, SearchBox, Select, Badge, Modal, Field, Confirm, Pager, SortTh, useTable, Empty } from "@/components/ui";

const DEPTS = ["IT", "Finance", "Sales", "HR", "Operations", "Management", "Logistics"];
const BLANK = { name: "", email: "", department: "IT", title: "", locationId: "", active: true };

export default function Employees() {
  const { s, t, act, byId, can } = useApp();
  const q0 = useQueryParam("q");
  const [q, setQ] = useState(""), [dept, setDept] = useState(""), [active, setActive] = useState("");
  const [form, setForm] = useState(null), [err, setErr] = useState({}), [del, setDel] = useState(null), [open, setOpen] = useState(null);
  useEffect(() => { if (q0) setQ(q0); }, [q0]);

  const all = useMemo(() => s.employees.map((e) => ({ ...e, devices: s.assets.filter((a) => a.assigneeId === e.id), licenses: s.licenses.filter((l) => l.assigned.includes(e.id)) })), [s.employees, s.assets, s.licenses]);
  const rows = all.filter((e) => (!dept || e.department === dept) && (!active || String(e.active) === active) && (!q || [e.name, e.email, e.title, e.department].some((v) => (v || "").toLowerCase().includes(q.toLowerCase()))));
  const table = useTable(rows, { sort: "name", size: s.settings.pageSize });
  const page = table.slice(sortBy(rows, table.key, table.dir, table.key === "devices" ? (e) => e.devices.length : table.key === "location" ? (e) => byId.loc[e.locationId]?.name : undefined));

  function save() {
    const e = {};
    if (!form.name.trim()) e.name = t("err.required");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = t("err.email");
    if (form.email && s.employees.some((x) => x.id !== form.id && x.email.toLowerCase() === form.email.toLowerCase())) e.email = t("err.dupEmail");
    setErr(e); if (Object.keys(e).length) return;
    const data = { name: form.name.trim(), email: form.email, department: form.department, title: form.title, locationId: form.locationId, active: form.active };
    const ok = form.id ? act("emp/update", { id: form.id, patch: data }, t("toast.saved")) : act("emp/add", data, t("toast.created"));
    if (ok) setForm(null);
  }
  const up = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const csv = () => download("employees.csv", toCsv(rows, [{ label: "name", get: (e) => e.name }, { label: "email", get: (e) => e.email }, { label: "department", get: (e) => e.department }, { label: "title", get: (e) => e.title }, { label: "devices", get: (e) => e.devices.map((a) => a.tag).join(" ") }, { label: "active", get: (e) => e.active }]));

  return (
    <>
      <PageHeader title={t("nav.employees")} sub={t("emp.sub", { n: s.employees.filter((e) => e.active).length })} actions={<>
        <button className="btn" onClick={csv}><Download size={15} aria-hidden /> {t("exportCsv")}</button>
        {can("edit") && <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ ...BLANK, locationId: s.locations[0]?.id || "" }); }}><Plus size={15} aria-hidden /> {t("emp.new")}</button>}
      </>} />
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <SearchBox className="min-w-[12rem] flex-1 sm:max-w-sm" value={q} onChange={setQ} placeholder={t("emp.search")} />
          <Select aria-label={t("emp.dept")} value={dept} onChange={setDept} placeholder={t("emp.dept")} options={DEPTS.map((d) => [d, d])} className="!w-auto" />
          <Select aria-label={t("f.status")} value={active} onChange={setActive} placeholder={t("f.status")} options={[["true", t("emp.active")], ["false", t("emp.left")]]} className="!w-auto" />
        </div>
        {rows.length === 0 ? <Empty text={t("noResults")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[520px]">
            <thead className="border-b border-line bg-sunk"><tr><th className="th w-8" />
              <SortTh k="name" table={table}>{t("col.name")}</SortTh><SortTh k="department" table={table} className="max-md:hidden">{t("emp.dept")}</SortTh><SortTh k="title" table={table} className="max-lg:hidden">{t("emp.title")}</SortTh>
              <SortTh k="location" table={table} className="max-lg:hidden">{t("col.location")}</SortTh><SortTh k="devices" table={table}>{t("emp.devices")}</SortTh><th className="th">{t("f.status")}</th><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>
              {page.map((e) => (
                <Fragment key={e.id}>
                  <tr className="border-b border-line hover:bg-sunk">
                    <td className="td"><button aria-label={t("expand")} aria-expanded={open === e.id} onClick={() => setOpen(open === e.id ? null : e.id)} className="text-mute">{open === e.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button></td>
                    <td className="td"><p className="font-medium">{e.name}</p><p className="text-xs text-mute">{e.email}</p></td>
                    <td className="td max-md:hidden">{e.department}</td><td className="td max-lg:hidden">{e.title}</td><td className="td max-lg:hidden">{byId.loc[e.locationId]?.name || "–"}</td>
                    <td className="td tabular-nums">{e.devices.length}</td><td className="td">{e.active ? <Badge tone="ok" dot>{t("emp.active")}</Badge> : <Badge tone="bad" dot>{t("emp.left")}</Badge>}</td>
                    <td className="td no-print"><div className="flex justify-end gap-1">
                      {e.devices.length > 0 && <Link className="btn btn-sm !px-2" aria-label={`${t("ho.btnAll")}: ${e.name}`} title={t("ho.btnAll")} href={`/handover?emp=${e.id}`}><FileSignature size={14} /></Link>}
                      {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${e.name}`} onClick={() => { setErr({}); setForm({ ...e }); }}><Pencil size={14} /></button>}
                      {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${e.name}`} onClick={() => setDel(e)}><Trash2 size={14} /></button>}
                    </div></td>
                  </tr>
                  {open === e.id && (
                    <tr className="border-b border-line bg-sunk"><td /><td colSpan={7} className="px-3 py-3">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-mute">{t("emp.devices")}</p>
                      {e.devices.length ? <ul className="flex flex-wrap gap-2">{e.devices.map((a) => <li key={a.id}><Link href={`/assets/${a.id}`} className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1 text-xs hover:border-accent"><span className="font-mono">{a.tag}</span> {a.name}</Link></li>)}</ul> : <p className="text-sm text-mute">{t("emp.noDevices")}</p>}
                      <p className="mb-1 mt-3 text-xs font-medium uppercase tracking-wide text-mute">{t("nav.licenses")}</p>
                      {e.licenses.length ? <p className="text-sm">{e.licenses.map((l) => l.name).join(", ")}</p> : <p className="text-sm text-mute">–</p>}
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? t("emp.edit") : t("emp.new")} footer={<><button className="btn" onClick={() => setForm(null)}>{t("cancel")}</button><button className="btn btn-primary" onClick={save}>{t("save")}</button></>}>
        {form && <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid gap-3 sm:grid-cols-2">
          <Field label={`${t("col.name")} *`} error={err.name} className="sm:col-span-2"><input className="input" value={form.name} onChange={(e) => up("name")(e.target.value)} /></Field>
          <Field label="E-mail" error={err.email} className="sm:col-span-2"><input className="input" value={form.email} onChange={(e) => up("email")(e.target.value)} /></Field>
          <Field label={t("emp.dept")}><Select value={form.department} onChange={up("department")} options={DEPTS.map((d) => [d, d])} /></Field>
          <Field label={t("emp.title")}><input className="input" value={form.title} onChange={(e) => up("title")(e.target.value)} /></Field>
          <Field label={t("col.location")}><Select value={form.locationId} onChange={up("locationId")} options={s.locations.map((l) => [l.id, l.name])} /></Field>
          <Field label={t("f.status")}><Select value={String(form.active)} onChange={(v) => up("active")(v === "true")} options={[["true", t("emp.active")], ["false", t("emp.left")]]} /></Field>
          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("emp.deleteAsk", { name: del?.name || "" })} yes={t("delete")} onYes={() => act("emp/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
