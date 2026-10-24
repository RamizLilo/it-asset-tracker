"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { reduce } from "./reducer";
import { makeSeed } from "./seed";
import { makeFormatters, warrantyState, daysUntil } from "./utils";
import { translate } from "./i18n";
import { LIVE, supabase } from "./supabase";
import { loadAll, syncDiff } from "./db";
import Login from "@/components/Login";

const KEY = "itam-data-v1";   // demo mode: all data
const PREFS = "itam-prefs";   // live mode: only language, theme and page size
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const FREE_SETTINGS = ["lang", "theme", "role", "pageSize"]; // every role may change these (view only)
const COLLECTIONS = ["assets", "employees", "locations", "vendors", "maintenance", "licenses", "consumables", "activity"];

export function AppProvider({ children }) {
  const [s, setS] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [phase, setPhase] = useState("boot"); // boot | login | ready
  const [prefs, setPrefs] = useState({ lang: "en", theme: "light", pageSize: 15 });
  const [profile, setProfile] = useState(null);
  const ref = useRef(null);
  const chain = useRef(Promise.resolve());

  const lang = s?.settings.lang || prefs.lang;
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);
  const toast = useCallback((msg, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setToasts((x) => x.filter((y) => y.id !== id)), 4500);
  }, []);

  // build the app state from what the database returned
  const fromDb = useCallback((db, prof, p) => {
    const base = makeSeed(prof.name).settings;
    return { ...Object.fromEntries(COLLECTIONS.map((k) => [k, db[k]])),
      settings: { ...base, ...db.settingsRow, lang: p.lang, theme: p.theme, pageSize: p.pageSize, role: prof.role, user: prof.name }, counters: {} };
  }, []);
  const readPrefs = () => { try { return { lang: "en", theme: "light", pageSize: 15, ...JSON.parse(localStorage.getItem(PREFS) || "{}") }; } catch { return { lang: "en", theme: "light", pageSize: 15 }; } };

  // --- start: demo mode reads the browser, live mode waits for a login
  useEffect(() => {
    if (!LIVE) {
      let data = null;
      try { data = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { /* broken data: start fresh */ }
      if (!data || !data.assets) data = makeSeed();
      ref.current = data; setS(data); setPhase("ready");
      return;
    }
    const p = readPrefs(); setPrefs(p);
    let off = false;
    const open = async (session) => {
      if (off) return;
      if (!session) { ref.current = null; setS(null); setProfile(null); setPhase("login"); return; }
      try {
        const { data: prof, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
        if (error) throw new Error(error.message);
        if (!prof) { toast(translate(p.lang, "db.noProfile"), "bad"); await supabase.auth.signOut(); return; }
        const db = await loadAll(supabase);
        if (off) return;
        const st = fromDb(db, prof, readPrefs());
        ref.current = st; setProfile(prof); setS(st); setPhase("ready");
      } catch (e) { toast(translate(p.lang, "db.loadError", { msg: e.message }), "bad"); setPhase("login"); }
    };
    supabase.auth.getSession().then(({ data }) => open(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((ev, session) => { if (ev === "SIGNED_OUT" || (ev === "SIGNED_IN" && !ref.current)) open(session); });
    return () => { off = true; sub.subscription.unsubscribe(); };
  }, [fromDb, toast]);

  // --- keep the browser copy / theme in step with the state
  useEffect(() => {
    const th = s?.settings.theme || prefs.theme, lg = s?.settings.lang || prefs.lang;
    document.documentElement.setAttribute("data-theme", th); document.documentElement.lang = lg;
    if (!s) return;
    ref.current = s;
    try {
      if (LIVE) localStorage.setItem(PREFS, JSON.stringify({ lang: s.settings.lang, theme: s.settings.theme, pageSize: s.settings.pageSize }));
      else localStorage.setItem(KEY, JSON.stringify(s));
    } catch { /* storage full or blocked */ }
  }, [s, prefs]);

  // --- live mode: send the difference to the database, one write after the other
  const reload = useCallback(async () => {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", profile.id).maybeSingle();
      const db = await loadAll(supabase);
      const st = fromDb(db, prof || profile, { lang: ref.current.settings.lang, theme: ref.current.settings.theme, pageSize: ref.current.settings.pageSize });
      ref.current = st; setS(st);
    } catch (e) { toast(t("db.loadError", { msg: e.message }), "bad"); }
  }, [profile, fromDb, toast, t]);
  const queueSync = useCallback((prev, next) => {
    chain.current = chain.current.then(() => syncDiff(supabase, prev, next)).catch(async (e) => { toast(t("db.error", { msg: e.message }), "bad"); await reload(); });
  }, [t, toast, reload]);

  const role = s?.settings.role || "viewer";
  const can = useCallback((what) => (what === "view" ? true : what === "edit" ? role !== "viewer" : role === "admin"), [role]);

  // "act" checks permission and simple rules, then changes the data. It returns true when it worked.
  const act = useCallback((type, payload, okMsg) => {
    const cur = ref.current;
    const r = cur.settings.role;
    if (LIVE && type === "settings/update") { payload = { ...payload }; delete payload.role; delete payload.user; if (!Object.keys(payload).length) return true; }
    const free = type === "settings/update" && Object.keys(payload).every((k) => FREE_SETTINGS.includes(k));
    const need = free ? "view" : type.endsWith("/delete") || type.startsWith("settings") || type === "replace" ? "admin" : "edit";
    if ((need === "admin" && r !== "admin") || (need === "edit" && r === "viewer")) { toast(t("denied"), "bad"); return false; }
    const used = (arr, k, id) => arr.some((x) => x[k] === id);
    if (type === "loc/delete" && (used(cur.assets, "locationId", payload.id) || used(cur.employees, "locationId", payload.id) || used(cur.consumables, "locationId", payload.id))) { toast(t("err.inuse"), "bad"); return false; }
    if (type === "vendor/delete" && (used(cur.assets, "vendorId", payload.id) || used(cur.licenses, "vendorId", payload.id))) { toast(t("err.inuse"), "bad"); return false; }
    if (type === "emp/delete" && used(cur.assets, "assigneeId", payload.id)) { toast(t("err.hasAssets"), "bad"); return false; }
    if (type === "asset/add" && payload.tag && cur.assets.some((a) => a.tag.toLowerCase() === payload.tag.toLowerCase())) { toast(t("err.tag"), "bad"); return false; }
    if (type === "asset/update" && payload.patch.tag && cur.assets.some((a) => a.id !== payload.id && a.tag.toLowerCase() === payload.patch.tag.toLowerCase())) { toast(t("err.tag"), "bad"); return false; }
    if (type === "lic/assign") {
      const l = cur.licenses.find((x) => x.id === payload.id);
      if (l.assigned.length >= l.seats) { toast(t("err.seats"), "bad"); return false; }
    }
    const next = reduce(cur, { type, payload });
    ref.current = next; setS(next);
    if (LIVE && !free) queueSync(cur, next);
    if (okMsg) toast(okMsg);
    return true;
  }, [t, toast, queueSync]);

  const replaceAll = useCallback((next, msg) => { const cur = ref.current; ref.current = next; setS(next); if (LIVE) queueSync(cur, next); toast(msg); }, [queueSync, toast]);
  const resetDemo = useCallback(() => { const d = makeSeed(ref.current.settings.user); d.settings = { ...d.settings, lang: ref.current.settings.lang, theme: ref.current.settings.theme, pageSize: ref.current.settings.pageSize, role: ref.current.settings.role, user: ref.current.settings.user }; replaceAll(d, t("settings.resetDone")); }, [replaceAll, t]);
  const clearAll = useCallback(() => {
    const cur = ref.current;
    replaceAll({ ...cur, assets: [], employees: [], locations: [{ id: "loc1", name: "Main office", site: "" }], vendors: [], maintenance: [], licenses: [], consumables: [], activity: [] }, t("settings.clearDone"));
  }, [replaceAll, t]);
  const signOut = useCallback(() => supabase?.auth.signOut(), []);

  const fmt = useMemo(() => makeFormatters(lang, s?.settings.currency || "EUR"), [lang, s?.settings.currency]);

  const alerts = useMemo(() => {
    if (!s) return { warranty: [], maintenance: [], stock: [], licenses: [], leavers: [], count: 0 };
    const st = s.settings;
    const warranty = s.assets.filter((a) => !["retired", "lost"].includes(a.status) && warrantyState(a, st.warrantyAlertDays) === "soon").sort((a, b) => a.warrantyEnd.localeCompare(b.warrantyEnd));
    const maintenance = s.maintenance.filter((m) => m.status !== "done" && daysUntil(m.due) <= st.maintenanceAlertDays).sort((a, b) => a.due.localeCompare(b.due));
    const stock = s.consumables.filter((c) => c.stock <= c.reorderAt);
    const licenses = s.licenses.filter((l) => l.expiry && daysUntil(l.expiry) <= 45).sort((a, b) => a.expiry.localeCompare(b.expiry));
    const leavers = s.assets.filter((a) => a.assigneeId && s.employees.find((e) => e.id === a.assigneeId && !e.active));
    return { warranty, maintenance, stock, licenses, leavers, count: warranty.length + maintenance.length + stock.length + licenses.length + leavers.length };
  }, [s]);

  const value = useMemo(() => s && ({
    s, act, t, lang, fmt, can, toast, toasts, alerts, resetDemo, clearAll, live: LIVE, profile, signOut,
    set: (patch, msg) => act("settings/update", patch, msg),
    byId: {
      emp: Object.fromEntries(s.employees.map((e) => [e.id, e])), loc: Object.fromEntries(s.locations.map((l) => [l.id, l])),
      vendor: Object.fromEntries(s.vendors.map((v) => [v.id, v])), asset: Object.fromEntries(s.assets.map((a) => [a.id, a])),
    },
  }), [s, act, t, lang, fmt, can, toast, toasts, alerts, resetDemo, clearAll, profile, signOut]);

  if (phase === "login") return <><Login lang={prefs.lang} setLang={(l) => { const p = { ...prefs, lang: l }; setPrefs(p); try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch { /* ignore */ } }} /><LoginToasts toasts={toasts} /></>;
  if (!value) return <div className="grid min-h-screen place-items-center text-sm text-mute">Loading…</div>;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function LoginToasts({ toasts }) {
  return <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2" role="status">{toasts.map((x) => <div key={x.id} className="rounded-md border border-bad bg-bad-soft px-3.5 py-2.5 text-sm text-bad shadow-lg">{x.msg}</div>)}</div>;
}
