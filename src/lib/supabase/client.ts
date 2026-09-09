import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://qkrhwhqrktateueqozdf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_hSHIKp-ToLtiz8MifwrtwA_AVSoIHy2';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('sua-url') &&
    supabaseAnonKey.length > 20
  );
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    // Retorna cliente mock ou fallback seguro
    return null;
  }
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export const supabase = isSupabaseConfigured()
  ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
  : null;
