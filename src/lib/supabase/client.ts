import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const REAL_SUPABASE_URL = 'https://qkrhwhqrktateueqozdf.supabase.co';
const REAL_SUPABASE_ANON_KEY = 'sb_publishable_hSHIKp-ToLtiz8MifwrtwA_AVSoIHy2';

function resolveSupabaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (env && env.startsWith('http') && !env.includes('seu-id') && !env.includes('sua-url') && !env.includes('exemplo')) {
    return env;
  }
  return REAL_SUPABASE_URL;
}

function resolveSupabaseAnonKey(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (env && !env.includes('sua-chave') && env.length > 25) {
    return env;
  }
  return REAL_SUPABASE_ANON_KEY;
}

export const supabaseUrl = resolveSupabaseUrl();
export const supabaseAnonKey = resolveSupabaseAnonKey();

export function isSupabaseConfigured(): boolean {
  return true;
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
