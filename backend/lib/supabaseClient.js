import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_KEY:", process.env.SUPABASE_SERVICE_KEY ? "Loaded ✅" : "Missing ❌");

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
