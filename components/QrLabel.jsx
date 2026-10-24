"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

// QR code that points to the asset page (works when scanned with a phone on the same network or the live site)
export function useQr(text, width = 160) {
  const [src, setSrc] = useState("");
  useEffect(() => { let off = false; QRCode.toDataURL(text, { margin: 1, width, color: { dark: "#000000", light: "#ffffff" } }).then((u) => !off && setSrc(u)).catch(() => {}); return () => { off = true; }; }, [text, width]);
  return src;
}

export default function QrLabel({ asset, company, size = 120, className = "" }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/assets/${asset.id}` : asset.tag;
  const src = useQr(url, size * 2);
  return (
    <div className={`label-card flex items-center gap-3 rounded-md border border-line bg-white p-3 text-black ${className}`}>
      {src ? <img src={src} width={size} height={size} alt={`QR ${asset.tag}`} /> : <div style={{ width: size, height: size }} />}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-neutral-500">{company}</p>
        <p className="font-mono text-lg font-bold leading-tight">{asset.tag}</p>
        <p className="mt-0.5 line-clamp-2 text-xs">{asset.name}</p>
        {asset.serial && <p className="mt-1 font-mono text-[10px] text-neutral-600">SN {asset.serial}</p>}
      </div>
    </div>
  );
}
