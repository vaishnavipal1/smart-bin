"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roles = [
  {
    role: "Admin",
    href: "/admin/login",
    color: "from-blue-400 to-blue-600",
    icon: "🛡️",
    desc: "Manage operations, analytics, and user access.",
  },
  {
    role: "Waste Picker",
    href: "/picker/login",
    color: "from-green-400 to-green-600",
    icon: "🚛",
    desc: "Track routes, pickup schedules, and progress.",
  },
  {
    role: "Citizen",
    href: "/citizen/login",
    color: "from-yellow-300 to-yellow-500",
    icon: "👨‍👩‍👧‍👦",
    desc: "Request pickups, monitor city cleanliness, and engage.",
  },
];

// Animation variants
const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const letterVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.05 } },
};

export default function HomePage() {
  const title = "Smart City Portal";

  return (
    <>
      {/* ✅ Navbar */}
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 text-center overflow-hidden px-4 pt-28"
      >
        {/* Animated background shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-[-80px] left-[-150px] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-300 to-blue-100 blur-2xl z-0"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] rounded-full bg-gradient-to-br from-cyan-200 to-teal-400 blur-2xl z-0"
        />

        {/* Main content */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 w-full flex flex-col items-center"
        >
          {/* Title — letter-by-letter animation */}
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-600 to-teal-500 drop-shadow-[0_2px_6px_rgba(59,130,246,0.2)] flex justify-center flex-wrap"
          >
            {title.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariant}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg sm:text-xl text-gray-700 mb-10 max-w-xl mx-auto"
          >
            Transform your city’s waste management with{" "}
            <span className="font-semibold text-indigo-600">smart tracking</span>
            , real-time updates, and seamless engagement for all stakeholders.
          </motion.p>

          {/* Role cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
          >
            {roles.map((r, idx) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: idx * 0.3 + 1 }}
                whileHover={{ y: -10, scale: 1.03 }}
                className="transition-all"
              >
                <Card
                  className={`p-8 shadow-xl border-2 border-transparent hover:border-indigo-400 bg-gradient-to-br ${r.color} text-white rounded-xl transform duration-300`}
                >
                  <CardContent className="flex flex-col items-center">
                    <motion.span
                      className="text-5xl mb-3 drop-shadow"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: 2.5,
                        delay: idx * 0.3,
                      }}
                    >
                      {r.icon}
                    </motion.span>

                    <h2 className="text-2xl font-bold mb-2">{r.role} Portal</h2>
                    <p className="mb-6 text-md text-white/90">{r.desc}</p>

                    {/* ✅ Restored earlier button style */}
                    <motion.div whileHover={{ scale: 1.08 }}>
                      <Button
                        asChild
                        className={`w-full mt-2 text-white font-semibold px-6 py-2 rounded-lg shadow-md 
                        bg-gradient-to-r from-indigo-500 to-indigo-700 
                        hover:from-indigo-600 hover:to-indigo-800 transition-all duration-300`}
                      >
                        <Link href={r.href}>Login</Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.main>

      {/* ✅ Footer */}
      <Footer />
    </>
  );
}
