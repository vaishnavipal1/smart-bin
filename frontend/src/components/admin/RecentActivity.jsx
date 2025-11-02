"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RecentActivity({ reports = [] }) {
  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-4 border border-blue-100">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">Recent Activity</h3>

      {reports.length === 0 ? (
        <p className="text-gray-500">No recent reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center p-3 border rounded-xl"
            >
              <div>
                <div className="font-semibold text-gray-800">{r.issue_type || "Issue"}</div>
                <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  r.status === "Resolved" ? "bg-green-100 text-green-700" :
                  r.status === "In Progress" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>{r.status}</span>
                <Link href={`/admin/reports/${r.id}`} className="text-sm text-blue-600 hover:underline">View</Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
