import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname), // ✅ makes it absolute automatically
  },
  distDir: ".next", // ✅ ensures Next.js builds inside this project
};

export default nextConfig;
