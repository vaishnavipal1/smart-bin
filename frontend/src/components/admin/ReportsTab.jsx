"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) console.error("Error fetching reports:", error.message);
      else setReports(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-800 mb-4">All Reports</h2>
      {loading ? <p>Loading reports...</p> : reports.length === 0 ? <p>No reports found.</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((r) => (
            <div key={r.id} className="bg-white/90 border border-blue-100 rounded-2xl overflow-hidden shadow-md flex flex-col">
              { (r.photo_url || r.image_url) ? (
                <img src={r.photo_url || r.image_url} alt="photo" className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <ImageIcon size={36} />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2 flex-grow">
                <div className="font-semibold text-blue-800">{(r.issue_type || "Issue").replace(/_/g, " ")}</div>
                <div className="text-sm text-gray-700 line-clamp-3">{r.description || "No description"}</div>
                <div className="flex items-center text-xs text-gray-500 gap-2 mt-2">
                  <MapPin size={14} /> <span>{r.location || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500"><Clock size={12} /> {new Date(r.created_at).toLocaleString()}</div>
                  <Link href={`/admin/reports/${r.id}`}>
                    <Button size="sm" className="bg-blue-600 text-white">View</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
