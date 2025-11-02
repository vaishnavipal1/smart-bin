"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PickersTab() {
  const [pickers, setPickers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role, created_at")
        .eq("role", "picker")
        .order("created_at", { ascending: false });

      if (error) console.error("Fetch pickers error:", error.message);
      else setPickers(data || []);

      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-blue-800 mb-4">Registered Pickers</h2>
      {loading ? (
        <p>Loading pickers...</p>
      ) : pickers.length === 0 ? (
        <p>No pickers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pickers.map((p) => (
            <div key={p.id} className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
              <div className="font-semibold text-gray-800">{p.name || p.email}</div>
              <div className="text-xs text-gray-500">{p.email}</div>
              <div className="text-xs text-gray-400 mt-2">Joined: {new Date(p.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
