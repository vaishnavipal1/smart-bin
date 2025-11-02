/*"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiUsers, FiTrendingUp, FiClipboard, FiMapPin } from "react-icons/fi";

/**
 * Admin Dashboard page
 * Route: /admin/dashboard
 *
 * Requirements implemented:
 * - Top stat cards (Total Bins, Active Pickers, Collections Today, Pending Complaints)
 * - Tab navigation (Overview / Bin Management / Waste Pickers / Complaints / Reports)
 * - Recent complaints widget (with status badges and simple action buttons)
 * - Uses Supabase tables: profiles, picker_daily_stats, collections, reports
 *
 * NOTE: adjust any column/table names if yours differ slightly.
 *

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // stats
  const [totalBins, setTotalBins] = useState(0);
  const [activePickers, setActivePickers] = useState(0);
  const [collectionsToday, setCollectionsToday] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  // lists
  const [recentReports, setRecentReports] = useState([]);
  const [pickersList, setPickersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  // UI
  const [activeTab, setActiveTab] = useState("overview");

  // helper to build today's range in ISO (UTC-safe)
  const todaysRange = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  // verify admin user
  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user || null;
      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error || !profile || profile.role !== "admin") {
        alert("Access denied. Admins only!");
        router.push("/"); // redirect somewhere safer
        return;
      }

      if (mounted) setLoading(false);
    };

    verify();
    return () => {
      mounted = false;
    };
  }, [router]);

  // fetch stats + lists
  useEffect(() => {
    if (loading) return; // wait for auth check

    let cancelled = false;

    const load = async () => {
      try {
        // 1) Total pickers (profiles.role = 'picker')
        const { data: pickers, error: pickersErr } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          
          .ilike("role", "picker")


        if (pickersErr) throw pickersErr;

        const numPickers = (pickers && pickers.length) || 0;
        // total bins defined as pickers * 10
        const totalBinsCalc = numPickers * 10;

        // 2) Active pickers today (present in picker_daily_stats for today)
        const { data: activeRows, error: activeErr } = await supabase
          .from("picker_daily_stats")
          .select("picker_id")
          .gte("day", todaysRange.start)
          .lte("day", todaysRange.end);

        if (activeErr) throw activeErr;

        const activePickersSet = new Set(
          (activeRows || []).map((r) => r.picker_id)
        );
        const activePickersCount = activePickersSet.size;

        // 3) Collections today: sum bins_collected from picker_daily_stats today
        const { data: binsRows, error: binsErr } = await supabase
          .from("picker_daily_stats")
          .select("bins_collected")
          .gte("day", todaysRange.start)
          .lte("day", todaysRange.end);

        if (binsErr) throw binsErr;
        const collectionsSum = (binsRows || []).reduce(
          (s, r) => s + (Number(r.bins_collected) || 0),
          0
        );

        // 4) Pending complaints
        const { data: pendingRows, error: pendingErr } = await supabase
          .from("reports")
          .select("id")
          .eq("status", "pending");

        if (pendingErr) throw pendingErr;
        const pendingCount = (pendingRows || []).length;

        // 5) Recent reports (for Recent Activity)
        const { data: recent, error: recentErr } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (recentErr) throw recentErr;

        // 6) Full reports list (for Reports tab)
        const { data: allReports, error: allReportsErr } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (allReportsErr) throw allReportsErr;

        // 7) Pickers list for Waste Pickers tab (simplest: from profiles)
        const pickersLite = pickers.map((p) => ({
          id: p.id,
          email: p.email,
          name: p.name || p.email,
        }));

        if (!cancelled) {
          setTotalBins(totalBinsCalc);
          setActivePickers(activePickersCount);
          setCollectionsToday(collectionsSum);
          setPendingComplaints(pendingCount);
          setRecentReports(recent || []);
          setReportsList(allReports || []);
          setPickersList(pickersLite || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        alert("Failed to load dashboard data. See console for details.");
      }
    };

    load();

    // optional: refresh every 20s
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loading, todaysRange.start, todaysRange.end]);

  // small helper for status badge classes
  const statusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status.toLowerCase() === "resolved")
      return "bg-green-100 text-green-700";
    if (status.toLowerCase() === "in progress" || status.toLowerCase() === "assigned")
      return "bg-yellow-100 text-yellow-700";
    if (status.toLowerCase() === "pending") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  // action to change report status
  const updateReportStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // optimistic local update
      setRecentReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      setReportsList((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));

      // update pending complaints count quickly
      const pending = (await supabase.from("reports").select("id").eq("status", "pending")).data || [];
      setPendingComplaints(pending.length);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update report status: " + err.message);
    }
  };

  // UI: small loading placeholder while auth check runs
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold text-gray-600">
        Checking admin access...
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 pt-24 pb-12 px-6"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Comprehensive waste management control center</p>
            </div>

            <div className="flex gap-3 items-center">
              <Button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/admin/login");
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Top stat cards *
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <div className="text-sm text-gray-500">Total Bins</div>
              <div className="text-2xl font-bold text-indigo-700">{totalBins}</div>
              <div className="text-xs text-gray-400 mt-1">Calculated as pickers × 10</div>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <div className="text-sm text-gray-500">Active Pickers (today)</div>
              <div className="text-2xl font-bold text-indigo-700">{activePickers}</div>
              <div className="text-xs text-gray-400 mt-1">Pickers who have a daily stat entry today</div>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <div className="text-sm text-gray-500">Collections Today</div>
              <div className="text-2xl font-bold text-indigo-700">{collectionsToday}</div>
              <div className="text-xs text-gray-400 mt-1">Summed from picker_daily_stats.bins_collected</div>
            </motion.div>

            <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
              <div className="text-sm text-gray-500">Pending Complaints</div>
              <div className="text-2xl font-bold text-indigo-700">{pendingComplaints}</div>
              <div className="text-xs text-gray-400 mt-1">Reports with status = "pending"</div>
            </motion.div>
          </div>
          

          {/* Tabs 
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
            <div className="flex gap-3 border-b pb-3 mb-4">
              {["overview", "bin-management", "waste-pickers", "complaints", "reports"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeTab === t ? "bg-blue-600 text-white" : "text-gray-600 bg-transparent"
                  }`}
                >
                  {t === "overview" && "Overview"}
                  {t === "bin-management" && "Bin Management"}
                  {t === "waste-pickers" && "Waste Pickers"}
                  {t === "complaints" && "Complaints"}
                  {t === "reports" && "Reports"}
                </button>
              ))}
            </div>

            {/* Tab content *
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Live map & quick badges *
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-blue-100 p-6 bg-white min-h-[180px]">
                    <h3 className="font-semibold text-blue-800 mb-3">Live Map View</h3>
                    <div className="border-2 border-dashed border-blue-200 h-44 flex flex-col items-center justify-center text-gray-400 rounded-lg">
                      <div>Interactive map coming soon</div>
                      <div className="mt-3 flex gap-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">Cleared {collectionsToday}</span>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">Pending {pendingComplaints}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 p-6 bg-white min-h-[180px]">
                    <h3 className="font-semibold text-blue-800 mb-3">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentReports.length ? (
                        recentReports.map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-50">
                            <div>
                              <div className="font-medium text-gray-800">{r.issue_type || "Issue"}</div>
                              <div className="text-xs text-gray-500">{r.location || "Unknown"} • {new Date(r.created_at).toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 text-xs rounded-full ${statusBadgeClass(r.status)}`}>{r.status}</span>
                              <Button size="sm" onClick={() => updateReportStatus(r.id, r.status === "pending" ? "In Progress" : "Resolved")}>
                                {r.status === "pending" ? "Assign" : "View"}
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No recent activity</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* quick analytics / cards (reuse top stats) *
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-blue-100 p-6 bg-white">
                    <h4 className="text-sm text-gray-500">Top Pickers Today</h4>
                    <div className="mt-3 text-sm text-gray-600">(pickers list shown in Waste Pickers tab)</div>
                  </div>
                  <div className="rounded-xl border border-blue-100 p-6 bg-white">
                    <h4 className="text-sm text-gray-500">Collection Distribution</h4>
                    <div className="mt-3 text-sm text-gray-600">Bar charts & charts can be integrated here (recharts/recharts-like)</div>
                  </div>
                  <div className="rounded-xl border border-blue-100 p-6 bg-white">
                    <h4 className="text-sm text-gray-500">Reports Overview</h4>
                    <div className="mt-3 text-sm text-gray-600">Recent reports: {reportsList.length}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bin-management" && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Bin Management</h3>
                <div className="rounded-xl border border-blue-100 p-6 bg-white">
                  <p className="text-gray-600">Interactive bin map & routes go here. You can show bin list, route assignment, and add-new-bin control.</p>
                  <div className="mt-4">
                    <Button onClick={() => alert("Open Add Bin modal (implement)")}>+ Add New Bin</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "waste-pickers" && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Waste Pickers</h3>
                <div className="rounded-xl border border-blue-100 p-6 bg-white space-y-3">
                  {pickersList.length ? (
                    pickersList.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.email}</div>
                        </div>
                        <div className="text-sm text-gray-600">ID: {p.id.slice(0, 8)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No pickers found.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "complaints" && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Complaint Management</h3>

                <div className="rounded-xl border border-blue-100 p-6 bg-white">
                  {reportsList.length ? (
                    <div className="space-y-3">
                      {reportsList.slice(0, 20).map((r) => (
                        <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-50">
                          <div>
                            <div className="font-medium text-gray-800">{r.issue_type || "Issue"}</div>
                            <div className="text-xs text-gray-500">{r.location || "Unknown"} • {new Date(r.created_at).toLocaleString()}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs rounded-full ${statusBadgeClass(r.status)}`}>{r.status}</span>
                            <Button size="sm" onClick={() => updateReportStatus(r.id, "In Progress")} className="bg-yellow-500 hover:bg-yellow-600 text-white">Assign</Button>
                            <Button size="sm" onClick={() => updateReportStatus(r.id, "Resolved")} className="bg-green-600 hover:bg-green-700 text-white">Resolve</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No reports available.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                <h3 className="font-semibold text-blue-800 mb-3">Reports & Analytics</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {reportsList.length ? (
                    reportsList.map((r) => (
                      <div key={r.id} className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                        {r.photo_url ? (
                          <img src={r.photo_url} alt="report" className="w-full h-36 object-cover" />
                        ) : (
                          <div className="h-36 bg-blue-50 flex items-center justify-center text-blue-400">No image</div>
                        )}

                        <div className="p-4">
                          <div className="font-semibold text-gray-800">{r.issue_type || "Issue"}</div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.description || "No description"}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-500">{r.location || "Unknown"}</div>
                            <div className={`px-2 py-1 text-xs rounded-full ${statusBadgeClass(r.status)}`}>{r.status}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-gray-500">No reports found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.main>

      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import OverviewTab from "@/components/admin/OverviewTab";
import BinManagementTab from "@/components/admin/BinManagementTab";
import PickersTab from "@/components/admin/PickersTab";
import ComplaintsTab from "@/components/admin/ComplaintsTab";
import ReportsTab from "@/components/admin/ReportsTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "bins", label: "Bin Management" },
  { id: "pickers", label: "Waste Pickers" },
  { id: "complaints", label: "Complaints" },
  { id: "reports", label: "Reports" },
];

export default function AdminDashboardPage() {
  const [active, setActive] = useState("overview");

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 pt-24 pb-12 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>

          
          <div className="flex gap-3 mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`px-4 py-2 rounded-full font-medium ${
                  active === t.id
                    ? "bg-white shadow-md text-indigo-700"
                    : "bg-white/60 text-gray-700 hover:opacity-90"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          
          <div>
            {active === "overview" && <OverviewTab />}
            {active === "bins" && <BinManagementTab />}
            {active === "pickers" && <PickersTab />}
            {active === "complaints" && <ComplaintsTab />}
            {active === "reports" && <ReportsTab />}
          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}
*/
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

