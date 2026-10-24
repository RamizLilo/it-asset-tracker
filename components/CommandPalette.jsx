"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Users, FileText, Zap } from "lucide-react";
import { useApp } from "@/lib/store";
import { toCsv, download } from "@/lib/csv";
import { assetColumns } from "@/lib/columns";

export default function CommandPalette() {
  const { s, t, set, byId, fmt, can } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false), [q, setQ] = useState(""), [i, setI] = useState(0);
  const input = useRef(null);
  useEffect(() => { const o = () => { setOpen(true); setQ(""); setI(0); }; window.addEventListener("open-palette", o); return () => window.removeEventListener("open-palette", o); }, []);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 20); }, [open]);

  const items = useMemo(() => {
    const go = (href) => () => router.push(href);
    const pages = [["nav.dashboard", "/"], ["nav.assets", "/assets"], ["nav.employees", "/employees"], ["nav.locations", "/locations"], ["nav.vendors", "/vendors"], ["nav.maintenance", "/maintenance"], ["nav.licenses", "/licenses"], ["nav.consumables", "/consumables"], ["nav.labels", "/labels"], ["nav.reports", "/reports"], ["nav.activity", "/activity"], ["nav.settings", "/settings"]]
      .map(([k, h]) => ({ group: t("palette.pages"), label: t(k), icon: FileText, run: go(h) }));
    const actions = [
      ...(can("edit") ? [{ group: t("palette.actions"), label: t("assets.new"), icon: Zap, run: go("/assets?new=1") }] : []),
      { group: t("palette.actions"), label: t("theme.toggle"), icon: Zap, run: () => set({ theme: s.settings.theme === "dark" ? "light" : "dark" }) },
      { group: t("palette.actions"), label: s.settings.lang === "en" ? "Deutsch" : "English", icon: Zap, run: () => set({ lang: s.settings.lang === "en" ? "de" : "en" }) },
      { group: t("palette.actions"), label: t("assets.exportCsv"), icon: Zap, run: () => download("assets.csv", toCsv(s.assets, assetColumns(t, byId, fmt))) },
    ];
    const term = q.trim().toLowerCase();
    const match = (...v) => v.some((x) => String(x || "").toLowerCase().includes(term));
    const assets = term ? s.assets.filter((a) => match(a.tag, a.name, a.serial, byId.emp[a.assigneeId]?.name)).slice(0, 6).map((a) => ({ group: t("nav.assets"), label: `${a.tag} · ${a.name}`, icon: Boxes, run: go(`/assets/${a.id}`) })) : [];
    const people = term ? s.employees.filter((e) => match(e.name, e.email)).slice(0, 4).map((e) => ({ group: t("nav.employees"), label: e.name, icon: Users, run: go(`/employees?q=${encodeURIComponent(e.name)}`) })) : [];
    return [...assets, ...people, ...[...actions, ...pages].filter((x) => !term || x.label.toLowerCase().includes(term))];
  }, [q, s, t, byId, fmt, can, router, set]);

  if (!open) return null;
  const run = (it) => { setOpen(false); it?.run(); };
  const key = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setI(Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setI(Math.max(0, i - 1)); }
    else if (e.key === "Enter") run(items[i]);
  };
  let last = "";
  return (
    <div className="no-print fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-3 pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={t("palette.title")} className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
        <input ref={input} className="w-full border-b border-line bg-transparent px-4 py-3.5 text-sm text-ink outline-none placeholder:text-mute" placeholder={t("search.placeholder")} value={q} onChange={(e) => { setQ(e.target.value); setI(0); }} onKeyDown={key} aria-label={t("palette.title")} />
        <ul className="max-h-[50vh] overflow-y-auto p-2 scroll-thin" role="listbox">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-mute">{t("palette.none")}</li>}
          {items.map((it, n) => {
            const head = it.group !== last; last = it.group;
            return (
              <li key={n} role="presentation">
                {head && <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-mute">{it.group}</p>}
                <button role="option" aria-selected={n === i} onMouseEnter={() => setI(n)} onClick={() => run(it)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${n === i ? "bg-accent-soft text-ink" : "text-ink"}`}>
                  <it.icon size={15} className="text-mute" aria-hidden /> <span className="truncate">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
