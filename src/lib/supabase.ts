import { createClient } from "@supabase/supabase-js";

const isServer = typeof window === "undefined";

const supabaseUrl = isServer ? "https://placeholder.supabase.co" : (import.meta.env.VITE_SUPABASE_URL as string);
const supabaseAnonKey = isServer ? "placeholder" : (import.meta.env.VITE_SUPABASE_ANON_KEY as string);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: !isServer, autoRefreshToken: !isServer },
});
