"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PickerDashboard() {
  const [wasteType, setWasteType] = useState("");

  const handleLogCollection = () => {
    if (!wasteType) {
      alert("Please select a waste type before logging!");
      return;
    }
    alert(`Waste collection logged for: ${wasteType}`);
    setWasteType("");
  };

  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 to-blue-300 px-4 py-24"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white/90 backdrop-blur-md w-full max-w-lg p-6 rounded-2xl shadow-xl border border-blue-200"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
            Waste Picker Portal
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Scan QR codes to log waste collection data
          </p>

          {/* QR Scanner section */}
          <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center mb-6">
            <p className="text-gray-700 font-medium mb-2">📷 QR Code Scanner</p>
            <div className="h-40 flex items-center justify-center border border-gray-300 rounded-lg mb-3 bg-gray-50 text-gray-500">
              Ready to Scan
            </div>
            <div className="flex justify-center gap-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Start Camera Scan
              </Button>
              <Button variant="outline">Use Demo Mode</Button>
            </div>
          </div>

          {/* Waste Type selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Waste Type
            </label>
            <select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select waste type</option>
              <option value="Plastic">Plastic</option>
              <option value="Organic">Organic</option>
              <option value="E-waste">E-waste</option>
              <option value="Metal">Metal</option>
              <option value="Glass">Glass</option>
            </select>
          </div>

          <Button
            onClick={handleLogCollection}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Log Collection
          </Button>

          {/* Stats section */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg text-center">
            <h3 className="font-semibold text-blue-800 mb-2">Today's Stats</h3>
            <div className="flex justify-around text-gray-700">
              <div>
                <p className="text-xl font-bold text-green-600">12</p>
                <p className="text-sm">Collections</p>
              </div>
              <div>
                <p className="text-xl font-bold text-orange-500">4</p>
                <p className="text-sm">Wards Covered</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">95kg</p>
                <p className="text-sm">Waste Collected</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.main>

      <Footer />
    </>
  );
}
