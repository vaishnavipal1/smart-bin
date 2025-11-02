// lib/supabaseAdmin.js
import { createClient } from "@supabase/supabase-js";

// These env vars should be in your .env.local (server-only, not NEXT_PUBLIC)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ⚠️ Never expose to client

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});
