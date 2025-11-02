"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Clock, Image as ImageIcon, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const user = userData?.user;
    if (!user) {
      alert("Please log in to view reports.");
      return;
    }

    // 🔹 Get user's role from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    let reportsQuery = supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    // 🔹 If not admin, filter by user_id
    if (profileData?.role !== "admin") {
      reportsQuery = reportsQuery.eq("user_id", user.id);
    }

    const { data: reportsData, error: reportsError } = await reportsQuery;

    if (reportsError) throw reportsError;
    setReports(reportsData || []);
  } catch (err) {
    console.error("Error fetching reports:", err.message);
  } finally {
    setLoading(false);
  }
};

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-green-700 font-semibold">
        Loading your reports...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 pt-24 pb-12 px-6 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl flex justify-between items-center mb-8"
        >
          <h1 className="text-3xl font-bold text-green-800">
            My Submitted Reports
          </h1>
          <Link href="/reports">
            <Button className="bg-green-700 hover:bg-green-800">
              + New Report
            </Button>
          </Link>
        </motion.div>

        {reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/70 border border-green-200 p-8 rounded-2xl shadow-lg max-w-3xl text-center"
          >
            <AlertCircle className="mx-auto mb-3 text-green-700" size={40} />
            <p className="text-gray-700 font-medium mb-2">
              No reports submitted yet.
            </p>
            <Link href="/citizen/report">
              <Button className="bg-green-600 hover:bg-green-700">
                Submit a Report
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {reports.map((r) => (
  <motion.div
    key={r.id}
    whileHover={{ scale: 1.03 }}
    className="bg-white/80 border border-green-200 rounded-2xl shadow-md overflow-hidden flex flex-col"
  >
    {r.photo_url ? (
      <img
        src={r.photo_url}
        alt="Report photo"
        className="h-40 w-full object-cover"
      />
    ) : (
      <div className="h-40 w-full bg-green-50 flex items-center justify-center text-green-600">
        <ImageIcon size={40} />
      </div>
    )}

    <div className="p-5 flex flex-col gap-2 flex-grow">
      <h2 className="text-lg font-semibold text-green-800 capitalize">
        {r.issue_type.replace("_", " ")}
      </h2>

      <p className="text-gray-700 text-sm line-clamp-3">
        {r.description}
      </p>

      <div className="flex items-center text-gray-600 text-xs mt-2 gap-1">
        <MapPin size={14} className="text-green-600" />
        {r.location || "Unknown location"}
      </div>

      <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
        <Clock size={14} className="text-green-600" />
        {new Date(r.created_at).toLocaleString()}
      </div>

      {/* 🟢 Status section */}
      <div className="mt-3">
        <span className="text-sm font-semibold text-green-800">Status: </span>
        <span
          className={`text-sm px-2 py-1 rounded-full ${
            r.status === "Resolved"
              ? "bg-green-100 text-green-700"
              : r.status === "In Progress"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {r.status || "Pending"}
        </span>
      </div>

      {/* 🟡 Admin notes (optional) */}
      {r.admin_notes && (
        <div className="mt-2 text-sm text-gray-700 bg-green-50 p-2 rounded-md">
          <strong>Admin Remarks:</strong> {r.admin_notes}
        </div>
      )}
    </div>
  </motion.div>
))}

          </div>
        )}
      </motion.main>

      <Footer />
    </>
  );
}
