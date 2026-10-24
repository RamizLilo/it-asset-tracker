"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useApp } from "@/lib/store";

export function PageHeader({ title, sub, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-mute">{sub}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONES = { ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn", bad: "bg-bad-soft text-bad", info: "bg-info-soft text-info", mute: "bg-sunk text-mute border border-line", accent: "bg-accent-soft text-accent" };
export function Badge({ tone = "mute", children, dot }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}
    </span>
  );
}
export const STATUS_TONE = { in_use: "ok", in_stock: "info", in_repair: "warn", retired: "mute", lost: "bad", scheduled: "info", in_progress: "warn", done: "ok" };
export function StatusBadge({ status }) {
  const { t } = useApp();
  return <Badge tone={STATUS_TONE[status] || "mute"} dot>{t(`status.${status}`)}</Badge>;
}

export function Modal({ open, onClose, title, children, wide, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.activeElement;
    setTimeout(() => ref.current?.querySelector("input,select,textarea,button")?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[92vh] w-full flex-col rounded-t-xl border border-line bg-surface shadow-xl sm:rounded-xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-mute hover:bg-sunk"><X size={18} /></button>
        </div>
        <div className="scroll-thin overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-4 py-3 sm:px-5">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ open, title, text, onYes, onClose, danger = true, yes }) {
  const { t } = useApp();
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><button className="btn" onClick={onClose}>{t("cancel")}</button><button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={() => { onYes(); onClose(); }}>{yes || t("confirm")}</button></>}>
      <p className="text-sm text-ink">{text}</p>
    </Modal>
  );
}

export function Field({ label, error, children, hint, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-mute">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-bad">{error}</span>}
    </label>
  );
}

export function Select({ value, onChange, options, placeholder, className = "", ...rest }) {
  return (
    <select className={`input ${className}`} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest}>
      {placeholder != null && <option value="">{placeholder}</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

export function SearchBox({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden />
      <input className="input pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

export function Empty({ text, action }) {
  return (
    <div className="grid place-items-center gap-3 px-4 py-12 text-center">
      <p className="text-sm text-mute">{text}</p>{action}
    </div>
  );
}

export function Kpi({ label, value, hint, tone, icon: Icon }) {
  const c = { bad: "text-bad", warn: "text-warn", ok: "text-ok" }[tone] || "text-ink";
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-mute">{label}</p>
        {Icon && <Icon size={16} className="text-mute" aria-hidden />}
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${c}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </div>
  );
}

// table state: sorting and paging for any list
export function useTable(rows, { sort = null, dir = "asc", size = 15 } = {}) {
  const [key, setKey] = useState(sort), [d, setD] = useState(dir), [page, setPage] = useState(1), [pageSize, setPageSize] = useState(size);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages);
  useEffect(() => { setPage(1); }, [rows.length]);
  return {
    key, dir: d, page: p, pages, pageSize, setPage, setPageSize,
    toggle: (k) => { if (key === k) setD(d === "asc" ? "desc" : "asc"); else { setKey(k); setD("asc"); } },
    slice: (sorted) => sorted.slice((p - 1) * pageSize, p * pageSize),
  };
}

export function SortTh({ k, table, children, className = "" }) {
  const on = table.key === k;
  return (
    <th className={`th ${className}`} aria-sort={on ? (table.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button onClick={() => table.toggle(k)} className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink">
        {children}{on && (table.dir === "asc" ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />)}
      </button>
    </th>
  );
}

export function Pager({ table, total }) {
  const { t, fmt } = useApp();
  const from = total ? (table.page - 1) * table.pageSize + 1 : 0, to = Math.min(total, table.page * table.pageSize);
  return (
    <div className="no-print flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5 text-xs text-mute">
      <span>{t("pager.range", { from: fmt.num(from), to: fmt.num(to), total: fmt.num(total) })}</span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5">{t("pager.rows")}
          <select className="input !w-auto !py-1 !text-xs" value={table.pageSize} onChange={(e) => { table.setPageSize(Number(e.target.value)); table.setPage(1); }}>
            {[10, 15, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <button className="btn btn-sm" disabled={table.page <= 1} onClick={() => table.setPage(table.page - 1)} aria-label={t("pager.prev")}><ChevronLeft size={14} /></button>
        <span className="tabular-nums">{table.page} / {table.pages}</span>
        <button className="btn btn-sm" disabled={table.page >= table.pages} onClick={() => table.setPage(table.page + 1)} aria-label={t("pager.next")}><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts } = useApp();
  return (
    <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map((x) => (
        <div key={x.id} className={`pointer-events-auto rounded-md border px-3.5 py-2.5 text-sm shadow-lg ${x.kind === "bad" ? "border-bad bg-bad-soft text-bad" : "border-line bg-surface text-ink"}`}>{x.msg}</div>
      ))}
    </div>
  );
}

// Link text to a person / place / asset
export const dash = <span className="text-mute">–</span>;
