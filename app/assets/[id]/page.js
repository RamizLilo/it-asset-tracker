"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileSignature, Pencil, Copy, Trash2, UserPlus, Undo2, Wrench, Printer, Save } from "lucide-react";
import { useApp } from "@/lib/store";
import { bookValue, ageYears, daysUntil, warrantyState } from "@/lib/utils";
import { Badge, Confirm, Empty, StatusBadge } from "@/components/ui";
import AssetForm, { CheckoutModal, CheckinModal } from "@/components/AssetForm";
import MaintForm from "@/components/MaintForm";
import QrLabel from "@/components/QrLabel";
import WarrantyBadge from "@/components/WarrantyBadge";
import { Trend } from "@/components/Charts";

const Row = ({ k, children }) => <div className="flex justify-between gap-4 border-b border-line py-2 text-sm last:border-0"><dt className="text-mute">{k}</dt><dd className="min-w-0 text-right text-ink">{children}</dd></div>;

export default function AssetDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { s, t, fmt, act, byId, can } = useApp();
  const a = byId.asset[id];
  const [edit, setEdit] = useState(false), [out, setOut] = useState(false), [inn, setInn] = useState(false), [del, setDel] = useState(false), [maint, setMaint] = useState({ open: false, m: null });
  const [notes, setNotes] = useState(null);

  if (!a) return <div className="card"><Empty text={t("assets.notFound")} action={<Link href="/assets" className="btn">{t("back")}</Link>} /></div>;

  const years = s.settings.depreciationYears;
  const book = bookValue(a, years), age = ageYears(a.purchaseDate), w = warrantyState(a, s.settings.warrantyAlertDays), wd = daysUntil(a.warrantyEnd);
  const mlist = s.maintenance.filter((m) => m.assetId === a.id).sort((x, y) => y.due.localeCompare(x.due));
  const history = s.activity.filter((h) => h.entity === "asset" && h.entityId === a.id);
  const next = mlist.find((m) => m.status !== "done");
  const maintCost = mlist.filter((m) => m.status === "done").reduce((n, m) => n + (m.cost || 0), 0);
  const curve = a.price && a.purchaseDate ? Array.from({ length: years + 1 }, (_, i) => ({ name: String(new Date(a.purchaseDate).getFullYear() + i), value: Math.round(a.price * (1 - i / years)) })) : [];
  const nameNotes = notes ?? a.notes ?? "";

  return (
    <>
      <Link href="/assets" className="no-print mb-3 inline-flex items-center gap-1.5 text-sm text-mute hover:text-ink"><ArrowLeft size={15} aria-hidden /> {t("nav.assets")}</Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-mute">{a.tag}</p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{a.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={a.status} /><Badge tone="mute">{t(`cat.${a.category}`)}</Badge>{w === "soon" && <Badge tone="warn">{t("w.soonIn", { n: wd })}</Badge>}{w === "expired" && <Badge tone="bad">{t("w.expired")}</Badge>}</div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {can("edit") && (a.assigneeId ? <button className="btn" onClick={() => setInn(true)}><Undo2 size={15} aria-hidden /> {t("assets.checkin")}</button> : ["in_stock", "in_use"].includes(a.status) && <button className="btn" onClick={() => setOut(true)}><UserPlus size={15} aria-hidden /> {t("assets.checkout")}</button>)}
          {a.assigneeId && <Link className="btn" href={`/handover?asset=${a.id}&emp=${a.assigneeId}&type=handover`}><FileSignature size={15} aria-hidden /> {t("ho.btn")}</Link>}
          {can("edit") && <button className="btn" onClick={() => setMaint({ open: true, m: null })}><Wrench size={15} aria-hidden /> {t("maint.new")}</button>}
          {can("edit") && <button className="btn" onClick={() => setEdit(true)}><Pencil size={15} aria-hidden /> {t("edit")}</button>}
          {can("edit") && <button className="btn" onClick={() => { act("asset/duplicate", { id: a.id }, t("toast.duplicated")); router.push("/assets"); }}><Copy size={15} aria-hidden /> {t("duplicate")}</button>}
          <button className="btn" onClick={() => window.print()}><Printer size={15} aria-hidden /> {t("print")}</button>
          {can("delete") && <button className="btn btn-danger" onClick={() => setDel(true)}><Trash2 size={15} aria-hidden /> {t("delete")}</button>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-semibold">{t("detail.info")}</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <div>
                <Row k={t("f.manufacturer")}>{a.manufacturer || "–"}</Row><Row k={t("f.model")}>{a.model || "–"}</Row>
                <Row k={t("f.serial")}><span className="font-mono text-xs">{a.serial || "–"}</span></Row><Row k={t("f.condition")}>{t(`cond.${a.condition}`)}</Row>
              </div>
              <div>
                <Row k={t("f.assignee")}>{byId.emp[a.assigneeId] ? <Link className="text-accent hover:underline" href={`/employees?q=${encodeURIComponent(byId.emp[a.assigneeId].name)}`}>{byId.emp[a.assigneeId].name}</Link> : "–"}</Row>
                <Row k={t("f.location")}>{byId.loc[a.locationId]?.name || "–"}</Row><Row k={t("f.vendor")}>{byId.vendor[a.vendorId]?.name || "–"}</Row>
                <Row k={t("f.maintEvery")}>{a.maintenanceEvery ? t("days", { n: a.maintenanceEvery }) : "–"}</Row>
              </div>
            </dl>
            {(s.settings.customFields || []).length > 0 && (
              <dl className="mt-1 grid gap-x-8 sm:grid-cols-2">
                {s.settings.customFields.map((cf) => <Row key={cf.id} k={cf.label}>{cf.type === "date" && a.custom?.[cf.id] ? fmt.date(a.custom[cf.id]) : a.custom?.[cf.id] || "–"}</Row>)}
              </dl>
            )}
          </section>

          <section className="card p-4 sm:p-5">
            <h2 className="mb-2 text-sm font-semibold">{t("detail.finance")}</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              <div><Row k={t("f.price")}>{fmt.money2(a.price)}</Row><Row k={t("f.purchaseDate")}>{fmt.date(a.purchaseDate)}</Row><Row k={t("f.invoice")}>{a.invoice || "–"}</Row></div>
              <div><Row k={t("detail.age")}>{age == null ? "–" : t("years", { n: fmt.num(Math.round(age * 10) / 10) })}</Row><Row k={t("detail.book")}>{fmt.money(book)}</Row><Row k={t("f.warrantyEnd")}><WarrantyBadge asset={a} /></Row></div>
            </dl>
            {curve.length > 0 && <div className="mt-4"><p className="mb-1 text-xs text-mute">{t("detail.curve", { n: years })}</p><Trend data={curve} fmt={(v) => fmt.money(v)} height={150} /></div>}
          </section>

          <section className="card">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5"><h2 className="text-sm font-semibold">{t("nav.maintenance")}</h2>{next && <Badge tone={daysUntil(next.due) < 0 ? "bad" : "info"}>{t("detail.nextMaint")}: {fmt.date(next.due)}</Badge>}</div>
            {mlist.length === 0 ? <Empty text={t("detail.noMaint")} /> : (
              <ul>
                {mlist.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 text-sm last:border-0 sm:px-5">
                    <div className="min-w-0"><p className="font-medium">{m.title}</p><p className="text-xs text-mute">{t(`mtype.${m.type}`)} · {fmt.date(m.due)}{m.cost ? ` · ${fmt.money(m.cost)}` : ""}</p></div>
                    <div className="flex items-center gap-2"><StatusBadge status={m.status} />{can("edit") && m.status !== "done" && <button className="btn btn-sm" onClick={() => act("maint/complete", { id: m.id }, t("toast.done"))}>{t("maint.complete")}</button>}</div>
                  </li>
                ))}
              </ul>
            )}
            {maintCost > 0 && <p className="border-t border-line px-4 py-2.5 text-xs text-mute sm:px-5">{t("detail.maintCost")}: <strong className="text-ink">{fmt.money(maintCost)}</strong></p>}
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold">{t("detail.label")}</h2>
            <QrLabel asset={a} company={s.settings.company} />
            <Link className="btn no-print mt-3 w-full" href={`/labels?ids=${a.id}`}><Printer size={15} aria-hidden /> {t("labels.printLabel")}</Link>
          </section>
          <section className="card p-4 sm:p-5 no-print">
            <h2 className="mb-2 text-sm font-semibold">{t("f.notes")}</h2>
            <textarea className="input min-h-24" value={nameNotes} onChange={(e) => setNotes(e.target.value)} disabled={!can("edit")} aria-label={t("f.notes")} />
            {can("edit") && notes != null && notes !== (a.notes || "") && <button className="btn btn-primary btn-sm mt-2" onClick={() => { act("asset/update", { id: a.id, patch: { notes } }, t("toast.saved")); setNotes(null); }}><Save size={14} aria-hidden /> {t("save")}</button>}
          </section>
          <section className="card p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold">{t("detail.history")}</h2>
            {history.length === 0 ? <p className="text-sm text-mute">{t("detail.noHistory")}</p> : (
              <ol className="relative space-y-4 border-l border-line pl-4">
                {history.slice(0, 12).map((h) => (
                  <li key={h.id} className="text-sm"><span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
                    <p className="font-medium">{t(`act.${h.action}`)}</p><p className="text-xs text-mute">{h.detail}</p><p className="text-xs text-mute">{fmt.dt(h.ts)} · {h.user}</p></li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <AssetForm open={edit} asset={a} onClose={() => setEdit(false)} />
      <CheckoutModal open={out} asset={a} onClose={() => setOut(false)} />
      <CheckinModal open={inn} asset={a} onClose={() => setInn(false)} />
      <MaintForm open={maint.open} maint={maint.m} assetId={a.id} onClose={() => setMaint({ open: false, m: null })} />
      <Confirm open={del} onClose={() => setDel(false)} title={t("delete")} text={t("assets.deleteAsk", { n: 1 })} yes={t("delete")} onYes={() => { act("asset/delete", { ids: [a.id] }, t("toast.deleted")); router.push("/assets"); }} />
    </>
  );
}
