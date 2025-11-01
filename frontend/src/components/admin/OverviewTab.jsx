"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StatsGrid from "./StatsGrid";
import RecentActivity from "./RecentActivity";

export default function OverviewTab() {
  const [stats, setStats] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // 🟢 1. Active pickers
      const { data: pickersData, error: pickersError } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "picker");
      const activePickers = (pickersData || []).length;

      // 🟢 2. Total bins = pickers * 10
      const totalBins = activePickers * 10;

      // 🟢 3. Reports resolved today
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data: resolvedTodayData } = await supabase
        .from("reports")
        .select("id")
        .eq("status", "Resolved")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString());

      const clearedToday = (resolvedTodayData || []).length;

      // 🟢 4. Pending complaints
      const { data: pendingData } = await supabase
        .from("reports")
        .select("id")
        .neq("status", "Resolved")
        .neq("status", "In Progress");

      const pendingComplaints = (pendingData || []).length;

      // 🟢 5. Success Rate
      let successRate = 0;
      if (activePickers > 0) {
        const expectedBins = activePickers * 10;
        successRate = Math.round((clearedToday / expectedBins) * 100);
        if (successRate > 100) successRate = 100;
      }

      // 🟢 6. Recent activity
      const { data: recent } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({ totalBins, activePickers, clearedToday, pendingComplaints, successRate });
      setReports(recent || []);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-blue-700 font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>
      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentActivity reports={reports} />
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Live Map</h3>
          <p className="text-gray-600 mb-4">
            Interactive map (placeholder). Click below to open map view.
          </p>
          <div className="flex gap-3">
            <a
              href="/admin/map"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              View Map
            </a>
            <a
              href="/admin/reports"
              className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700"
            >
              Open Reports
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
