import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClient) return serverClient;

  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  serverClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return serverClient;
}