/**
 * ✅ Admin Dashboard
 * - Shows bins, pickers, complaints, success rate
 * - Includes waste chart (today only, converted to kg)
 * - Keeps historical records in DB
 */

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Stats
  const [totalBins, setTotalBins] = useState(0);
  const [activePickers, setActivePickers] = useState(0);
  const [collectionsToday, setCollectionsToday] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [avgSuccessRate, setAvgSuccessRate] = useState(0);
  const [wasteData, setWasteData] = useState([]);
  const [totalWaste, setTotalWaste] = useState(0);

  // Lists
  const [recentReports, setRecentReports] = useState([]);
  const [pickersList, setPickersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  // 🕒 Today range (IST timezone safe)
  const todaysRange = useMemo(() => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // +5:30 for IST
    const local = new Date(now.getTime() + offset);
    const yyyy = local.getUTCFullYear();
    const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(local.getUTCDate()).padStart(2, "0");
    const start = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    const end = new Date(`${yyyy}-${mm}-${dd}T23:59:59Z`);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  // Verify admin
  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        router.push("/admin/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.role !== "admin") {
        alert("Access denied.");
        router.push("/");
        return;
      }

      if (mounted) setLoading(false);
    };

    verify();
    return () => (mounted = false);
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    if (loading) return;
    let cancelled = false;

    const load = async () => {
      try {
        // ✅ Fetch pickers
        const { data: pickers } = await supabase
          .from("profiles")
          .select("id, name, email, role")
          .ilike("role", "picker");

        const numPickers = pickers?.length || 0;
        const totalBinsCalc = numPickers * 10;
        const activePickersCount = numPickers;

        // ✅ Collections today
        const { data: binsRows } = await supabase
          .from("picker_daily_stats")
          .select("bins_collected, success_rate")
          .gte("day", todaysRange.start)
          .lte("day", todaysRange.end);

        const collectionsSum = (binsRows || []).reduce(
          (s, r) => s + (Number(r.bins_collected) || 0),
          0
        );

        const collectionSuccess =
          binsRows && binsRows.length
            ? binsRows.reduce(
                (s, r) => s + (Number(r.success_rate) || 0),
                0
              ) / binsRows.length
            : 0;

        // ✅ Complaints
        const { data: allReportsData } = await supabase
          .from("reports")
          .select("status");

        const totalReportsCount = allReportsData?.length || 1;
        const resolvedReports = allReportsData?.filter(
          (r) => r.status?.toLowerCase() === "resolved"
        ).length;
        const complaintSuccess = resolvedReports / totalReportsCount;

        const combinedSuccess = ((collectionSuccess / 100 + complaintSuccess) / 2) * 100;

        const pendingCount =
          allReportsData?.filter(
            (r) => r.status?.toLowerCase() === "pending"
          ).length || 0;

        // ✅ Recent reports
        const { data: recent } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        const { data: allReports } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        const pickersLite = pickers.map((p) => ({
          id: p.id,
          email: p.email,
          name: p.name || p.email,
        }));

        // ✅ Waste data (collections)
        const { data: wasteRows } = await supabase
          .from("collections")
          .select("waste_type, created_at")
          .gte("created_at", todaysRange.start)
          .lte("created_at", todaysRange.end);

        const wasteCount = { wet: 0, dry: 0, metal: 0, plastic: 0 };

        (wasteRows || []).forEach((row) => {
          const wt = row.waste_type?.toLowerCase();
          if (wt === "wet") wasteCount.wet += 3;
          else if (wt === "dry") wasteCount.dry += 2;
          else if (wt === "metal") wasteCount.metal += 5;
          else if (wt === "plastic") wasteCount.plastic += 1;
        });

        const wasteChartData = [
          { name: "Wet Waste", value: wasteCount.wet },
          { name: "Dry Waste", value: wasteCount.dry },
          { name: "Metal Waste", value: wasteCount.metal },
          { name: "Plastic Waste", value: wasteCount.plastic },
        ];

        const totalWasteCalc =
          wasteCount.wet + wasteCount.dry + wasteCount.metal + wasteCount.plastic;

        if (!cancelled) {
          setTotalBins(totalBinsCalc);
          setActivePickers(activePickersCount);
          setCollectionsToday(collectionsSum);
          setPendingComplaints(pendingCount);
          setAvgSuccessRate(combinedSuccess.toFixed(1));
          setRecentReports(recent || []);
          setReportsList(allReports || []);
          setPickersList(pickersLite || []);
          setWasteData(wasteChartData);
          setTotalWaste(totalWasteCalc);
        }
      } catch (err) {
        console.error("Error loading:", err);
      }
    };

    load();
    const interval = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loading, todaysRange]);

  // Badge styling
  const statusBadgeClass = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";
    if (status.toLowerCase() === "resolved")
      return "bg-green-100 text-green-700";
    if (["in progress", "assigned"].includes(status.toLowerCase()))
      return "bg-yellow-100 text-yellow-700";
    if (status.toLowerCase() === "pending") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-semibold text-gray-600">
        Checking admin access...
      </div>
    );

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 pt-24 pb-12 px-6"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-indigo-700">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Overview of waste management statistics
              </p>
            </div>
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/admin/login");
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </Button>
          </div>

          {/* 🧮 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
            <StatCard label="Total Bins" value={totalBins} note="Pickers × 10" />
            <StatCard label="Active Pickers" value={activePickers} note="All registered pickers" />
            <StatCard label="Collections Today" value={collectionsToday} note="Sum of bins_collected" />
            <StatCard label="Pending Complaints" value={pendingComplaints} note="Reports pending" />
            <StatCard label="Overall Success Rate" value={`${avgSuccessRate}%`} note="Bins + Reports" />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
            <div className="flex gap-3 border-b pb-3 mb-4">
              {["overview", "bin-management", "waste-pickers", "complaints", "reports"].map(
                (t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      activeTab === t
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 bg-transparent"
                    }`}
                  >
                    {t.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </button>
                )
              )}
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 📋 Recent Reports */}
                <div className="p-6 border border-blue-100 rounded-xl bg-white">
                  <h3 className="font-semibold text-blue-800 mb-3">Recent Reports</h3>
                  {recentReports.length ? (
                    recentReports.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-blue-50 mb-2"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {r.issue_type || "Issue"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {r.location || "Unknown"} •{" "}
                            {new Date(r.created_at).toLocaleString()}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${statusBadgeClass(r.status)}`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No recent reports.</div>
                  )}
                </div>

                {/* 🏆 Top Pickers */}
                <div className="p-6 border border-blue-100 rounded-xl bg-white">
                  <h3 className="font-semibold text-blue-800 mb-3">
                    Top 5 Pickers (by Success Rate)
                  </h3>
                  <TopPickers />
                </div>

                {/* ♻️ Waste Distribution */}
                <div className="lg:col-span-2 p-6 border border-blue-100 rounded-xl bg-white mt-6">
                  <h3 className="font-semibold text-blue-800 mb-3">
                    ♻️ Waste Collected Today (in kg)
                  </h3>
                  {wasteData.length ? (
                    <>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            dataKey="value"
                            data={wasteData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                          >
                            {wasteData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#22c55e", "#3b82f6", "#a855f7", "#facc15"][index % 4]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} kg`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="mt-4 text-center text-lg font-semibold text-gray-700">
                        Total Waste Collected Today:{" "}
                        <span className="text-blue-600">{totalWaste} kg</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-sm">No waste data available for today.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}

// ✅ StatCard component
function StatCard({ label, value, note }) {
  return (
    <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-indigo-700">{value}</div>
      {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
    </motion.div>
  );
}

// ✅ TopPickers list
function TopPickers() {
  const [topPickers, setTopPickers] = useState([]);

  useEffect(() => {
    const loadTopPickers = async () => {
      try {
        const { data, error } = await supabase
          .from("picker_daily_stats")
          .select(`
            picker_id,
            success_rate,
            profiles!inner (
              id,
              name,
              email
            )
          `)
          .order("success_rate", { ascending: false })
          .limit(5);

        if (error) console.error("Error loading top pickers:", error);
        else setTopPickers(data || []);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    loadTopPickers();
  }, []);

  return (
    <ul className="space-y-3">
      {topPickers.map((picker) => (
        <li
          key={picker.picker_id}
          className="p-3 rounded-lg bg-gray-50 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-gray-900">
              {picker.profiles?.name || "Unknown Picker"}
            </p>
            <p className="text-sm text-gray-500">
              {picker.profiles?.email || "No email"}
            </p>
          </div>
          <p className="font-bold text-green-600">
            {picker.success_rate?.toFixed(1) ?? 0}%
          </p>
        </li>
      ))}
    </ul>
  );
}
