"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Html5Qrcode } from "html5-qrcode";

export default function PickerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pickerName, setPickerName] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [qrValue, setQrValue] = useState(null);

  const [binId, setBinId] = useState("");
  const [location, setLocation] = useState("");
  const [ward, setWard] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [logging, setLogging] = useState(false);

  const [stats, setStats] = useState({
    totalCollections: 0,
    wardsCovered: 0,
    successRate: 0,
  });

  const qrRef = useRef(null);

  // ✅ Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const currUser = data?.user || null;
      if (!currUser) {
        router.push("/picker/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, name, email")
        .eq("id", currUser.id)
        .maybeSingle();

      if (error || !profile || profile.role !== "picker") {
        alert("Access denied. Picker role required.");
        router.push("/");
        return;
      }

      setUser(currUser);
      setPickerName(profile.name || profile.email);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  // ✅ Fetch today's stats with success criteria
  const fetchStats = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("collections")
      .select("ward, bin_id")
      .eq("picker_id", user?.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    if (error) {
      console.error("Stats fetch error:", error.message);
      return;
    }

    const totalCollections = data.length;
    const wardsCovered = new Set(data.map((r) => r.ward)).size;

    // ✅ New success logic:
    const minWards = 5;
    const minBins = 10;

    let successRate = 0;

    if (wardsCovered >= minWards && totalCollections >= minBins) {
      successRate = 100;
    } else {
      const wardProgress = Math.min(wardsCovered / minWards, 1);
      const binProgress = Math.min(totalCollections / minBins, 1);
      successRate = Math.round(((wardProgress + binProgress) / 2) * 100);
    }

    setStats({ totalCollections, wardsCovered, successRate });
  };

  useEffect(() => {
  // Only run once user is available and auth check is done
  if (checkingAuth) return;

  if (user?.id) {
    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }
}, [checkingAuth, user?.id]);


  // ✅ Start Scanner
  const startScanner = async () => {
    try {
      if (scanner) {
        await scanner.stop().catch(() => {});
        setScanner(null);
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          console.log("✅ Scanned:", decodedText);
          setQrValue(decodedText);
          stopScanner();

          const matchBin = decodedText.match(/BIN[:=]?\s*([^\|,;\n\r]+)/i);
          const matchWard = decodedText.match(/WARD[:=]?\s*([^\|,;\n\r]+)/i);
          if (matchBin) setBinId(matchBin[1].trim());
          if (matchWard) setWard(matchWard[1].trim());
        },
        (error) => console.warn("QR scan error:", error)
      );

      setScanning(true);
      setDemoMode(false);
    } catch (err) {
      console.error("Scanner start error:", err);
      alert("Camera access failed: " + err.message);
    }
  };

  // ✅ Stop Scanner safely
  const stopScanner = async () => {
    if (scanner) {
      try {
        await scanner.stop();
      } catch (err) {
        console.warn("Stop error:", err.message);
      } finally {
        scanner.clear().catch(() => {});
        setScanner(null);
      }
    }
    setScanning(false);
  };

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [scanner]);

  // ✅ Demo Mode
  const startDemo = () => {
    stopScanner();
    setDemoMode(true);
    setQrValue("BIN=DEMO_BIN_001 | WARD=Demo Ward");
    setBinId("DEMO_BIN_001");
    setWard("Demo Ward");
    setLocation("Demo Zone");
    setWasteType("Dry");
  };

  // ✅ Log collection
  const handleLogCollection = async () => {
    if (!user || !binId || !wasteType)
      return alert("Please scan QR and select waste type");

    setLogging(true);
    try {
      const payload = {
        picker_id: user.id,
        picker_name: pickerName,
        bin_id: binId,
        ward,
        location,
        waste_type: wasteType,
        success: true,
      };

      const { error } = await supabase.from("collections").insert([payload]);
      if (error) throw error;

      await fetchStats();
      setQrValue("");
      setBinId("");
      setWard("");
      setLocation("");
      setWasteType("");
      setDemoMode(false);

      alert("✅ Collection logged successfully!");
    } catch (err) {
      alert("❌ Failed to log: " + err.message);
    } finally {
      setLogging(false);
    }
  };

  if (checkingAuth)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-700">
        Checking access...
      </div>
    );

  return (
    <>
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-24 pb-12 px-4"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-blue-800 mb-1">
              Waste Picker Portal
            </h1>
            <p className="text-gray-600">
              Scan QR codes to log waste collection
            </p>
          </div>

          {/* ✅ QR SCANNER BOX */}
          <Card className="p-6 shadow-lg">
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-blue-700">
                QR Code Scanner
              </h2>

              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 flex flex-col items-center bg-white">
                <div
                  id="qr-reader"
                  ref={qrRef}
                  className="w-full max-w-sm aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
                >
                  {!scanning && !demoMode && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-gray-600 font-medium text-center"
                    >
                      🎥 Ready to scan QR...
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={scanning ? stopScanner : startScanner}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {scanning ? "Stop Camera" : "Start Camera Scan"}
                  </Button>
                  <Button
                    onClick={startDemo}
                    className="bg-white border border-blue-400 text-blue-700"
                  >
                    Demo Mode
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Waste Info + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-lg col-span-2">
              <CardContent className="space-y-4">
                <h2 className="text-lg font-semibold text-blue-700">
                  Waste Collection Details
                </h2>

                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="">Select waste type</option>
                  <option value="Wet">Wet</option>
                  <option value="Dry">Dry</option>
                  <option value="Plastic">Plastic</option>
                  <option value="Metal">Metal</option>
                  <option value="E-waste">E-waste</option>
                </select>

                <input
                  type="text"
                  placeholder="Bin ID"
                  value={binId}
                  onChange={(e) => setBinId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Enter ward"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />

                <Button
                  onClick={handleLogCollection}
                  disabled={logging}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {logging ? "Logging..." : "Log Collection"}
                </Button>
              </CardContent>
            </Card>

            {/* ✅ Stats Section */}
            <Card className="p-6 shadow-lg">
              <CardContent>
                <h2 className="text-lg font-semibold text-blue-700 mb-4">
                  Today's Stats
                </h2>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col space-y-4 text-center"
                >
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {stats.totalCollections}
                    </div>
                    <div className="text-sm text-gray-600">Collections</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {stats.wardsCovered}
                    </div>
                    <div className="text-sm text-gray-600">Wards</div>
                  </div>
                  <div>
                    <div
                      className={`text-2xl font-bold ${
                        stats.successRate === 100
                          ? "text-green-600"
                          : "text-blue-700"
                      }`}
                    >
                      {stats.successRate}%
                    </div>
                    <div className="text-sm text-gray-600">Success</div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/picker/login");
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.main>
      <Footer />
    </>
  );
}
