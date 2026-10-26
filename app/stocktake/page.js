"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, Check, Download, Printer, RotateCcw, ScanLine, Undo2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { useStored } from "@/lib/hooks";
import { toCsv, download } from "@/lib/csv";
import { todayIso } from "@/lib/utils";
import { PageHeader, Field, Select, Kpi, Empty, Badge, StatusBadge, Confirm, Modal } from "@/components/ui";

const EMPTY = { loc: "", found: [], extra: [], unknown: [] };

// Stocktake: compare what is physically at one location with what the database says
export default function Stocktake() {
  const { s, t, fmt, act, can, toast } = useApp();
  const [draft, setDraft] = useStored("itam-stocktake", EMPTY);
  const [code, setCode] = useState(""), [cam, setCam] = useState(false), [canCam, setCanCam] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false), [resetOpen, setResetOpen] = useState(false);
  const [move, setMove] = useState(true), [lost, setLost] = useState(false);
  const videoRef = useRef(null), checkRef = useRef(null);

  useEffect(() => { setCanCam(typeof window !== "undefined" && "BarcodeDetector" in window && !!navigator.mediaDevices?.getUserMedia); }, []);

  const loc = s.locations.find((l) => l.id === draft.loc);
  const byEmp = (id) => s.employees.find((e) => e.id === id)?.name || "";
  const expected = useMemo(() => (loc ? s.assets.filter((a) => a.locationId === loc.id && ["in_use", "in_stock"].includes(a.status)) : []), [s.assets, loc]);
  const foundSet = new Set(draft.found);
  const found = expected.filter((a) => foundSet.has(a.id));
  const missing = expected.filter((a) => !foundSet.has(a.id));
  const extra = draft.extra.map((id) => s.assets.find((a) => a.id === id)).filter(Boolean);
  const done = found.length + extra.length + draft.unknown.length;

  const lookup = (raw) => {
    const v = raw.trim();
    const m = v.match(/\/assets\/([^/?#\s]+)/);
    const key = (m ? m[1] : v).toLowerCase();
    return s.assets.find((a) => a.id.toLowerCase() === key || a.tag.toLowerCase() === key);
  };
  const check = (raw) => {
    const v = (raw || "").trim();
    if (!v || !loc) return;
    const a = lookup(v);
    if (!a) { if (!draft.unknown.includes(v)) setDraft({ ...draft, unknown: [...draft.unknown, v] }); toast(t("st.markedUnknown", { code: v }), "bad"); return; }
    if (draft.found.includes(a.id) || draft.extra.includes(a.id)) { toast(t("st.alreadyFound", { tag: a.tag })); return; }
    if (expected.some((x) => x.id === a.id)) { setDraft({ ...draft, found: [...draft.found, a.id] }); toast(t("st.markedFound", { tag: a.tag })); }
    else { setDraft({ ...draft, extra: [...draft.extra, a.id] }); toast(t("st.markedElsewhere", { tag: a.tag, loc: s.locations.find((l) => l.id === a.locationId)?.name || "–" })); }
  };
  checkRef.current = check;

  // camera scan (only where the browser has BarcodeDetector, e.g. Chrome on Android)
  useEffect(() => {
    if (!cam) return undefined;
    let stream, raf, off = false;
    (async () => {
      try {
        const det = new window.BarcodeDetector({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (off) { stream.getTracks().forEach((x) => x.stop()); return; }
        const v = videoRef.current; v.srcObject = stream; await v.play();
        let last = "", lastAt = 0;
        const tick = async () => {
          if (off) return;
          try {
            const r = (await det.detect(v))[0]?.rawValue;
            if (r && (r !== last || Date.now() - lastAt > 2500)) { last = r; lastAt = Date.now(); checkRef.current(r); }
          } catch { /* frame not ready */ }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { toast(t("st.cameraFail"), "bad"); setCam(false); }
    })();
    return () => { off = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((x) => x.stop()); };
  }, [cam]); // eslint-disable-line

  const submit = (e) => { e.preventDefault(); check(code); setCode(""); };
  const toMove = extra.filter((a) => a.locationId !== loc?.id);
  const apply = () => {
    if (move && toMove.length) act("asset/bulk", { ids: toMove.map((a) => a.id), patch: { locationId: loc.id } });
    if (lost && missing.length) act("asset/bulk", { ids: missing.map((a) => a.id), patch: { status: "lost" } });
    act("stocktake/log", { locationId: loc.id, summary: `${found.length}/${expected.length} found, ${missing.length} missing, ${extra.length} unexpected, ${draft.unknown.length} unknown${move && toMove.length ? `, ${toMove.length} moved here` : ""}${lost && missing.length ? `, ${missing.length} marked lost` : ""}` }, t("st.applied"));
    setDraft(EMPTY); setApplyOpen(false);
  };
  const csv = () => {
    const rows = [...found.map((a) => [a, "found"]), ...missing.map((a) => [a, "missing"]), ...extra.map((a) => [a, "unexpected"]), ...draft.unknown.map((c) => [{ tag: c }, "unknown"])];
    download(`stocktake-${loc.name.replace(/\W+/g, "-").toLowerCase()}-${todayIso()}.csv`, toCsv(rows, [
      { label: "tag", get: ([a]) => a.tag }, { label: "name", get: ([a]) => a.name || "" }, { label: "serial", get: ([a]) => a.serial || "" },
      { label: "listed_location", get: ([a]) => s.locations.find((l) => l.id === a.locationId)?.name || "" }, { label: "result", get: ([, r]) => r },
    ]));
  };

  const list = (items, empty, row) => items.length === 0 ? <p className="px-4 py-4 text-sm text-mute">{empty}</p> : <ul>{items.map(row)}</ul>;
  const Row = ({ a, right }) => (
    <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2 text-sm last:border-0">
      <div className="min-w-0"><span className="font-mono text-xs text-mute">{a.tag}</span> <span className="font-medium">{a.name}</span>
        <p className="text-xs text-mute">{[a.serial && `SN ${a.serial}`, byEmp(a.assigneeId)].filter(Boolean).join(" · ")}</p></div>
      <div className="no-print flex items-center gap-2">{right}</div>
    </li>
  );

  return (
    <>
      <PageHeader title={t("st.title")} sub={t("st.sub")} actions={loc && <>
        <button className="btn" onClick={csv}><Download size={15} aria-hidden /> {t("st.csv")}</button>
        <button className="btn" onClick={() => window.print()}><Printer size={15} aria-hidden /> {t("st.print")}</button>
        <button className="btn" onClick={() => setResetOpen(true)}><RotateCcw size={15} aria-hidden /> {t("st.reset")}</button>
      </>} />

      <section className="card no-print mb-5 space-y-4 p-4">
        <Field label={t("st.location")}>
          <Select value={draft.loc} onChange={(v) => setDraft({ ...EMPTY, loc: v })} placeholder={t("st.choose")} options={s.locations.map((l) => [l.id, l.name])} className="max-w-sm" />
        </Field>
        {loc && (
          <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <Field label={t("st.scan")} hint={t("st.scanHint")} className="min-w-[14rem] flex-1">
              <input className="input font-mono" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" autoCapitalize="characters" placeholder="LT-0001" />
            </Field>
            <button className="btn btn-primary" disabled={!code.trim()}><ScanLine size={15} aria-hidden /> {t("st.add")}</button>
            {canCam && <button type="button" className="btn" onClick={() => setCam(!cam)}>{cam ? <CameraOff size={15} aria-hidden /> : <Camera size={15} aria-hidden />} {cam ? t("st.stopCamera") : t("st.camera")}</button>}
          </form>
        )}
        {cam && <video ref={videoRef} playsInline muted className="aspect-video w-full max-w-md rounded-md border border-line bg-black object-cover" />}
      </section>

      {!loc ? <div className="card"><Empty text={t("st.choose")} /></div> : expected.length === 0 && extra.length === 0 ? <div className="card"><Empty text={t("st.noAssets")} /></div> : (
        <>
          <p className="print-only mb-3 text-sm font-semibold">{t("st.date", { loc: loc.name, date: fmt.date(todayIso()) })}</p>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label={t("st.expected")} value={expected.length} hint={t("st.progress", { done: found.length, total: expected.length })} />
            <Kpi label={t("st.found")} value={found.length} tone="ok" />
            <Kpi label={t("st.missing")} value={missing.length} tone={missing.length ? "bad" : "ok"} />
            <Kpi label={t("st.unexpected")} value={extra.length + draft.unknown.length} tone={extra.length + draft.unknown.length ? "warn" : undefined} />
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-sunk no-print" role="progressbar" aria-valuemin={0} aria-valuemax={expected.length} aria-valuenow={found.length}>
            <div className="h-full bg-accent transition-all" style={{ width: `${expected.length ? (found.length / expected.length) * 100 : 0}%` }} />
          </div>
          <p className="mb-5 text-xs text-mute">{t("st.expectedNote")}</p>

          <div className="space-y-5">
            <section className="card"><h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{t("st.tabMissing")} ({missing.length})</h2>
              {list(missing, t("st.noneMissing"), (a) => <Row key={a.id} a={a} right={<><StatusBadge status={a.status} />{<button className="btn btn-sm" onClick={() => setDraft({ ...draft, found: [...draft.found, a.id] })}><Check size={14} aria-hidden /> {t("st.mark")}</button>}</>} />)}</section>
            <section className="card"><h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{t("st.tabUnexpected")} ({extra.length})</h2>
              {list(extra, t("st.noneUnexpected"), (a) => <Row key={a.id} a={a} right={<><Badge tone="warn">{t("st.belongs")}: {s.locations.find((l) => l.id === a.locationId)?.name || "–"}{a.locationId === loc.id ? ` · ${t(`status.${a.status}`)}` : ""}</Badge><button className="btn btn-sm" onClick={() => setDraft({ ...draft, extra: draft.extra.filter((x) => x !== a.id) })}><Undo2 size={14} aria-hidden /> {t("st.unmark")}</button></>} />)}</section>
            {draft.unknown.length > 0 && <section className="card"><h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{t("st.tabUnknown")} ({draft.unknown.length})</h2>
              <ul>{draft.unknown.map((c) => <li key={c} className="flex items-center justify-between gap-2 border-b border-line px-4 py-2 text-sm last:border-0"><span className="font-mono text-xs">{c}</span><button className="btn btn-sm no-print" onClick={() => setDraft({ ...draft, unknown: draft.unknown.filter((x) => x !== c) })}><Undo2 size={14} aria-hidden /> {t("st.unmark")}</button></li>)}</ul></section>}
            <section className="card"><h2 className="border-b border-line px-4 py-3 text-sm font-semibold">{t("st.tabFound")} ({found.length})</h2>
              {list(found, t("st.noneFound"), (a) => <Row key={a.id} a={a} right={<button className="btn btn-sm" onClick={() => setDraft({ ...draft, found: draft.found.filter((x) => x !== a.id) })}><Undo2 size={14} aria-hidden /> {t("st.unmark")}</button>} />)}</section>
          </div>

          {can("edit") && <div className="no-print mt-5 flex justify-end"><button className="btn btn-primary" disabled={done === 0} onClick={() => setApplyOpen(true)}><Check size={15} aria-hidden /> {t("st.apply")}</button></div>}
        </>
      )}

      <Modal open={applyOpen} onClose={() => setApplyOpen(false)} title={t("st.applyTitle")}
        footer={<><button className="btn" onClick={() => setApplyOpen(false)}>{t("cancel")}</button><button className="btn btn-primary" onClick={apply}>{t("st.apply")}</button></>}>
        <div className="space-y-3 text-sm">
          <p>{t("st.progress", { done: found.length, total: expected.length })} · {t("st.missing")}: {missing.length} · {t("st.unexpected")}: {extra.length}</p>
          <label className="flex items-center gap-2"><input type="checkbox" checked={move} onChange={(e) => setMove(e.target.checked)} /> {t("st.moveOpt")} ({toMove.length})</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={lost} onChange={(e) => setLost(e.target.checked)} /> {t("st.lostOpt")} ({missing.length})</label>
          <p className="text-xs text-mute">{t("st.applyHelp")}</p>
        </div>
      </Modal>
      <Confirm open={resetOpen} onClose={() => setResetOpen(false)} title={t("st.reset")} text={t("st.resetAsk")} yes={t("st.reset")} danger={false} onYes={() => { setDraft(EMPTY); setResetOpen(false); }} />
    </>
  );
}
