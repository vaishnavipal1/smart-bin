/*"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";

export default function CitizenSignup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ AUTO SIGN OUT if a user is already logged in (Option 1)
  useEffect(() => {
    const resetForNewSignup = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("👋 Existing user detected:", user.email, "→ Signing out...");
        await supabase.auth.signOut();
      }
    };

    resetForNewSignup();
  }, []);

  // ✅ Save user to Supabase table only
  const saveUserToSupabase = async (user) => {
    try {
      const { error: dbError } = await supabase
        .from("citizens")
        .upsert(
          [
            {
              full_name: user.user_metadata?.full_name || user.fullName,
              email: user.email,
            },
          ],
          { onConflict: "email" } // ✅ Prevents duplicate key error
        );

      if (dbError) throw new Error(dbError.message);

      console.log("✅ User saved in Supabase citizens table");
      return true;
    } catch (err) {
      console.error("DB Save Error:", err.message);
      setErrorMsg("Database save failed. Please try again.");
      return false;
    }
  };

  // ✅ Email/password signup
  // ✅ Create admin user and link it properly
const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    // 1️⃣ Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    const user = authData?.user;
    if (!user) throw new Error("User signup failed");

    // 2️⃣ Insert into profiles (NOT directly admins)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          email: user.email,
          role: "admin",
        },
      ]);

    if (profileError) throw profileError;

    // 3️⃣ (Optional) If you have an "admins" table separately:
    // const { error: adminError } = await supabase
    //   .from("admins")
    //   .insert([{ id: user.id, name }]);
    // if (adminError) throw adminError;

    alert("✅ Admin signup successful! Please check your email to verify.");
    router.push("/admin/login");
  } catch (err) {
    console.error("Signup Error:", err.message);
    setErrorMsg("❌ " + err.message);
  } finally {
    setLoading(false);
  }
};

  // ✅ Google signup
  const handleGoogleSignup = async () => {
    setErrorMsg("");
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/citizen/signup",
        },
      });

      if (error) throw new Error(error.message);
      console.log("🌐 Redirecting to Google OAuth...");
    } catch (err) {
      console.error("Google Signup Error:", err);
      setErrorMsg(err.message || "Google signup failed.");
      setOauthLoading(false);
    }
  };

  // ✅ Detect Google callback (after OAuth redirect)
  useEffect(() => {
    const checkUserAfterGoogleAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("✅ Google auth success:", user.email);
        const saved = await saveUserToSupabase(user);
        if (saved) {
          router.push("/citizen/report");
        }
      }
    };
    checkUserAfterGoogleAuth();
  }, [router]);

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
            Citizen Signup
          </h1>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

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

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold text-white rounded-lg shadow-md ${
                  loading
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                }`}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-4">
            <hr className="w-full border-gray-200" />
            <span className="text-gray-500 text-sm">or</span>
            <hr className="w-full border-gray-200" />
          </div>

          {/* Google Button *
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              type="button"
              onClick={handleGoogleSignup}
              disabled={oauthLoading}
              className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-white rounded-lg shadow-md bg-red-600 hover:bg-red-700"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.8-1.5-35-4.4-51.6H272v97.7h147.1c-6.4 34.7-25.6 64.1-54.6 83.7v69.7h88.2c51.6-47.5 81.8-117.6 81.8-199.5z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-88.2-69.7c-24.5 16.4-55.8 26.1-92.5 26.1-71.1 0-131.4-48-153-112.2H32.7v70.6C77.9 486.8 169.4 544.3 272 544.3z"
                />
                <path
                  fill="#FBBC05"
                  d="M119 328.4c-13.8-41.2-13.8-85.7 0-126.9V130.9H32.7c-44.4 88.9-44.4 192.9 0 281.8L119 328.4z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.2c39.9-.6 78.3 14.1 107.5 40.6l80.5-80.5C397.5 21.3 336 0 272 0 169.4 0 77.9 57.5 32.7 130.9l86.3 70.6C140.6 155.2 200.9 107.2 272 107.2z"
                />
              </svg>
              {oauthLoading ? "Opening Google..." : "Continue with Google"}
            </Button>
          </motion.div>

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
*/
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";

export default function CitizenSignup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🧹 Ensure no existing session before new signup
  useEffect(() => {
    const clearExistingSession = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        console.log("🔒 Signing out old session...");
        await supabase.auth.signOut();
      }
    };
    clearExistingSession();
  }, []);

  // 🗂 Save citizen details into Supabase table
  const saveCitizen = async (user) => {
    try {
      const { error } = await supabase
        .from("citizens")
        .upsert(
          [
            {
              full_name: fullName || user.user_metadata?.full_name || "",
              email: user.email,
            },
          ],
          { onConflict: "email" }
        );

      if (error) throw error;
      console.log("✅ Citizen info saved to 'citizens' table");
      return true;
    } catch (err) {
      console.error("DB Error:", err.message);
      setErrorMsg("Database save failed. Please try again.");
      return false;
    }
  };

  // ✉️ Handle email/password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("Signup failed. Please try again.");

      await saveCitizen(user);

      alert("✅ Signup successful! Please verify your email before logging in.");
      router.push("/citizen/login");
    } catch (err) {
      console.error("Signup Error:", err);
      setErrorMsg(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Handle Google signup
  const handleGoogleSignup = async () => {
    setErrorMsg("");
    setOauthLoading(true);

    const redirectUrl =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/citizen/report`;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google Signup Error:", err);
      setErrorMsg(err.message || "Google signup failed.");
      setOauthLoading(false);
    }
  };

  // ✅ Detect post-Google signup redirect
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        console.log("✅ Google signup success:", user.email);
        const saved = await saveCitizen(user);
        if (saved) router.push("/citizen/report");
      }
    };
    handleGoogleCallback();
  }, [router]);

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
            Citizen Signup
          </h1>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

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

            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold text-white rounded-lg shadow-md ${
                  loading
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                }`}
              >
                {loading ? "Signing up..." : "Sign Up"}
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
              onClick={handleGoogleSignup}
              disabled={oauthLoading}
              className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-white rounded-lg shadow-md bg-red-600 hover:bg-red-700"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.8-1.5-35-4.4-51.6H272v97.7h147.1c-6.4 34.7-25.6 64.1-54.6 83.7v69.7h88.2c51.6-47.5 81.8-117.6 81.8-199.5z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c73.6 0 135.5-24.3 180.7-66.1l-88.2-69.7c-24.5 16.4-55.8 26.1-92.5 26.1-71.1 0-131.4-48-153-112.2H32.7v70.6C77.9 486.8 169.4 544.3 272 544.3z"
                />
                <path
                  fill="#FBBC05"
                  d="M119 328.4c-13.8-41.2-13.8-85.7 0-126.9V130.9H32.7c-44.4 88.9-44.4 192.9 0 281.8L119 328.4z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.2c39.9-.6 78.3 14.1 107.5 40.6l80.5-80.5C397.5 21.3 336 0 272 0 169.4 0 77.9 57.5 32.7 130.9l86.3 70.6C140.6 155.2 200.9 107.2 272 107.2z"
                />
              </svg>
              {oauthLoading ? "Opening Google..." : "Continue with Google"}
            </Button>
          </motion.div>

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
