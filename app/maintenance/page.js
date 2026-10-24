"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { useApp } from "@/lib/store";
import { MAINT_TYPES, sortBy, daysUntil } from "@/lib/utils";
import { useQueryParam } from "@/lib/hooks";
import { PageHeader, SearchBox, Select, Kpi, Badge, StatusBadge, Confirm, SortTh, useTable, Empty, Pager } from "@/components/ui";
import MaintForm from "@/components/MaintForm";

export default function Maintenance() {
  const { s, t, act, byId, can, fmt } = useApp();
  const tab0 = useQueryParam("tab");
  const [tab, setTab] = useState("open"), [q, setQ] = useState(""), [type, setType] = useState("");
  const [form, setForm] = useState({ open: false, m: null }), [del, setDel] = useState(null);
  useEffect(() => { if (["all", "open", "overdue", "done"].includes(tab0)) setTab(tab0); }, [tab0]);

  const isOverdue = (m) => m.status !== "done" && daysUntil(m.due) < 0;
  const list = useMemo(() => s.maintenance.map((m) => ({ ...m, asset: byId.asset[m.assetId] })), [s.maintenance, byId]);
  const open = list.filter((m) => m.status !== "done"), overdue = list.filter(isOverdue), done = list.filter((m) => m.status === "done");
  const year = String(new Date().getFullYear());
  const costYear = done.filter((m) => (m.doneDate || m.due).startsWith(year)).reduce((n, m) => n + (m.cost || 0), 0);
  const paid = done.filter((m) => m.cost > 0);
  const avg = paid.length ? paid.reduce((n, m) => n + m.cost, 0) / paid.length : 0;

  const rows = list.filter((m) => (tab === "all" || (tab === "open" && m.status !== "done") || (tab === "overdue" && isOverdue(m)) || (tab === "done" && m.status === "done"))
    && (!type || m.type === type) && (!q || `${m.title} ${m.asset?.tag} ${m.asset?.name} ${m.technician}`.toLowerCase().includes(q.toLowerCase())));
  const table = useTable(rows, { sort: "due", size: s.settings.pageSize });
  const page = table.slice(sortBy(rows, table.key, table.dir, table.key === "asset" ? (m) => m.asset?.tag : undefined));
  const due = (m) => { if (m.status === "done") return <span className="text-mute">{t("maint.doneOn", { date: fmt.date(m.doneDate || m.due) })}</span>; const d = daysUntil(m.due); return <span className={d < 0 ? "font-medium text-bad" : ""}>{fmt.date(m.due)}<span className="block text-xs text-mute">{d < 0 ? t("maint.overdueBy", { n: -d }) : d === 0 ? t("maint.today") : t("maint.inDays", { n: d })}</span></span>; };

  return (
    <>
      <PageHeader title={t("nav.maintenance")} sub={t("maint.sub")} actions={can("edit") && <button className="btn btn-primary" onClick={() => setForm({ open: true, m: null })}><Plus size={15} aria-hidden /> {t("maint.new")}</button>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label={t("maint.open")} value={fmt.num(open.length)} /><Kpi label={t("maint.overdue")} value={fmt.num(overdue.length)} tone={overdue.length ? "bad" : undefined} />
        <Kpi label={t("maint.costYear")} value={fmt.money(costYear)} /><Kpi label={t("maint.avg")} value={fmt.money(avg)} />
      </div>
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="inline-flex overflow-hidden rounded-md border border-line text-sm" role="group">
            {["open", "overdue", "done", "all"].map((k) => <button key={k} onClick={() => setTab(k)} aria-pressed={tab === k} className={`px-3 py-1.5 ${tab === k ? "bg-accent text-accent-ink" : "bg-surface text-mute hover:bg-sunk"}`}>{t(`maint.tab.${k}`)}</button>)}
          </div>
          <SearchBox className="min-w-[12rem] flex-1 sm:max-w-xs" value={q} onChange={setQ} placeholder={t("maint.search")} />
          <Select aria-label={t("maint.type")} value={type} onChange={setType} placeholder={t("allTypes")} options={MAINT_TYPES.map((x) => [x, t(`mtype.${x}`)])} className="!w-auto" />
        </div>
        {rows.length === 0 ? <Empty text={t("maint.empty")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[560px]">
            <thead className="border-b border-line bg-sunk"><tr><SortTh k="title" table={table}>{t("maint.title")}</SortTh><SortTh k="asset" table={table}>{t("maint.asset")}</SortTh><SortTh k="type" table={table} className="max-md:hidden">{t("maint.type")}</SortTh><SortTh k="due" table={table}>{t("maint.due")}</SortTh><SortTh k="status" table={table}>{t("f.status")}</SortTh><SortTh k="cost" table={table} className="max-md:hidden text-right">{t("maint.cost")}</SortTh><th className="th no-print"><span className="sr-only">{t("actions")}</span></th></tr></thead>
            <tbody>{page.map((m) => (
              <tr key={m.id} className={`border-b border-line last:border-0 hover:bg-sunk ${isOverdue(m) ? "bg-bad-soft/40" : ""}`}>
                <td className="td min-w-[10rem] font-medium">{m.title}<p className="text-xs font-normal text-mute max-md:block md:hidden">{t(`mtype.${m.type}`)}</p></td>
                <td className="td">{m.asset ? <Link href={`/assets/${m.asset.id}`} className="text-accent hover:underline"><span className="font-mono text-xs">{m.asset.tag}</span></Link> : "–"}<p className="text-xs text-mute">{m.technician}</p></td>
                <td className="td max-md:hidden">{t(`mtype.${m.type}`)}</td><td className="td whitespace-nowrap">{due(m)}</td><td className="td"><StatusBadge status={m.status} /></td>
                <td className="td max-md:hidden text-right tabular-nums">{m.cost ? fmt.money(m.cost) : "–"}</td>
                <td className="td no-print"><div className="flex justify-end gap-1">
                  {can("edit") && m.status !== "done" && <button className="btn btn-sm !px-2" title={t("maint.complete")} aria-label={`${t("maint.complete")} ${m.title}`} onClick={() => act("maint/complete", { id: m.id }, t("toast.done"))}><Check size={14} /></button>}
                  {can("edit") && <button className="btn btn-sm !px-2" aria-label={`${t("edit")} ${m.title}`} onClick={() => setForm({ open: true, m })}><Pencil size={14} /></button>}
                  {can("delete") && <button className="btn btn-sm !px-2" aria-label={`${t("delete")} ${m.title}`} onClick={() => setDel(m)}><Trash2 size={14} /></button>}
                </div></td>
              </tr>))}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
      <MaintForm open={form.open} maint={form.m} onClose={() => setForm({ open: false, m: null })} />
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("maint.deleteAsk")} yes={t("delete")} onYes={() => act("maint/delete", { id: del.id }, t("toast.deleted"))} />
    </>
  );
}
