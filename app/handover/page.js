"use client";
import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { useApp } from "@/lib/store";
import { useQueryParam } from "@/lib/hooks";
import { PageHeader, Field, Select } from "@/components/ui";
import { todayIso } from "@/lib/utils";

// Printable handover / return receipt. The paper stays white and black in dark mode.
export default function Handover() {
  const { s, t, fmt } = useApp();
  const qAsset = useQueryParam("asset"), qEmp = useQueryParam("emp"), qType = useQueryParam("type");
  const [type, setType] = useState("handover"), [emp, setEmp] = useState(""), [asset, setAsset] = useState(""), [acc, setAcc] = useState(""), [remarks, setRemarks] = useState("");
  const [wiped, setWiped] = useState(false), [complete, setComplete] = useState(true);

  useEffect(() => {
    if (qType === "return" || qType === "handover") setType(qType);
    const a = s.assets.find((x) => x.id === qAsset);
    if (a) setAsset(a.id);
    const e = qEmp || a?.assigneeId;
    if (e && s.employees.some((x) => x.id === e)) setEmp(e);
  }, [qAsset, qEmp, qType]); // eslint-disable-line

  const person = s.employees.find((e) => e.id === emp);
  const items = useMemo(() => {
    if (asset) { const a = s.assets.find((x) => x.id === asset); return a ? [a] : []; }
    return person ? s.assets.filter((a) => a.assigneeId === person.id) : [];
  }, [s.assets, asset, person]);
  const isReturn = type === "return";
  const loc = (id) => s.locations.find((l) => l.id === id)?.name || "";
  const docNo = `${isReturn ? "RT" : "HO"}-${todayIso().replace(/-/g, "")}-${items.length === 1 ? items[0].tag : (person?.name || "").split(" ").map((w) => w[0]).join("").toUpperCase() || "000"}`;

  return (
    <>
      <PageHeader title={t("ho.title")} sub={t("ho.sub")} actions={<button className="btn btn-primary" disabled={!person || !items.length} onClick={() => window.print()}><Printer size={15} aria-hidden /> {t("ho.print")}</button>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card no-print space-y-3 p-4 lg:col-span-1">
          <Field label={t("ho.form")}>
            <div className="inline-flex overflow-hidden rounded-md border border-line" role="group">
              {[["handover", t("ho.handover")], ["return", t("ho.return")]].map(([v, l]) => <button key={v} onClick={() => setType(v)} aria-pressed={type === v} className={`px-3 py-1.5 text-sm ${type === v ? "bg-accent text-accent-ink" : "bg-surface text-mute"}`}>{l}</button>)}
            </div>
          </Field>
          <Field label={t("ho.pickEmp")}><Select value={emp} onChange={(v) => { setEmp(v); setAsset(""); }} placeholder={t("choose")} options={s.employees.map((e) => [e.id, `${e.name} · ${e.department}`])} /></Field>
          <Field label={t("ho.pickAsset")}>
            <Select value={asset} onChange={setAsset} options={[["", t("ho.allDevices")], ...s.assets.filter((a) => !emp || a.assigneeId === emp || a.id === asset).map((a) => [a.id, `${a.tag} · ${a.name}`])]} />
          </Field>
          <Field label={isReturn ? t("ho.accessoriesRet") : t("ho.accessories")}><input className="input" value={acc} onChange={(e) => setAcc(e.target.value)} placeholder={t("ho.accDefault")} /></Field>
          <Field label={t("ho.remarks")}><textarea className="input min-h-20" value={remarks} onChange={(e) => setRemarks(e.target.value)} /></Field>
          {isReturn && (
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={complete} onChange={(e) => setComplete(e.target.checked)} /> {t("ho.returnOk")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={wiped} onChange={(e) => setWiped(e.target.checked)} /> {t("ho.wiped")}</label>
            </div>
          )}
        </section>

        <section className="lg:col-span-2">
          {!person || !items.length ? (
            <div className="card no-print p-6 text-sm text-mute">{person ? t("ho.noAssets") : t("ho.pick")}</div>
          ) : (
            <article className="mx-auto max-w-[210mm] rounded-md border border-line bg-white p-6 text-[13px] leading-relaxed text-black shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none" style={{ colorScheme: "light" }}>
              <header className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
                <div><p className="text-xs uppercase tracking-widest text-neutral-600">{s.settings.company}</p><h2 className="mt-1 text-xl font-semibold">{isReturn ? t("ho.docReturn") : t("ho.docHandover")}</h2></div>
                <dl className="text-right text-xs"><dt className="text-neutral-600">{t("ho.docNo")}</dt><dd className="font-mono font-semibold">{docNo}</dd><dt className="mt-1 text-neutral-600">{t("ho.date")}</dt><dd>{fmt.date(todayIso())}</dd></dl>
              </header>

              <h3 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-600">{t("ho.employee")}</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                {[[t("ho.name"), person.name], [t("ho.email"), person.email], [t("ho.dept"), person.department], [t("ho.role"), person.title], [t("ho.location"), loc(person.locationId)]].map(([k, v]) => (
                  <div key={k} className="flex gap-2 border-b border-neutral-300 py-1"><dt className="w-24 shrink-0 text-neutral-600">{k}</dt><dd className="min-w-0 break-words">{v || "–"}</dd></div>
                ))}
              </dl>

              <h3 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-600">{t("ho.equipment")}</h3>
              <table className="w-full border-collapse text-left">
                <thead><tr className="border-b border-black text-xs text-neutral-600"><th className="py-1 pr-2 font-medium">{t("ho.tag")}</th><th className="py-1 pr-2 font-medium">{t("ho.item")}</th><th className="py-1 pr-2 font-medium">{t("ho.serial")}</th><th className="py-1 font-medium">{t("ho.condition")}</th></tr></thead>
                <tbody>{items.map((a) => (
                  <tr key={a.id} className="break-inside-avoid border-b border-neutral-300 align-top">
                    <td className="py-1.5 pr-2 font-mono text-xs">{a.tag}</td>
                    <td className="py-1.5 pr-2">{a.name}{a.manufacturer && a.model && `${a.manufacturer} ${a.model}` !== a.name ? <span className="block text-xs text-neutral-600">{a.manufacturer} {a.model}</span> : null}</td>
                    <td className="py-1.5 pr-2 font-mono text-xs">{a.serial || "–"}</td>
                    <td className="py-1.5">{t(`ho.cond.${a.condition}`)}</td>
                  </tr>
                ))}</tbody>
              </table>

              <p className="mt-4"><strong>{isReturn ? t("ho.accessoriesRet") : t("ho.accessories")}:</strong> {acc || "–"}</p>
              <p className="mt-1"><strong>{t("ho.remarks")}:</strong> {remarks || "–"}</p>
              {isReturn && <ul className="mt-2 space-y-0.5"><li>{complete ? "☒" : "☐"} {t("ho.returnOk")}</li><li>{wiped ? "☒" : "☐"} {t("ho.wiped")}</li></ul>}

              <p className="mt-5 text-justify text-xs text-neutral-800">{isReturn ? t("ho.textReturn") : t("ho.textHandover")}</p>

              <div className="mt-12 grid grid-cols-2 gap-10 break-inside-avoid">
                {[t("ho.sigEmp"), t("ho.sigIt")].map((l) => (
                  <div key={l}><div className="h-12 border-b border-black" /><p className="mt-1 text-xs text-neutral-600">{l}</p><div className="mt-6 border-b border-black" /><p className="mt-1 text-xs text-neutral-600">{t("ho.sigDate")}</p></div>
                ))}
              </div>
              <p className="mt-8 text-[10px] text-neutral-500">{t("ho.generated", { company: s.settings.company })}</p>
            </article>
          )}
        </section>
      </div>
    </>
  );
}
