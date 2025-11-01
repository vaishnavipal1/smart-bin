import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// 🔑 Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ✅ Save or update user route
app.post("/api/save-user", async (req, res) => {
  const { fullName, email } = req.body;
  console.log("📥 Incoming:", req.body);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from("citizens")
      .upsert(
        [
          {
            full_name: fullName,
            email: email,
          },
        ],
        { onConflict: "email" } // 👈 ensures no duplicate key error
      );

    if (error) throw error;

    console.log("✅ User saved or updated:", data);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("DB Save Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start server
app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
