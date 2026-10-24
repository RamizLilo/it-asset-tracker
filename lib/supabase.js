import { createClient } from "@supabase/supabase-js";

// Live mode is on only when both values are set (in .env.local or in the Vercel project settings).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const LIVE = Boolean(url && key);
export const supabase = LIVE ? createClient(url, key) : null;
