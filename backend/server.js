// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"; // ✅ make sure this path exists

dotenv.config({ path: "./backend/.env" });

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
