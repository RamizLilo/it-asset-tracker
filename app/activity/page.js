"use client";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useApp } from "@/lib/store";
import { toCsv, download } from "@/lib/csv";
import { PageHeader, SearchBox, Select, Badge, Pager, useTable, Empty } from "@/components/ui";

const TONE = { create: "ok", delete: "bad", update: "info", checkout: "accent", checkin: "accent", complete: "ok", import: "warn", bulk: "warn", assign: "info", unassign: "mute", stock: "mute" };
export default function Activity() {
  const { s, t, fmt } = useApp();
  const [q, setQ] = useState(""), [ent, setEnt] = useState(""), [action, setAction] = useState(""), [user, setUser] = useState("");
  const users = [...new Set(s.activity.map((h) => h.user))];
  const rows = useMemo(() => s.activity.filter((h) => (!ent || h.entity === ent) && (!action || h.action === action) && (!user || h.user === user) && (!q || `${h.label} ${h.detail}`.toLowerCase().includes(q.toLowerCase()))), [s.activity, q, ent, action, user]);
  const table = useTable(rows, { size: s.settings.pageSize });
  const page = table.slice(rows);
  const csv = () => download("activity-log.csv", toCsv(rows, [{ label: "time", get: (h) => h.ts }, { label: "user", get: (h) => h.user }, { label: "role", get: (h) => h.role }, { label: "action", get: (h) => h.action }, { label: "item type", get: (h) => h.entity }, { label: "item", get: (h) => h.label }, { label: "detail", get: (h) => h.detail }]));
  return (
    <>
      <PageHeader title={t("nav.activity")} sub={t("act.sub")} actions={<button className="btn" onClick={csv}><Download size={15} aria-hidden /> {t("exportCsv")}</button>} />
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <SearchBox className="min-w-[12rem] flex-1 sm:max-w-sm" value={q} onChange={setQ} placeholder={t("act.search")} />
          <Select aria-label={t("act.entity")} value={ent} onChange={setEnt} placeholder={t("act.entity")} options={["asset", "employee", "location", "vendor", "maintenance", "license", "consumable"].map((e) => [e, t(`ent.${e}`)])} className="!w-auto" />
          <Select aria-label={t("act.action")} value={action} onChange={setAction} placeholder={t("act.action")} options={Object.keys(TONE).map((a) => [a, t(`act.${a}`)])} className="!w-auto" />
          <Select aria-label={t("act.user")} value={user} onChange={setUser} placeholder={t("act.user")} options={users.map((u) => [u, u])} className="!w-auto" />
        </div>
        {rows.length === 0 ? <Empty text={t("act.empty")} /> : (
          <div className="relative overflow-x-auto scroll-thin"><table className="w-full min-w-[520px]">
            <thead className="border-b border-line bg-sunk"><tr><th className="th">{t("act.when")}</th><th className="th">{t("act.action")}</th><th className="th">{t("act.what")}</th><th className="th max-md:hidden">{t("act.detail")}</th><th className="th max-lg:hidden">{t("act.user")}</th></tr></thead>
            <tbody>{page.map((h) => (
              <tr key={h.id} className="border-b border-line last:border-0 hover:bg-sunk">
                <td className="td whitespace-nowrap text-mute">{fmt.dt(h.ts)}</td><td className="td"><Badge tone={TONE[h.action] || "mute"}>{t(`act.${h.action}`)}</Badge></td>
                <td className="td"><span className="font-medium">{h.label || "–"}</span><span className="block text-xs text-mute">{t(`ent.${h.entity}`)}</span></td>
                <td className="td max-md:hidden text-mute">{h.detail}</td><td className="td max-lg:hidden whitespace-nowrap">{h.user}<span className="block text-xs text-mute">{t(`role.${h.role}`)}</span></td>
              </tr>))}</tbody></table></div>
        )}
        {rows.length > 0 && <Pager table={table} total={rows.length} />}
      </div>
    </>
  );
}
