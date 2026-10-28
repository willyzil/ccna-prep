import { createClient } from '@supabase/supabase-js';

// The address and the publishable key are public by design: they ship to every
// visitor. What a signed-in user may read or write is decided by row-level
// security in Postgres (supabase/schema.sql). A build can point elsewhere with
// VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, or leave accounts out
// with VITE_SUPABASE_URL=off.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.velstronltd.com';
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1ZewQsIk-BkGyZdm5dFqhU_v1qLnQxY';

// Email links return their outcome in the hash (#access_token=… or #error=…).
// Keep a copy before the client reads and clears it.
export const linkHash = window.location.hash;

// Implicit flow, so a link opened on another device than the one that asked
// for it (a reset requested on a laptop, opened on a phone) still works.
export const supabase = URL === 'off' ? null : createClient(URL, KEY, {
  auth: { flowType: 'implicit', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
