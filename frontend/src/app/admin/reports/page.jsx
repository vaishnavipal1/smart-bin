"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { MapPin, Clock, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all reports
  useEffect(() => {
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching reports:", error.message);
      else setReports(data || []);
      setLoading(false);
    };

    fetchReports();
  }, []);

  // ✅ Update report status
// ✅ Update report status
const updateStatus = async (id, newStatus) => {
  const { error } = await supabase
    .from("reports")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Error updating status:", error.message);
  } else {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  }
};


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 font-semibold">
        Loading reports...
      </div>
    );

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 pt-24 pb-12 px-6 flex flex-col items-center"
      >
        <h1 className="text-3xl font-bold text-blue-800 mb-8">
          Citizen Report Summary
        </h1>

        {reports.length === 0 ? (
          <div className="bg-white/70 border border-blue-200 p-8 rounded-2xl shadow-lg max-w-3xl text-center">
            <p className="text-gray-700 font-medium mb-2">
              No citizen reports found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {reports.map((r) => (
              <motion.div
                key={r.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white/80 border border-blue-200 rounded-2xl shadow-md overflow-hidden flex flex-col"
              >
                {r.photo_url ? (
                  <img
                    src={r.photo_url}
                    alt="Report photo"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <ImageIcon size={40} />
                  </div>
                )}

                <div className="p-5 flex flex-col gap-2 flex-grow">
                  <h2 className="text-lg font-semibold text-blue-800 capitalize">
                    {r.issue_type?.replace("_", " ") || "Issue"}
                  </h2>

                  <p className="text-gray-700 text-sm line-clamp-3">
                    {r.description || "No description"}
                  </p>

                  <div className="flex items-center text-gray-600 text-xs mt-2 gap-1">
                    <MapPin size={14} className="text-blue-600" />
                    {r.location || "Unknown location"}
                  </div>

                  <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
                    <Clock size={14} className="text-blue-600" />
                    {new Date(r.created_at).toLocaleString()}
                  </div>

                  {/* ✅ Status section */}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        r.status === "Resolved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {r.status}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateStatus(r.id, "In Progress")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(r.id, "Resolved")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
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
