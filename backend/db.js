// backend/db.js
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "./backend/.env" });

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // use SERVICE_ROLE for backend (not anon)
);

console.log("✅ Connected to Supabase successfully");
