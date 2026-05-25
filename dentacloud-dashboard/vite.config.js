import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly load .env from the package root (dentacloud-dashboard/)
  // so Vite CLI and framework-agnostic tooling always see the keys.
  const env = loadEnv(mode, path.resolve(__dirname), '')

  const urlOk  = !!env.VITE_SUPABASE_URL
  const keyOk  = !!env.VITE_SUPABASE_ANON_KEY

  if (!urlOk || !keyOk) {
    console.error(
      `[vite] Build env check (mode=${mode}, cwd=${process.cwd()}) —\n` +
      `  VITE_SUPABASE_URL   : ${urlOk  ? 'OK' : 'MISSING'}\n` +
      `  VITE_SUPABASE_ANON_KEY: ${keyOk ? 'OK' : 'MISSING'}\n` +
      '  → Set them in dentacloud-dashboard/.env\n' +
      '  → Or add them in Vercel Dashboard → Environment Variables.'
    )
  }

  return {
    plugins: [react()],
  }
})
