import { createClient } from '@supabase/supabase-js';

// Supabase Client (Optional - for future features like realtime, storage, etc.)
// Currently, the app uses direct PostgreSQL connection via DATABASE_URL
// This client can be used for Supabase-specific features in the future

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client only if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Service role client (server-side only, for admin operations)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper to check if Supabase client is available
export const isSupabaseAvailable = () => !!supabase;

