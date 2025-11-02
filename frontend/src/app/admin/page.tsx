"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminHome() {
  return (
    <>
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-200 text-center px-6 pt-28"
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold text-indigo-700 mb-4"
        >
          Admin Portal
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-lg text-gray-700 mb-10 max-w-xl"
        >
          Manage operations, monitor waste collection, and keep Shuddhi smart and sustainable.
        </motion.p>

        <div className="flex gap-6">
          <Button
            asChild
            className="px-6 py-3 font-semibold bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full shadow-lg hover:scale-105 transition-all"
          >
            <Link href="/admin/login">Login</Link>
          </Button>

          <Button
            asChild
            className="px-6 py-3 font-semibold bg-white text-indigo-700 border border-indigo-300 rounded-full hover:bg-indigo-50 transition-all"
          >
            <Link href="/admin/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </motion.main>

      <Footer />
    </>
  );
}
