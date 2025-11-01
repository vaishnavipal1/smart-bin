"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient"; // ✅ import Supabase client

export default function CitizenSignup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // ✅ Signup directly using Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      alert("✅ Signup successful! Check your email for verification.");
      router.push("/citizen/login");
    } catch (err) {
      setErrorMsg(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-blue-300 px-6 pt-24"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl max-w-md w-full border border-blue-200"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-6 text-blue-800"
          >
            Citizen Sign Up
          </motion.h1>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-red-600 text-sm text-center">{errorMsg}</p>
            )}

            <motion.div whileHover={{ scale: 1.03 }}>
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-md"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </motion.div>
          </form>

          <p className="text-sm text-gray-600 mt-4 text-center">
            Already have an account?{" "}
            <Link
              href="/citizen/login"
              className="text-blue-700 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.main>

      <Footer />
    </>
  );
}


