import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: "./backend/.env" });

const router = express.Router();

// ✅ Initialize Supabase client directly (no db.js needed)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // SERVICE ROLE key — not anon
);

// 🟢 SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    // Step 1: Create user in Supabase Auth
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      console.error("❌ Signup error:", signupError.message);
      return res.status(400).json({ error: signupError.message });
    }

    // Step 2: Save user info to citizens table
    const { data: insertData, error: insertError } = await supabase
      .from("citizens")
      .insert([{ full_name, email }])
      .select();

    if (insertError) {
      console.error("❌ Database insert error:", insertError.message);
      return res.status(400).json({
        error: "User signup succeeded, but failed to save in database",
      });
    }

    console.log("✅ New user signed up and saved:", signupData.user);
    return res.status(200).json({
      message: "Signup successful",
      user: signupData.user,
    });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 🔵 LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error.message);
      return res.status(400).json({ error: "Invalid login credentials" });
    }

    console.log("✅ User logged in:", data.user);
    return res
      .status(200)
      .json({ message: "Login successful", user: data.user });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
