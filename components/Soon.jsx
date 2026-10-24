"use client";
import { useApp } from "@/lib/store";
import { PageHeader } from "./ui";

// Placeholder for pages that are planned but not built yet (see docs/TODO.md)
export default function Soon({ k }) {
  const { t } = useApp();
  return (
    <>
      <PageHeader title={t(k)} />
      <div className="card p-8 text-center text-sm text-mute">{t("soon")}</div>
    </>
  );
}
