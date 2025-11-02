"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function ComplaintsTab() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      // complaints are reports NOT in Resolved or In Progress
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .or("status.eq.Pending,status.eq.Rejected,status.eq.New")

        .order("created_at", { ascending: false })
        .limit(50);

      if (error) console.error(error.message);
      else setComplaints(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from("reports").update({ status }).eq("id", id);
    if (error) {
      console.error("Update status error:", error.message);
      return;
    }
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-800 mb-4">Pending Complaints</h2>
      {loading ? <p>Loading...</p> : complaints.length === 0 ? <p>No pending complaints.</p> : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="p-3 bg-white rounded-xl border border-blue-100 flex justify-between items-start">
              <div>
                <div className="font-semibold">{c.issue_type || "Issue"}</div>
                <div className="text-xs text-gray-500">{c.description?.slice(0,120)}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" onClick={() => updateStatus(c.id, "In Progress")} className="bg-yellow-500 text-white">In Progress</Button>
                <Button size="sm" onClick={() => updateStatus(c.id, "Resolved")} className="bg-green-600 text-white">Resolve</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
