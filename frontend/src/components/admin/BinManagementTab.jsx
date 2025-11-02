"use client";
import React from "react";

export default function BinManagementTab() {
  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-semibold text-blue-800 mb-3">Bin Management</h2>
      <p className="text-gray-600 mb-4">Manage bin routes, assignments and view the map. This area is intentionally non-destructive — implement route editing and export here.</p>

      <div className="flex gap-3">
        <a href="/admin/bin-routes" className="px-4 py-2 bg-indigo-600 text-white rounded-md">View Routes</a>
        <a href="/admin/map" className="px-4 py-2 bg-white border border-blue-200 rounded-md text-blue-700">Open Map</a>
      </div>
    </div>
  );
}
