"use client";
import { useEffect, useState } from "react";
// Reads one value from the address once in the browser (avoids useSearchParams, which needs Suspense)
export function useQueryParam(name) {
  const [v, setV] = useState(null);
  useEffect(() => { setV(new URLSearchParams(window.location.search).get(name)); }, [name]);
  return v;
}
export function useStored(key, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => { try { const x = localStorage.getItem(key); if (x) setV(JSON.parse(x)); } catch { /* ignore */ } }, [key]);
  const set = (n) => { setV(n); try { localStorage.setItem(key, JSON.stringify(n)); } catch { /* ignore */ } };
  return [v, set];
}
