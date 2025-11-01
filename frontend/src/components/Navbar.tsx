"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo / Brand */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <span className="text-3xl">🌱</span>
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent"
          >
            Shuddhi
          </Link>
        </motion.div>

        {/* Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-indigo-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">
            Contact
          </Link>
          <Link href="/admin/login" className="hover:text-indigo-600 transition-colors">
            Admin
          </Link>
        </div>

        {/* Call to Action */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Link
            href="/citizen/login"
            className="hidden md:inline-block px-4 py-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </motion.nav>
  );
}
