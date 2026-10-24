"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Select } from "./ui";

// Live mode only: list of accounts with their role. An admin can change roles.
export default function UsersAdmin() {
  const { t, can, toast, profile } = useApp();
  const [rows, setRows] = useState([]);
  const load = async () => { const { data } = await supabase.from("profiles").select("*").order("name"); setRows(data || []); };
  useEffect(() => { load(); }, []);
  async function change(id, role) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) toast(error.message, "bad"); else { toast(t("users.saved")); load(); }
  }
  return (
    <section className="card p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{t("users.title")}</h2>
      <p className="mb-3 mt-1 text-xs text-mute">{t("users.sub")}</p>
      <ul className="divide-y divide-line">
        {rows.map((u) => (
          <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0 truncate">{u.name || "–"}{u.id === profile?.id && <span className="ml-2 text-xs text-mute">({t("users.you")})</span>}</span>
            <div className="w-40 shrink-0"><Select aria-label={`${t("users.role")} ${u.name}`} value={u.role} disabled={!can("admin") || u.id === profile?.id} onChange={(v) => change(u.id, v)} options={["admin", "technician", "viewer"].map((r) => [r, t(`role.${r}`)])} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
