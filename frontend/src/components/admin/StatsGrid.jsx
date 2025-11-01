"use client";
import React from "react";
import { motion } from "framer-motion";

export default function StatsGrid({ stats }) {
  // stats: { totalBins, activePickers, clearedToday, pendingComplaints, successRate }
  const items = [
    { label: "Total Dustbins", value: stats.totalBins ?? 0, color: "bg-blue-100 text-blue-700" },
    { label: "Active Pickers", value: stats.activePickers ?? 0, color: "bg-indigo-100 text-indigo-700" },
    { label: "Cleared Today", value: stats.clearedToday ?? 0, color: "bg-green-100 text-green-700" },
    { label: "Pending Complaints", value: stats.pendingComplaints ?? 0, color: "bg-yellow-100 text-yellow-700" },
    { label: "Success Rate", value: `${stats.successRate ?? 0}%`, color: "bg-teal-100 text-teal-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {items.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`p-4 rounded-2xl shadow-sm text-center font-semibold ${s.color}`}
        >
          <div className="text-2xl">{s.value}</div>
          <div className="text-xs opacity-90">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
