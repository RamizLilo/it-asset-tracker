"use client";
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useApp } from "@/lib/store";
import { useQueryParam } from "@/lib/hooks";
import { PageHeader, SearchBox, Empty } from "@/components/ui";
import QrLabel from "@/components/QrLabel";

export default function Labels() {
  const { s, t } = useApp();
  const ids0 = useQueryParam("ids");
  const [sel, setSel] = useState([]), [q, setQ] = useState(""), [size, setSize] = useState(96);
  useEffect(() => { if (ids0) setSel(ids0.split(",").filter((id) => s.assets.some((a) => a.id === id))); }, [ids0]); // eslint-disable-line
  const shown = useMemo(() => s.assets.filter((a) => !q || `${a.tag} ${a.name}`.toLowerCase().includes(q.toLowerCase())), [s.assets, q]);
  const chosen = s.assets.filter((a) => sel.includes(a.id));
  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  return (
    <>
      <PageHeader title={t("nav.labels")} sub={t("labels.sub")} actions={<button className="btn btn-primary" disabled={!chosen.length} onClick={() => window.print()}><Printer size={15} aria-hidden /> {t("labels.print")}</button>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card no-print lg:col-span-1">
          <div className="space-y-3 border-b border-line p-3">
            <h2 className="text-sm font-semibold">{t("labels.select")}</h2>
            <SearchBox value={q} onChange={setQ} placeholder={t("labels.search")} />
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-sm" onClick={() => setSel([...new Set([...sel, ...shown.map((a) => a.id)])])}>{t("labels.selectAll")}</button>
              <button className="btn btn-sm" onClick={() => setSel([])}>{t("labels.clear")}</button>
              <span className="ml-auto text-xs text-mute">{t("labels.count", { n: sel.length })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm"><span className="text-mute">{t("labels.size")}</span>
              <div className="inline-flex overflow-hidden rounded-md border border-line" role="group">{[[72, t("labels.s")], [96, t("labels.m")]].map(([v, l]) => <button key={v} onClick={() => setSize(v)} aria-pressed={size === v} className={`px-3 py-1 text-xs ${size === v ? "bg-accent text-accent-ink" : "bg-surface text-mute"}`}>{l}</button>)}</div></div>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto scroll-thin">
            {shown.map((a) => <li key={a.id}><label className="flex cursor-pointer items-center gap-3 border-b border-line px-3 py-2 text-sm last:border-0 hover:bg-sunk"><input type="checkbox" checked={sel.includes(a.id)} onChange={() => toggle(a.id)} /><span className="font-mono text-xs text-mute">{a.tag}</span><span className="truncate">{a.name}</span></label></li>)}
          </ul>
        </section>
        <section className="lg:col-span-2">
          {chosen.length === 0 ? <div className="card no-print"><Empty text={t("labels.empty")} /></div> : (
            <div className="label-sheet grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{chosen.map((a) => <QrLabel key={a.id} asset={a} company={s.settings.company} size={size} />)}</div>
          )}
        </section>
      </div>
    </>
  );
}
