"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, ArrowLeft, CheckCircle, History } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ReportIssue() {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      // ✅ Get current logged-in user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
if (sessionError) {
  console.error("Session error:", sessionError.message);
  alert("Error fetching user session.");
  return;
}

const user = sessionData?.session?.user;
console.log("Current User:", user);

if (!user) {
  alert("⚠️ You must be logged in to report an issue!");
  return;
}


      let photoUrl = null;

      // ✅ If photo selected, upload to Supabase Storage bucket
      if (photo) {
        const fileName = `${user.id}_${Date.now()}_${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("report-photos")
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("report-photos")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      const { data: authSession } = await supabase.auth.getSession();
console.log("🔐 Auth session:", authSession);

      // ✅ Insert report in Supabase
      const { error: insertError } = await supabase.from("reports").insert([
        {
          user_id: user.id,
          issue_type: issueType,
          description,
          photo_url: photoUrl,
          bin_id: "BIN-DEMO123",
          ward: "Ward 25",
          location: "Sector 15, Market Road, Noida",
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setIssueType("");
      setDescription("");
      setPhoto(null);
    } catch (error) {
      console.error("Report Error:", error.message);
      alert("❌ Failed to submit complaint. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex flex-col items-center pt-24 pb-12 px-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl flex items-center justify-between mb-6"
        >
          <Link href="/citizen/signup">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center text-green-800 font-medium hover:underline"
            >
              <ArrowLeft className="mr-1" size={18} /> Back
            </motion.div>
          </Link>

          {/* ✅ View History Button */}
          <Link href="/citizen/report/history">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-green-700 text-green-800 hover:bg-green-700 hover:text-white transition"
              >
                <History size={18} /> View History
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-green-200 p-8"
        >
          <h1 className="text-3xl font-bold text-green-800 mb-2 text-center">
            Report an Issue
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Help us keep your city clean 🌿
          </p>

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800 flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle size={18} /> Complaint submitted successfully!
            </motion.div>
          )}

          {/* Dustbin Info */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-green-200 bg-green-50 rounded-xl p-5 mb-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3 text-green-800">
              <MapPin size={20} />
              <h2 className="text-lg font-semibold">Dustbin Location</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-sm">
              <p>
                <span className="font-semibold">Bin ID:</span>{" "}
                <span className="bg-green-100 px-2 py-0.5 rounded-md text-green-800 font-medium">
                  BIN-DEMO123
                </span>
              </p>
              <p>
                <span className="font-semibold">Ward:</span>{" "}
                <span className="text-green-800 font-medium">Ward 25</span>
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold">Location:</span> Sector 15,
                Market Road, Noida
              </p>
            </div>
          </motion.div>

          {/* Complaint Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                <option value="">Select issue type</option>
                <option value="overflowing">Overflowing Dustbin</option>
                <option value="damaged">Damaged Lid or Body</option>
                <option value="missing">Missing Dustbin</option>
                <option value="not_collected">Garbage Not Collected</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Please describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Upload Photo (Optional)
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-green-300 rounded-xl p-5 text-center bg-green-50 hover:bg-green-100 cursor-pointer transition"
              >
                <Upload className="mx-auto text-green-500 mb-2" size={30} />
                <p className="text-sm text-gray-600 mb-2">
                  Upload evidence photo
                </p>
                <input
                  type="file"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="block mx-auto text-sm"
                />
                {photo && (
                  <p className="mt-2 text-xs text-green-700">
                    📸 {photo.name} selected
                  </p>
                )}
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.03 }}>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3 font-semibold rounded-lg bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white shadow-md"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.main>
      <Footer />
    </>
  );
}
