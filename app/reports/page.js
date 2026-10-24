"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORIES, MAINT_TYPES, bookValue, ageYears, warrantyState } from "@/lib/utils";
import { toCsv, download } from "@/lib/csv";
import { PageHeader, Select, Empty } from "@/components/ui";
import { HBars, Cols } from "@/components/Charts";

const KEYS = ["dept", "cat", "warranty", "deprec", "maint", "idle"];

export default function Reports() {
  const { s, t, fmt, byId } = useApp();
  const [kind, setKind] = useState("dept");
  const yrs = s.settings.depreciationYears;
  const live = s.assets.filter((a) => !["retired", "lost"].includes(a.status));

  const rep = useMemo(() => {
    const tag = (a) => <Link className="font-mono text-xs text-accent hover:underline" href={`/assets/${a.id}`}>{a.tag}</Link>;
    if (kind === "dept") {
      const depts = [...new Set(s.employees.map((e) => e.department))];
      const rows = depts.map((d) => {
        const people = s.employees.filter((e) => e.department === d && e.active);
        const devs = live.filter((a) => byId.emp[a.assigneeId]?.department === d);
        return { d, people: people.length, n: devs.length, value: devs.reduce((n, a) => n + (a.price || 0), 0), book: devs.reduce((n, a) => n + (bookValue(a, yrs) || 0), 0) };
      }).sort((a, b) => b.n - a.n);
      return { head: [t("rep.col.dept"), t("rep.col.people"), t("rep.col.devices"), t("rep.col.perPerson"), t("rep.col.value"), t("rep.col.book")],
        rows: rows.map((r) => [r.d, r.people, r.n, r.people ? fmt.num(Math.round((r.n / r.people) * 10) / 10) : "–", fmt.money(r.value), fmt.money(r.book)]),
        csv: rows.map((r) => [r.d, r.people, r.n, r.value, Math.round(r.book)]), chart: <HBars data={rows.map((r) => ({ name: r.d, value: r.n }))} height={Math.max(160, rows.length * 34)} color="#2563eb" /> };
    }
    if (kind === "cat") {
      const rows = CATEGORIES.map((c) => { const as = live.filter((a) => a.category === c); const ages = as.map((a) => ageYears(a.purchaseDate)).filter((x) => x != null);
        return { c, n: as.length, value: as.reduce((n, a) => n + (a.price || 0), 0), book: as.reduce((n, a) => n + (bookValue(a, yrs) || 0), 0), age: ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : null }; }).filter((r) => r.n).sort((a, b) => b.value - a.value);
      return { head: [t("f.category"), t("rep.col.devices"), t("rep.col.value"), t("rep.col.book"), t("rep.col.age")],
        rows: rows.map((r) => [t(`cat.${r.c}`), r.n, fmt.money(r.value), fmt.money(r.book), r.age == null ? "–" : t("years", { n: fmt.num(Math.round(r.age * 10) / 10) })]),
        csv: rows.map((r) => [r.c, r.n, r.value, Math.round(r.book), r.age == null ? "" : r.age.toFixed(1)]), chart: <HBars data={rows.map((r) => ({ name: t(`cat.${r.c}`), value: Math.round(r.value) }))} fmt={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} height={Math.max(160, rows.length * 34)} />,
        total: [t("rep.total"), rows.reduce((n, r) => n + r.n, 0), fmt.money(rows.reduce((n, r) => n + r.value, 0)), fmt.money(rows.reduce((n, r) => n + r.book, 0)), ""] };
    }
    if (kind === "warranty") {
      const cnt = { ok: 0, soon: 0, expired: 0, none: 0 };
      live.forEach((a) => { cnt[warrantyState(a, s.settings.warrantyAlertDays)]++; });
      const list = live.filter((a) => ["soon", "expired"].includes(warrantyState(a, s.settings.warrantyAlertDays))).sort((a, b) => a.warrantyEnd.localeCompare(b.warrantyEnd));
      return { summary: t("rep.warrantySummary", cnt), head: [t("col.tag"), t("col.name"), t("col.assignee"), t("col.warranty"), t("f.status")],
        rows: list.map((a) => [tag(a), a.name, byId.emp[a.assigneeId]?.name || "–", fmt.date(a.warrantyEnd), t(`w.${warrantyState(a, s.settings.warrantyAlertDays)}`)]),
        csv: list.map((a) => [a.tag, a.name, byId.emp[a.assigneeId]?.name || "", a.warrantyEnd, warrantyState(a, s.settings.warrantyAlertDays)]),
        chart: <Cols data={[{ name: t("w.ok"), value: cnt.ok }, { name: t("w.soon"), value: cnt.soon }, { name: t("w.expired"), value: cnt.expired }, { name: t("w.none"), value: cnt.none }]} height={200} /> };
    }
    if (kind === "deprec") {
      const list = live.filter((a) => a.price && a.purchaseDate && (ageYears(a.purchaseDate) || 0) >= yrs && ["laptop", "desktop", "phone", "tablet", "monitor"].includes(a.category)).sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate));
      return { head: [t("col.tag"), t("col.name"), t("col.assignee"), t("rep.col.since"), t("col.price"), t("col.condition")],
        rows: list.map((a) => [tag(a), a.name, byId.emp[a.assigneeId]?.name || "–", fmt.date(a.purchaseDate), fmt.money(a.price), t(`cond.${a.condition}`)]),
        csv: list.map((a) => [a.tag, a.name, byId.emp[a.assigneeId]?.name || "", a.purchaseDate, a.price, a.condition]),
        total: list.length ? [t("rep.total"), list.length, "", "", fmt.money(list.reduce((n, a) => n + a.price, 0)), ""] : null };
    }
    if (kind === "maint") {
      const done = s.maintenance.filter((m) => m.status === "done" && m.cost > 0);
      const byType = MAINT_TYPES.map((x) => { const l = done.filter((m) => m.type === x); return { x, n: l.length, cost: l.reduce((n, m) => n + m.cost, 0) }; });
      const perAsset = Object.entries(done.reduce((m, r) => { m[r.assetId] = (m[r.assetId] || 0) + r.cost; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
      return { head: [t("rep.col.type"), t("rep.col.count"), t("rep.col.cost")], rows: byType.map((r) => [t(`mtype.${r.x}`), r.n, fmt.money(r.cost)]), csv: byType.map((r) => [r.x, r.n, r.cost]),
        total: [t("rep.total"), byType.reduce((n, r) => n + r.n, 0), fmt.money(byType.reduce((n, r) => n + r.cost, 0))], chart: perAsset.length ? <><p className="mb-1 text-xs text-mute">{t("rep.topAssets")}</p><HBars data={perAsset.map(([id, v]) => ({ name: byId.asset[id]?.tag || id, value: v }))} fmt={(v) => fmt.money(v)} height={Math.max(160, perAsset.length * 32)} color="#d97706" /></> : null };
    }
    // idle
    const left = live.filter((a) => a.assigneeId && byId.emp[a.assigneeId] && !byId.emp[a.assigneeId].active).map((a) => [a, t("rep.reason.left")]);
    const stock = s.assets.filter((a) => a.status === "in_stock").map((a) => [a, t("rep.reason.stock")]);
    const list = [...left, ...stock];
    return { head: [t("col.tag"), t("col.name"), t("rep.col.reason"), t("col.assignee"), t("col.location")], rows: list.map(([a, r]) => [tag(a), a.name, r, byId.emp[a.assigneeId]?.name || "–", byId.loc[a.locationId]?.name || "–"]), csv: list.map(([a, r]) => [a.tag, a.name, r, byId.emp[a.assigneeId]?.name || "", byId.loc[a.locationId]?.name || ""]) };
  }, [kind, s, t, fmt, byId, yrs]); // eslint-disable-line

  const exportCsv = () => download(`report-${kind}.csv`, toCsv(rep.csv, rep.head.map((h, i) => ({ label: h, get: (r) => r[i] }))));
  const title = t(`rep.${kind}`);
  return (
    <>
      <PageHeader title={t("nav.reports")} sub={t("rep.sub")} actions={<>
        <button className="btn" onClick={exportCsv} disabled={!rep.rows.length}><Download size={15} aria-hidden /> {t("exportCsv")}</button>
        <button className="btn btn-primary" onClick={() => window.print()}><Printer size={15} aria-hidden /> {t("print")}</button>
      </>} />
      <div className="no-print mb-4 max-w-sm"><Select aria-label={t("rep.pick")} value={kind} onChange={setKind} options={KEYS.map((k) => [k, t(`rep.${k}`)])} /></div>
      <div className="card p-4 sm:p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-mute">{t(`rep.${kind}.d`)}</p>
        <p className="print-only mt-1 text-xs">{t("rep.printTitle", { report: title, company: s.settings.company, date: fmt.date(new Date().toISOString().slice(0, 10)) })}</p>
        {rep.summary && <p className="mt-3 text-sm">{rep.summary}</p>}
        {rep.chart && <div className="mt-4">{rep.chart}</div>}
        {rep.rows.length === 0 ? <Empty text={t("rep.empty")} /> : (
          <div className="relative mt-4 overflow-x-auto scroll-thin"><table className="w-full min-w-[460px] text-left">
            <thead className="border-b border-line"><tr>{rep.head.map((h, i) => <th key={i} className="th">{h}</th>)}</tr></thead>
            <tbody>{rep.rows.map((r, i) => <tr key={i} className="border-b border-line last:border-0">{r.map((c, j) => <td key={j} className={`td ${j ? "tabular-nums" : "font-medium"}`}>{c}</td>)}</tr>)}</tbody>
            {rep.total && <tfoot><tr className="border-t-2 border-line font-semibold">{rep.total.map((c, j) => <td key={j} className="td tabular-nums">{c}</td>)}</tr></tfoot>}
          </table></div>
        )}
      </div>
    </>
  );
}
