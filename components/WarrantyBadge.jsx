"use client";
import { useApp } from "@/lib/store";
import { warrantyState } from "@/lib/utils";
import { Badge } from "./ui";

export default function WarrantyBadge({ asset }) {
  const { s, fmt } = useApp();
  const w = warrantyState(asset, s.settings.warrantyAlertDays);
  if (w === "none") return <span className="text-mute">–</span>;
  return <Badge tone={{ expired: "bad", soon: "warn", ok: "ok" }[w]}>{fmt.date(asset.warrantyEnd)}</Badge>;
}
