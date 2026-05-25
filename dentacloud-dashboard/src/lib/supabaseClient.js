// ── Supabase client — single source of truth ────────────────────────────────
// Every module in this app MUST import the `supabase` singleton from
// this file instead of calling `createClient` independently.
// Environment variables are loaded by Vite at build time; a missing or
// incorrect variable results in a hard server error so the misconfiguration
// is caught immediately instead of producing a vague SDK error at runtime.

import { createClient } from '@supabase/supabase-js'

// Vite injects `import.meta.env` variables at build / dev-server time.
// The `VITE_` prefix is required for Vite to expose them to the browser.
const rawUrl  = import.meta.env.VITE_SUPABASE_URL
const rawKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

// Detect environment for diagnostics
const isDev  = import.meta.env?.DEV    ?? false
const isProd = import.meta.env?.PROD   ?? false
const mode   = import.meta.env?.MODE   ?? 'unknown'

console.log('[supabaseClient] Environment diagnostics:', {
  VITE_SUPABASE_URL:             rawUrl ?? 'UNDEFINED',
  VITE_SUPABASE_ANON_KEY_present: !!rawKey,
  VITE_SUPABASE_ANON_KEY_prefix:  rawKey ? String(rawKey).slice(0, 12) + '...' : 'UNDEFINED',
  DEV: isDev,
  PROD: isProd,
  MODE: mode,
})

// Hard error on missing URL — this prevents the Supabase SDK from accepting
// an invalid first argument and throwing a non-descriptive network error.
if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
  throw new Error(
    '[supabaseClient] VITE_SUPABASE_URL is not set.\n' +
    '  → Add it to  dentacloud-dashboard/.env\n' +
    '  → Variable name: VITE_SUPABASE_URL\n' +
    '  → Value:       https://<your-project>.supabase.co\n' +
    '  → Or set it in Vercel Dashboard → Environment Variables (name must start with VITE_)\n' +
    `  → Current mode: ${mode}`
  )
}

// Hard error on missing key — this is the guard that prevents the SDK
// "supabaseKey is required" crash at SupabaseClient.ts:285.
if (!rawKey || typeof rawKey !== 'string' || rawKey.trim() === '') {
  throw new Error(
    '[supabaseClient] VITE_SUPABASE_ANON_KEY is not set.\n' +
    '  → Add it to  dentacloud-dashboard/.env\n' +
    '  → Variable name: VITE_SUPABASE_ANON_KEY\n' +
    '  → Value:       <your-anon-public-key> (supabase.co → Project Settings → API)\n' +
    '  → Or set it in Vercel Dashboard → Environment Variables (name must start with VITE_)\n' +
    `  → Current mode: ${mode}`
  )
}

// Singleton — created once and shared by all importing modules
export const supabase = createClient(rawUrl.trim(), rawKey.trim())

export default supabase
