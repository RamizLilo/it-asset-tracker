"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Upload, Download, Columns3, LayoutGrid, List, Pencil, Copy, Trash2, UserPlus, Undo2, X, Filter } from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES, sortBy, warrantyState, bookValue } from "@/lib/utils";
import { toCsv, download } from "@/lib/csv";
import { assetColumns } from "@/lib/columns";
import { useQueryParam, useStored } from "@/lib/hooks";
import { PageHeader, SearchBox, Select, StatusBadge, Badge, Pager, SortTh, useTable, Empty, Confirm, Modal, Field } from "@/components/ui";
import AssetForm, { CheckoutModal, CheckinModal } from "@/components/AssetForm";
import ImportAssets from "@/components/ImportAssets";
import WarrantyBadge from "@/components/WarrantyBadge";

const COLS = ["tag", "name", "category", "status", "assignee", "location", "vendor", "purchase", "price", "book", "warranty", "condition", "serial"];
const DEFAULT_COLS = ["tag", "name", "category", "status", "assignee", "location", "warranty", "price"];

export default function AssetsPage() {
  const { s, t, fmt, act, byId, can } = useApp();
  const q0 = useQueryParam("q"), isNew = useQueryParam("new"), f0 = useQueryParam("status");
  const [q, setQ] = useState(""), [st, setSt] = useState(""), [cat, setCat] = useState(""), [loc, setLoc] = useState(""), [emp, setEmp] = useState(""), [ven, setVen] = useState(""), [war, setWar] = useState("");
  const [pref, setView] = useStored("itam-view", null), [narrow, setNarrow] = useState(false), [cols, setCols] = useStored("itam-cols", DEFAULT_COLS);
  const view = pref ?? (narrow ? "grid" : "table");
  useEffect(() => { const f = () => setNarrow(window.innerWidth < 768); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  const [sel, setSel] = useState([]);
  const [form, setForm] = useState({ open: false, asset: null }), [imp, setImp] = useState(false), [colMenu, setColMenu] = useState(false);
  const [out, setOut] = useState(null), [inn, setInn] = useState(null), [del, setDel] = useState(null), [bulk, setBulk] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { if (q0) setQ(q0); if (f0 && STATUSES.includes(f0)) setSt(f0); if (isNew && can("edit")) setForm({ open: true, asset: null }); }, [q0, f0, isNew, can]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return s.assets.filter((a) => {
      if (st && a.status !== st) return false;
      if (cat && a.category !== cat) return false;
      if (loc && a.locationId !== loc) return false;
      if (emp === "none" ? a.assigneeId : emp && a.assigneeId !== emp) return false;
      if (ven && a.vendorId !== ven) return false;
      if (war && warrantyState(a, s.settings.warrantyAlertDays) !== war) return false;
      if (!term) return true;
      return [a.tag, a.name, a.serial, a.model, a.manufacturer, a.invoice, a.notes, byId.emp[a.assigneeId]?.name, byId.loc[a.locationId]?.name].some((v) => String(v || "").toLowerCase().includes(term));
    });
  }, [s.assets, s.settings.warrantyAlertDays, q, st, cat, loc, emp, ven, war, byId]);

  const table = useTable(rows, { sort: "tag", size: s.settings.pageSize });
  const getters = { assignee: (a) => byId.emp[a.assigneeId]?.name, location: (a) => byId.loc[a.locationId]?.name, vendor: (a) => byId.vendor[a.vendorId]?.name, purchase: (a) => a.purchaseDate, warranty: (a) => a.warrantyEnd, book: (a) => bookValue(a, s.settings.depreciationYears) };
  const sorted = useMemo(() => sortBy(rows, table.key, table.dir, getters[table.key]), [rows, table.key, table.dir]); // eslint-disable-line
  const page = table.slice(sorted);
  const active = [st, cat, loc, emp, ven, war].filter(Boolean).length;
  const allOn = page.length > 0 && page.every((a) => sel.includes(a.id));
  const toggleAll = () => setSel(allOn ? sel.filter((i) => !page.some((a) => a.id === i)) : [...new Set([...sel, ...page.map((a) => a.id)])]);
  const clear = () => { setQ(""); setSt(""); setCat(""); setLoc(""); setEmp(""); setVen(""); setWar(""); };
  const visible = (c) => (cols || DEFAULT_COLS).includes(c);

  const exportCsv = () => download(`assets-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(sorted, assetColumns(t, byId, fmt)));
  const doBulk = () => {
    const patch = bulk.kind === "status" ? { status: bulk.value, ...(["in_stock", "retired", "lost"].includes(bulk.value) ? { assigneeId: null } : {}) } : bulk.kind === "location" ? { locationId: bulk.value } : { category: bulk.value };
    if (bulk.value && act("asset/bulk", { ids: sel, patch }, t("toast.bulk", { n: sel.length }))) { setBulk(null); setSel([]); }
  };
  const bulkOpts = bulk?.kind === "status" ? STATUSES.map((x) => [x, t(`status.${x}`)]) : bulk?.kind === "location" ? s.locations.map((l) => [l.id, l.name]) : CATEGORIES.map((x) => [x, t(`cat.${x}`)]);

  const Actions = ({ a }) => (
    <div className="no-print flex justify-end gap-1">
      {can("edit") && (a.assigneeId
        ? <button className="btn btn-sm !px-2" title={t("assets.checkin")} aria-label={`${t("assets.checkin")} ${a.tag}`} onClick={() => setInn(a)}><Undo2 size={14} /></button>
        : ["in_stock", "in_use"].includes(a.status) && <button className="btn btn-sm !px-2" title={t("assets.checkout")} aria-label={`${t("assets.checkout")} ${a.tag}`} onClick={() => setOut(a)}><UserPlus size={14} /></button>)}
      {can("edit") && <button className="btn btn-sm !px-2" title={t("edit")} aria-label={`${t("edit")} ${a.tag}`} onClick={() => setForm({ open: true, asset: a })}><Pencil size={14} /></button>}
      {can("edit") && <button className="btn btn-sm !px-2" title={t("duplicate")} aria-label={`${t("duplicate")} ${a.tag}`} onClick={() => act("asset/duplicate", { id: a.id }, t("toast.duplicated"))}><Copy size={14} /></button>}
      {can("delete") && <button className="btn btn-sm !px-2" title={t("delete")} aria-label={`${t("delete")} ${a.tag}`} onClick={() => setDel([a.id])}><Trash2 size={14} /></button>}
    </div>
  );

  return (
    <>
      <PageHeader title={t("nav.assets")} sub={t("assets.sub", { n: fmt.num(s.assets.length) })} actions={<>
        <button className="btn" onClick={exportCsv}><Download size={15} aria-hidden /> {t("assets.exportCsv")}</button>
        {can("edit") && <button className="btn" onClick={() => setImp(true)}><Upload size={15} aria-hidden /> {t("import.title")}</button>}
        {can("edit") && <button className="btn btn-primary" onClick={() => setForm({ open: true, asset: null })}><Plus size={15} aria-hidden /> {t("assets.new")}</button>}
      </>} />

      <div className="card">
        <div className="no-print flex flex-wrap items-center gap-2 border-b border-line p-3">
          <SearchBox className="min-w-[12rem] flex-1 sm:max-w-sm" value={q} onChange={setQ} placeholder={t("assets.search")} />
          <button className="btn md:hidden" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}><Filter size={15} aria-hidden /> {t("filters")}{active ? ` (${active})` : ""}</button>
          <div className={`${showFilters ? "grid" : "hidden"} w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap`}>
            <Select aria-label={t("f.status")} value={st} onChange={setSt} placeholder={t("f.status")} options={STATUSES.map((x) => [x, t(`status.${x}`)])} className="md:!w-auto" />
            <Select aria-label={t("f.category")} value={cat} onChange={setCat} placeholder={t("f.category")} options={CATEGORIES.map((x) => [x, t(`cat.${x}`)])} className="md:!w-auto" />
            <Select aria-label={t("f.location")} value={loc} onChange={setLoc} placeholder={t("f.location")} options={s.locations.map((l) => [l.id, l.name])} className="md:!w-auto" />
            <Select aria-label={t("f.assignee")} value={emp} onChange={setEmp} placeholder={t("f.assignee")} options={[["none", t("assets.unassigned")], ...s.employees.map((e) => [e.id, e.name])]} className="md:!w-auto" />
            <Select aria-label={t("f.vendor")} value={ven} onChange={setVen} placeholder={t("f.vendor")} options={s.vendors.map((v) => [v.id, v.name])} className="md:!w-auto" />
            <Select aria-label={t("f.warranty")} value={war} onChange={setWar} placeholder={t("f.warranty")} options={[["ok", t("w.ok")], ["soon", t("w.soon")], ["expired", t("w.expired")], ["none", t("w.none")]]} className="md:!w-auto" />
          </div>
          {(active > 0 || q) && <button className="btn btn-sm" onClick={clear}><X size={13} aria-hidden /> {t("reset")}</button>}
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <button className="btn btn-sm" onClick={() => setColMenu(!colMenu)} aria-expanded={colMenu}><Columns3 size={14} aria-hidden /> {t("columns")}</button>
              {colMenu && (
                <div className="absolute right-0 z-30 mt-1 w-48 rounded-lg border border-line bg-surface p-2 shadow-xl">
                  {COLS.map((c) => <label key={c} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-sunk"><input type="checkbox" checked={visible(c)} disabled={c === "tag"} onChange={() => setCols(visible(c) ? cols.filter((x) => x !== c) : [...(cols || DEFAULT_COLS), c])} /> {t(`col.${c}`)}</label>)}
                  <button className="btn btn-sm mt-1 w-full" onClick={() => { setCols(DEFAULT_COLS); setColMenu(false); }}>{t("assets.defaultCols")}</button>
                </div>
              )}
            </div>
            <div className="inline-flex overflow-hidden rounded-md border border-line" role="group" aria-label={t("view")}>
              <button className={`px-2.5 py-1.5 ${view === "table" ? "bg-accent text-accent-ink" : "bg-surface text-mute"}`} onClick={() => setView("table")} aria-pressed={view === "table"} aria-label={t("view.table")}><List size={15} /></button>
              <button className={`px-2.5 py-1.5 ${view === "grid" ? "bg-accent text-accent-ink" : "bg-surface text-mute"}`} onClick={() => setView("grid")} aria-pressed={view === "grid"} aria-label={t("view.grid")}><LayoutGrid size={15} /></button>
            </div>
          </div>
        </div>

        {sel.length > 0 && can("edit") && (
          <div className="no-print flex flex-wrap items-center gap-2 border-b border-line bg-accent-soft px-3 py-2 text-sm">
            <strong>{t("bulk.selected", { n: sel.length })}</strong>
            <button className="btn btn-sm" onClick={() => setBulk({ kind: "status", value: "" })}>{t("bulk.status")}</button>
            <button className="btn btn-sm" onClick={() => setBulk({ kind: "location", value: "" })}>{t("bulk.location")}</button>
            <button className="btn btn-sm" onClick={() => setBulk({ kind: "category", value: "" })}>{t("bulk.category")}</button>
            <Link className="btn btn-sm" href={`/labels?ids=${sel.join(",")}`}>{t("bulk.labels")}</Link>
            {can("delete") && <button className="btn btn-sm btn-danger" onClick={() => setDel(sel)}>{t("delete")}</button>}
            <button className="btn btn-sm ml-auto" onClick={() => setSel([])}>{t("bulk.clear")}</button>
          </div>
        )}

        {rows.length === 0 ? <Empty text={s.assets.length ? t("assets.noMatch") : t("assets.empty")} action={s.assets.length ? <button className="btn" onClick={clear}>{t("reset")}</button> : null} />
          : view === "table" ? (
            <div className="relative overflow-x-auto scroll-thin">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-line bg-sunk"><tr>
                  {can("edit") && <th className="th w-8"><input type="checkbox" checked={allOn} onChange={toggleAll} aria-label={t("bulk.all")} /></th>}
                  {visible("tag") && <SortTh k="tag" table={table}>{t("col.tag")}</SortTh>}
                  {visible("name") && <SortTh k="name" table={table}>{t("col.name")}</SortTh>}
                  {visible("category") && <SortTh k="category" table={table} className="max-md:hidden">{t("col.category")}</SortTh>}
                  {visible("status") && <SortTh k="status" table={table}>{t("col.status")}</SortTh>}
                  {visible("assignee") && <SortTh k="assignee" table={table} className="max-md:hidden">{t("col.assignee")}</SortTh>}
                  {visible("location") && <SortTh k="location" table={table} className="max-lg:hidden">{t("col.location")}</SortTh>}
                  {visible("vendor") && <SortTh k="vendor" table={table} className="max-lg:hidden">{t("col.vendor")}</SortTh>}
                  {visible("purchase") && <SortTh k="purchase" table={table} className="max-lg:hidden">{t("col.purchase")}</SortTh>}
                  {visible("price") && <SortTh k="price" table={table} className="max-md:hidden text-right">{t("col.price")}</SortTh>}
                  {visible("book") && <SortTh k="book" table={table} className="max-lg:hidden">{t("col.book")}</SortTh>}
                  {visible("warranty") && <SortTh k="warranty" table={table} className="max-md:hidden">{t("col.warranty")}</SortTh>}
                  {visible("condition") && <SortTh k="condition" table={table} className="max-lg:hidden">{t("col.condition")}</SortTh>}
                  {visible("serial") && <SortTh k="serial" table={table} className="max-lg:hidden">{t("col.serial")}</SortTh>}
                  <th className="th no-print"><span className="sr-only">{t("actions")}</span></th>
                </tr></thead>
                <tbody>
                  {page.map((a) => (
                    <tr key={a.id} className={`border-b border-line last:border-0 hover:bg-sunk ${sel.includes(a.id) ? "bg-accent-soft/50" : ""}`}>
                      {can("edit") && <td className="td"><input type="checkbox" checked={sel.includes(a.id)} onChange={() => setSel(sel.includes(a.id) ? sel.filter((i) => i !== a.id) : [...sel, a.id])} aria-label={a.tag} /></td>}
                      {visible("tag") && <td className="td whitespace-nowrap font-mono text-xs"><Link href={`/assets/${a.id}`} className="text-accent hover:underline">{a.tag}</Link></td>}
                      {visible("name") && <td className="td min-w-[10rem] font-medium"><Link href={`/assets/${a.id}`} className="hover:underline">{a.name}</Link></td>}
                      {visible("category") && <td className="td max-md:hidden">{t(`cat.${a.category}`)}</td>}
                      {visible("status") && <td className="td"><StatusBadge status={a.status} /></td>}
                      {visible("assignee") && <td className="td max-md:hidden">{byId.emp[a.assigneeId]?.name || <span className="text-mute">–</span>}</td>}
                      {visible("location") && <td className="td max-lg:hidden">{byId.loc[a.locationId]?.name || <span className="text-mute">–</span>}</td>}
                      {visible("vendor") && <td className="td max-lg:hidden">{byId.vendor[a.vendorId]?.name || <span className="text-mute">–</span>}</td>}
                      {visible("purchase") && <td className="td max-lg:hidden whitespace-nowrap">{fmt.date(a.purchaseDate)}</td>}
                      {visible("price") && <td className="td max-md:hidden text-right tabular-nums">{fmt.money(a.price)}</td>}
                      {visible("book") && <td className="td max-lg:hidden whitespace-nowrap tabular-nums">{fmt.money(bookValue(a, s.settings.depreciationYears))}</td>}
                      {visible("warranty") && <td className="td max-md:hidden"><WarrantyBadge asset={a} /></td>}
                      {visible("condition") && <td className="td max-lg:hidden">{t(`cond.${a.condition}`)}</td>}
                      {visible("serial") && <td className="td max-lg:hidden font-mono text-xs">{a.serial || "–"}</td>}
                      <td className="td"><Actions a={a} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
              {page.map((a) => (
                <div key={a.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0"><Link href={`/assets/${a.id}`} className="block truncate font-medium hover:underline">{a.name}</Link><p className="font-mono text-xs text-mute">{a.tag} · {t(`cat.${a.category}`)}</p></div>
                    <StatusBadge status={a.status} />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-mute">{t("col.assignee")}</dt><dd className="truncate">{byId.emp[a.assigneeId]?.name || "–"}</dd></div><div><dt className="text-mute">{t("col.location")}</dt><dd className="truncate">{byId.loc[a.locationId]?.name || "–"}</dd></div><div><dt className="text-mute">{t("col.warranty")}</dt><dd><WarrantyBadge asset={a} /></dd></div><div><dt className="text-mute">{t("col.price")}</dt><dd>{fmt.money(a.price)}</dd></div></dl>
                  <div className="mt-3 border-t border-line pt-2"><Actions a={a} /></div>
                </div>
              ))}
            </div>
          )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>

      <AssetForm open={form.open} asset={form.asset} onClose={() => setForm({ open: false, asset: null })} />
      <ImportAssets open={imp} onClose={() => setImp(false)} />
      <CheckoutModal open={!!out} asset={out} onClose={() => setOut(null)} />
      <CheckinModal open={!!inn} asset={inn} onClose={() => setInn(null)} />
      <Confirm open={!!del} onClose={() => setDel(null)} title={t("delete")} text={t("assets.deleteAsk", { n: del?.length || 0 })} onYes={() => { act("asset/delete", { ids: del }, t("toast.deleted")); setSel(sel.filter((i) => !del.includes(i))); }} yes={t("delete")} />
      <Modal open={!!bulk} onClose={() => setBulk(null)} title={bulk ? t(`bulk.${bulk.kind}`) : ""} footer={<><button className="btn" onClick={() => setBulk(null)}>{t("cancel")}</button><button className="btn btn-primary" disabled={!bulk?.value} onClick={doBulk}>{t("apply")}</button></>}>
        {bulk && <Field label={t("bulk.selected", { n: sel.length })}><Select value={bulk.value} onChange={(v) => setBulk({ ...bulk, value: v })} placeholder={t("choose")} options={bulkOpts} /></Field>}
      </Modal>
    </>
  );
}
