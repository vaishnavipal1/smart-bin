"use client";

import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#0a1a3f] via-[#0d224f] to-[#112b63] text-white pt-10 pb-6 mt-10">
      <div className="container mx-auto px-6 flex flex-col items-center space-y-6">
        {/* --- Top Section: Links --- */}
        <div className="flex flex-wrap justify-center space-x-6 sm:space-x-10 text-gray-300 text-sm font-medium">
          <Link href="/" className="hover:text-blue-300 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-300 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-blue-300 transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-blue-300 transition-colors">
            Privacy Policy
          </Link>
        </div>

        {/* --- Divider Line --- */}
        <div className="w-24 h-[2px] bg-blue-400 rounded-full"></div>

        {/* --- Social Icons --- */}
        <div className="flex space-x-8 text-2xl">
          <motion.a
            whileHover={{ scale: 1.2 }}
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition-colors"
          >
            <FiGithub />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.2 }}
            href="https://linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-300 transition-colors"
          >
            <FiLinkedin />
          </motion.a>

          <motion.a
            whileHover={{ scale: 1.2 }}
            href="mailto:contact@shuddhi.in"
            className="hover:text-blue-300 transition-colors"
          >
            <FiMail />
          </motion.a>
        </div>

        {/* --- Copyright --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-400 mt-4"
        >
          © {new Date().getFullYear()} <span className="font-semibold text-blue-300">Shuddhi</span>.  
          All Rights Reserved.  
          <br />
          Designed & Developed with <span className="text-pink-500">♥</span> for a Cleaner Future 🌿
        </motion.div>
      </div>
    </footer>
  );
}
