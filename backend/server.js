// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";  // ✅ Import routes

dotenv.config({ path: path.resolve(".env") });  // ✅ Fixed path
console.log("✅ Loaded .env from:", path.resolve(".env"));
console.log("✅ SUPABASE_URL:", process.env.SUPABASE_URL);

const app = express();

// ✅ Allow frontend to connect
app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);

app.use(express.json());

// ✅ All routes start with /api
app.use("/api", authRoutes);

// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🚀 Backend server is running fine!");
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
