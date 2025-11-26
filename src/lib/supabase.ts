import { createClient } from '@supabase/supabase-js'

// Usa variáveis de ambiente quando disponíveis; caso contrário, cai no Supabase local com chave válida
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Use untyped client to avoid TS schema mismatches across environments
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
})
