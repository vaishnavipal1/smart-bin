"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function PickerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else router.push("/picker/dashboard");

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) alert(error.message);
    setOauthLoading(false);
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 px-6 pt-24 pb-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-blue-200"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
            Picker Login
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold text-white rounded-lg shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>
          </form>

          <div className="flex items-center justify-center gap-3 my-4">
            <hr className="w-full border-gray-200" />
            <span className="text-gray-500 text-sm">or</span>
            <hr className="w-full border-gray-200" />
          </div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading}
              className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-white rounded-lg shadow-md bg-red-600 hover:bg-red-700"
            >
              {/* ✅ Tiny Google G Icon (same as Citizen) */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#4285F4" d="M533.5 278.4c0-17.8-1.5-35-4.4-51.6H272v97.7h147.1c-6.4 34.7-25.6 64.1-54.6 83.7v69.7h88.2c51.6-47.5 81.8-117.6 81.8-199.5z"/>
                <path fill="#34A853" d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-88.2-69.7c-24.5 16.4-55.8 26.1-92.5 26.1-71.1 0-131.4-48-153-112.2H32.7v70.6C77.9 486.8 169.4 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M119 328.4c-13.8-41.2-13.8-85.7 0-126.9V130.9H32.7c-44.4 88.9-44.4 192.9 0 281.8L119 328.4z"/>
                <path fill="#EA4335" d="M272 107.2c39.9-.6 78.3 14.1 107.5 40.6l80.5-80.5C397.5 21.3 336 0 272 0 169.4 0 77.9 57.5 32.7 130.9l86.3 70.6C140.6 155.2 200.9 107.2 272 107.2z"/>
              </svg>
              {oauthLoading ? "Opening Google..." : "Continue with Google"}
            </Button>
          </motion.div>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Don’t have an account?{" "}
            <a href="/picker/signup" className="text-blue-700 font-medium hover:underline">
              Sign Up
            </a>
          </p>
        </motion.div>
      </motion.main>

      <Footer />
    </>
  );
}
