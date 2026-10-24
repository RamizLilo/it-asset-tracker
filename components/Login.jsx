"use client";
import { useState } from "react";
import { Server } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { translate } from "@/lib/i18n";

// Shown in live mode until somebody is signed in.
export default function Login({ lang, setLang }) {
  const t = (k, v) => translate(lang, k, v);
  const [mode, setMode] = useState("in"), [email, setEmail] = useState(""), [pw, setPw] = useState(""), [name, setName] = useState("");
  const [msg, setMsg] = useState(null), [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setMsg(null);
    if (pw.length < 6) { setMsg({ bad: true, text: t("login.short") }); return; }
    setBusy(true);
    const { data, error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password: pw })
      : await supabase.auth.signUp({ email: email.trim(), password: pw, options: { data: { name: name.trim() } } });
    setBusy(false);
    if (error) setMsg({ bad: true, text: t("login.error", { msg: error.message }) });
    else if (mode === "up" && !data.session) { setMsg({ text: t("login.checkMail") }); setMode("in"); }
  }
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-ink"><Server size={18} aria-hidden /></span><span className="font-semibold">{t("brand")}</span></div>
          <button className="btn !px-2.5 text-xs font-semibold" onClick={() => setLang(lang === "en" ? "de" : "en")}>{lang === "en" ? "DE" : "EN"}</button>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-5">
          <div><h1 className="text-lg font-semibold">{mode === "in" ? t("login.title") : t("login.signup")}</h1><p className="mt-1 text-sm text-mute">{t("login.sub")}</p></div>
          {mode === "up" && <label className="block"><span className="label">{t("login.name")}</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
          <label className="block"><span className="label">{t("login.email")}</span><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block"><span className="label">{t("login.password")}</span><input className="input" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></label>
          {msg && <p role="alert" className={`text-sm ${msg.bad ? "text-bad" : "text-ok"}`}>{msg.text}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{mode === "in" ? t("login.signin") : t("login.signup")}</button>
          <button type="button" className="w-full text-center text-sm text-accent hover:underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }}>{mode === "in" ? t("login.toSignup") : t("login.toSignin")}</button>
          {mode === "up" && <p className="text-xs text-mute">{t("login.firstAdmin")}</p>}
        </form>
      </div>
    </div>
  );
}
