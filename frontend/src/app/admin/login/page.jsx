"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyMode, setVerifyMode] = useState(false);

  // ✅ Redirect if already logged in and has admin role
  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        console.log("⚠️ No user session found.");
        return;
      }

      console.log("🟢 Found user:", user.email);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
        return;
      }
      

      if (profile?.role === "admin") {
        console.log("✅ Admin verified, redirecting...");
        router.push("/admin/dashboard");
      } else {
        console.log("⚠️ Not an admin or profile missing, staying on login.");
        await supabase.auth.signOut(); // Prevent unauthorized session
      }
    };

    checkSession();

    // 🔁 Re-check when auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" && session?.user) {
        checkSession();
      } else if (event === "SIGNED_OUT") {
        setEmail("");
        setPassword("");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  // 🔐 Handle Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData?.user;
      if (!user) throw new Error("Login failed. Please try again.");

      if (!user.email_confirmed_at) {
        setVerifyMode(true);
        setMessage("⚠️ Please verify your email before logging in.");
        await supabase.auth.signOut();
        return;
      }

      // 🧠 Verify role from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile || profile.role !== "admin") {
        setMessage("❌ Access denied. You are not an admin.");
        await supabase.auth.signOut();
        return;
      }

      setMessage("✅ Login successful! Redirecting...");
      router.push("/admin/dashboard");
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Resend Verification Email
  const resendVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin/login` },
      });
      if (error) throw error;
      setMessage("📩 Verification link sent! Check your inbox.");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  // 🌐 Google Login (optional for admin)
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      setMessage("❌ Google sign-in failed: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 px-6 pt-24 pb-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-blue-200"
        >
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">
            {verifyMode ? "Verify Your Email" : "Admin Login"}
          </h1>

          {verifyMode ? (
            <div className="text-center space-y-4">
              <p className="text-gray-700">
                A verification link has been sent to <b>{email}</b>. Please check your inbox and verify.
              </p>
              <Button
                onClick={resendVerification}
                className="w-full py-3 font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                Resend Verification Link
              </Button>
              <p
                onClick={() => setVerifyMode(false)}
                className="text-blue-700 hover:underline cursor-pointer text-sm mt-3"
              >
                ← Back to Login
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {message && (
                  <p
                    className={`text-sm text-center mt-2 ${
                      message.startsWith("❌")
                        ? "text-red-600"
                        : message.startsWith("⚠️")
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 mt-2 font-semibold text-white rounded-lg shadow-md transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>

              {/* Optional Google login */}
              <div className="flex items-center justify-center gap-3 my-4">
                <hr className="w-full border-gray-200" />
                <span className="text-gray-500 text-sm">or</span>
                <hr className="w-full border-gray-200" />
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-white rounded-lg shadow-md bg-red-600 hover:bg-red-700"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 533.5 544.3"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M533.5 278.4c0-17.8-1.5-35-4.4-51.6H272v97.7h147.1c-6.4 34.7-25.6 64.1-54.6 83.7v69.7h88.2
                    c51.6-47.5 81.8-117.6 81.8-199.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-88.2-69.7c-24.5 16.4-55.8 26.1-92.5 26.1
                    -71.1 0-131.4-48-153-112.2H32.7v70.6
                    C77.9 486.8 169.4 544.3 272 544.3z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M119 328.4c-13.8-41.2-13.8-85.7 0-126.9V130.9H32.7
                    c-44.4 88.9-44.4 192.9 0 281.8L119 328.4z"
                  />
                  <path
                    fill="#EA4335"
                    d="M272 107.2c39.9-.6 78.3 14.1 107.5 40.6l80.5-80.5
                    C397.5 21.3 336 0 272 0
                    169.4 0 77.9 57.5 32.7 130.9l86.3 70.6
                    C140.6 155.2 200.9 107.2 272 107.2z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Commented out since you have no signup yet */}
              {/* <p className="text-sm text-gray-600 mt-4 text-center">
                New admin?{" "}
                <Link href="/admin/signup" className="text-blue-700 font-medium hover:underline">
                  Sign Up
                </Link>
              </p> */}
            </>
          )}
        </motion.div>
      </motion.main>
      <Footer />
    </>
  );
}
