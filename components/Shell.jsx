"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, Boxes, Users, MapPin, Truck, Wrench, KeyRound, Package, BarChart3, History, Settings, QrCode, Menu, Search, Bell, Moon, Sun, X, Server, LogOut } from "lucide-react";
import { useApp } from "@/lib/store";
import { Toaster } from "./ui";
import CommandPalette from "./CommandPalette";

const NAV = [
  ["/", "nav.dashboard", LayoutDashboard], ["/assets", "nav.assets", Boxes], ["/employees", "nav.employees", Users], ["/locations", "nav.locations", MapPin],
  ["/vendors", "nav.vendors", Truck], ["/maintenance", "nav.maintenance", Wrench], ["/licenses", "nav.licenses", KeyRound], ["/consumables", "nav.consumables", Package],
  ["/labels", "nav.labels", QrCode], ["/reports", "nav.reports", BarChart3], ["/activity", "nav.activity", History], ["/settings", "nav.settings", Settings],
];

function Bell2() {
  const { t, alerts, byId, fmt } = useApp();
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const h = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const Row = ({ href, a, b }) => <Link href={href} onClick={() => setOpen(false)} className="block rounded px-2 py-1.5 text-sm hover:bg-sunk"><span className="text-ink">{a}</span> <span className="text-xs text-mute">{b}</span></Link>;
  const Sec = ({ title, n, children }) => n ? <div className="mb-2"><p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-mute">{title} ({n})</p>{children}</div> : null;
  return (
    <div className="relative" ref={box}>
      <button className="btn relative !px-2.5" onClick={() => setOpen(!open)} aria-label={t("alerts.title")} aria-expanded={open}>
        <Bell size={16} aria-hidden />
        {alerts.count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-bad px-1 text-[10px] font-semibold text-white">{alerts.count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 max-h-[70vh] w-[min(22rem,90vw)] overflow-y-auto rounded-lg border border-line bg-surface p-2 shadow-xl scroll-thin">
          {alerts.count === 0 && <p className="p-3 text-sm text-mute">{t("alerts.none")}</p>}
          <Sec title={t("alerts.warranty")} n={alerts.warranty.length}>{alerts.warranty.slice(0, 4).map((a) => <Row key={a.id} href={`/assets/${a.id}`} a={a.tag} b={fmt.date(a.warrantyEnd)} />)}</Sec>
          <Sec title={t("alerts.maintenance")} n={alerts.maintenance.length}>{alerts.maintenance.slice(0, 4).map((m) => <Row key={m.id} href="/maintenance" a={m.title} b={fmt.date(m.due)} />)}</Sec>
          <Sec title={t("alerts.stock")} n={alerts.stock.length}>{alerts.stock.slice(0, 4).map((c) => <Row key={c.id} href="/consumables" a={c.name} b={`${c.stock} / ${c.reorderAt}`} />)}</Sec>
          <Sec title={t("alerts.licenses")} n={alerts.licenses.length}>{alerts.licenses.slice(0, 4).map((l) => <Row key={l.id} href="/licenses" a={l.name} b={fmt.date(l.expiry)} />)}</Sec>
          <Sec title={t("alerts.leavers")} n={alerts.leavers.length}>{alerts.leavers.slice(0, 4).map((a) => <Row key={a.id} href={`/assets/${a.id}`} a={a.tag} b={byId.emp[a.assigneeId]?.name} />)}</Sec>
        </div>
      )}
    </div>
  );
}

export default function Shell({ children }) {
  const { s, t, set, alerts, live, signOut } = useApp();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);

  // keyboard: Ctrl/Cmd+K palette, g then a/d/e... quick jumps
  useEffect(() => {
    let g = 0;
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); window.dispatchEvent(new Event("open-palette")); return; }
      const tag = e.target.tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || e.target.isContentEditable || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "/") { e.preventDefault(); window.dispatchEvent(new Event("open-palette")); return; }
      if (e.key === "g") { g = Date.now(); return; }
      if (Date.now() - g < 900) {
        const map = { d: "/", a: "/assets", e: "/employees", m: "/maintenance", l: "/licenses", r: "/reports" };
        if (map[e.key]) router.push(map[e.key]);
        g = 0;
      }
    };
    document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h);
  }, [router]);

  const nav = (
    <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 scroll-thin">
      {NAV.map(([href, key, Icon]) => {
        const on = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${on ? "bg-white/10 font-medium text-white" : "text-[var(--side-ink)] hover:bg-white/5 hover:text-white"}`}>
            <Icon size={17} aria-hidden /> {t(key)}
            {href === "/" && alerts.count > 0 && <span className="ml-auto rounded-full bg-bad px-1.5 text-[10px] font-semibold text-white">{alerts.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
  const brand = (
    <div className="flex items-center gap-2.5 border-b border-[var(--side-line)] px-5 py-4">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-ink"><Server size={17} aria-hidden /></span>
      <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{t("brand")}</p><p className="truncate text-xs text-[var(--side-ink)]">{s.settings.company}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[var(--side)] lg:flex">{brand}{nav}
        <p className="border-t border-[var(--side-line)] px-5 py-3 text-xs text-[var(--side-ink)]">{t("shortcuts")}</p>
      </aside>
      {menu && (
        <div className="no-print fixed inset-0 z-50 lg:hidden" onMouseDown={(e) => e.target === e.currentTarget && setMenu(false)}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[var(--side)]">
            <button className="absolute right-3 top-3 text-[var(--side-ink)]" onClick={() => setMenu(false)} aria-label="Close menu"><X size={18} /></button>{brand}{nav}
          </aside>
        </div>
      )}
      <div className="lg:ml-60">
        <header className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur sm:px-6">
          <button className="btn !px-2.5 lg:hidden" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={17} /></button>
          <button onClick={() => window.dispatchEvent(new Event("open-palette"))} className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-sunk px-3 py-2 text-left text-sm text-mute hover:border-mute sm:max-w-md">
            <Search size={15} aria-hidden /> <span className="truncate">{t("search.placeholder")}</span><kbd className="ml-auto hidden rounded border border-line bg-surface px-1.5 text-xs sm:block">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            {live ? (
              <span className="hidden items-center gap-2 text-xs sm:flex"><span className="max-w-[9rem] truncate font-medium">{s.settings.user}</span><span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">{t(`role.${s.settings.role}`)}</span></span>
            ) : (
              <select className="input !w-auto !py-2 text-xs max-sm:hidden" value={s.settings.role} onChange={(e) => set({ role: e.target.value })} aria-label={t("role.label")} title={t("role.label")}>
                {["admin", "technician", "viewer"].map((r) => <option key={r} value={r}>{t(`role.${r}`)}</option>)}
              </select>
            )}
            <button className="btn !px-2.5 text-xs font-semibold" onClick={() => set({ lang: s.settings.lang === "en" ? "de" : "en" })} aria-label="Language">{s.settings.lang === "en" ? "DE" : "EN"}</button>
            <button className="btn !px-2.5" onClick={() => set({ theme: s.settings.theme === "dark" ? "light" : "dark" })} aria-label={t("theme.toggle")}>{s.settings.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
            <Bell2 />
            {live && <button className="btn !px-2.5" onClick={signOut} aria-label={t("logout")} title={t("logout")}><LogOut size={16} /></button>}
          </div>
        </header>
        <main className="px-3 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
      <CommandPalette />
      <Toaster />
    </div>
  );
}
