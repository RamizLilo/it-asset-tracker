"use client";
import Link from "next/link";
import { Boxes, CircleCheck, Package, Wrench, Euro, TrendingDown, Plus, ScanLine } from "lucide-react";
import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES, bookValue, daysUntil } from "@/lib/utils";
import { PageHeader, Kpi, Empty } from "@/components/ui";
import { Donut, HBars, Cols, COLORS } from "@/components/Charts";

function Panel({ title, link, children }) {
  const { t } = useApp();
  return (
    <section className="card">
      <div className="flex items-center justify-between border-b border-line px-4 py-3"><h2 className="text-sm font-semibold">{title}</h2>{link && <Link href={link} className="text-xs text-accent hover:underline">{t("viewAll")}</Link>}</div>
      {children}
    </section>
  );
}
const Li = ({ href, a, b }) => (
  <li><Link href={href} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-sm last:border-0 hover:bg-sunk"><span className="min-w-0 truncate">{a}</span><span className="shrink-0 text-xs text-mute">{b}</span></Link></li>
);

export default function Dashboard() {
  const { s, t, fmt, alerts, byId, can } = useApp();
  const live = s.assets.filter((a) => !["retired", "lost"].includes(a.status));
  const count = (st) => s.assets.filter((a) => a.status === st).length;
  const value = live.reduce((n, a) => n + (a.price || 0), 0);
  const book = live.reduce((n, a) => n + (bookValue(a, s.settings.depreciationYears) || 0), 0);
  const statusData = STATUSES.map((x) => ({ name: t(`status.${x}`), value: count(x), color: COLORS[x] })).filter((d) => d.value);
  const catData = CATEGORIES.map((c) => ({ name: t(`cat.${c}`), value: s.assets.filter((a) => a.category === c).length })).filter((d) => d.value).sort((a, b) => b.value - a.value);
  const byYear = {};
  s.assets.forEach((a) => { if (a.purchaseDate && a.price) { const y = a.purchaseDate.slice(0, 4); byYear[y] = (byYear[y] || 0) + a.price; } });
  const yearData = Object.entries(byYear).sort().map(([name, v]) => ({ name, value: Math.round(v) }));
  const overdue = s.maintenance.filter((m) => m.status !== "done" && daysUntil(m.due) < 0).length;

  return (
    <>
      <PageHeader title={t("nav.dashboard")} sub={t("dash.sub", { company: s.settings.company })} actions={<>
        <button className="btn" onClick={() => window.dispatchEvent(new Event("open-palette"))}><ScanLine size={15} aria-hidden /> {t("dash.find")}</button>
        {can("edit") && <Link href="/assets?new=1" className="btn btn-primary"><Plus size={15} aria-hidden /> {t("assets.new")}</Link>}
      </>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label={t("dash.total")} value={fmt.num(live.length)} hint={t("dash.totalHint", { n: s.assets.length - live.length })} icon={Boxes} />
        <Kpi label={t("status.in_use")} value={fmt.num(count("in_use"))} icon={CircleCheck} tone="ok" />
        <Kpi label={t("status.in_stock")} value={fmt.num(count("in_stock"))} icon={Package} />
        <Kpi label={t("status.in_repair")} value={fmt.num(count("in_repair"))} icon={Wrench} tone={count("in_repair") ? "warn" : undefined} hint={overdue ? t("dash.overdue", { n: overdue }) : undefined} />
        <Kpi label={t("dash.value")} value={fmt.money(value)} icon={Euro} />
        <Kpi label={t("dash.book")} value={fmt.money(book)} icon={TrendingDown} hint={t("dash.bookHint", { n: s.settings.depreciationYears })} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title={t("dash.byStatus")} link="/assets"><div className="p-4"><Donut data={statusData} />
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">{statusData.map((d) => <li key={d.name} className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}</span><span className="tabular-nums text-mute">{d.value}</span></li>)}</ul></div></Panel>
        <Panel title={t("dash.byCategory")}><div className="p-4"><HBars data={catData} height={250} /></div></Panel>
        <Panel title={t("dash.spend")}><div className="p-4"><Cols data={yearData} fmt={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} height={250} /></div></Panel>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel title={`${t("alerts.warranty")} (${alerts.warranty.length})`}>
          {alerts.warranty.length === 0 ? <Empty text={t("dash.none")} /> : <ul>{alerts.warranty.slice(0, 6).map((a) => <Li key={a.id} href={`/assets/${a.id}`} a={`${a.tag} · ${a.name}`} b={fmt.date(a.warrantyEnd)} />)}</ul>}
        </Panel>
        <Panel title={`${t("alerts.maintenance")} (${alerts.maintenance.length})`} link="/maintenance">
          {alerts.maintenance.length === 0 ? <Empty text={t("dash.none")} /> : <ul>{alerts.maintenance.slice(0, 6).map((m) => <Li key={m.id} href="/maintenance" a={`${byId.asset[m.assetId]?.tag || ""} · ${m.title}`} b={fmt.date(m.due)} />)}</ul>}
        </Panel>
        <Panel title={`${t("alerts.leavers")} (${alerts.leavers.length})`} link="/employees">
          {alerts.leavers.length === 0 ? <Empty text={t("dash.none")} /> : <ul>{alerts.leavers.slice(0, 6).map((a) => <Li key={a.id} href={`/assets/${a.id}`} a={`${a.tag} · ${a.name}`} b={byId.emp[a.assigneeId]?.name} />)}</ul>}
        </Panel>
      </div>
    </>
  );
}
