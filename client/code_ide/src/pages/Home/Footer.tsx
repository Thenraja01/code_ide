import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 border-t border-gray-800 px-6 py-10">
      
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            CODE<span className="text-purple-500">SPACE</span>
          </h2>
          <p className="mt-3 text-sm">
            Build, scale, and ship secure software with AI-powered tools.
          </p>
        </div>

        {/* LINKS */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold mb-2">Quick Links</h3>
          <a href="#" className="hover:text-white transition">Home</a>
          <a href="#" className="hover:text-white transition">Features</a>
          <a href="#" className="hover:text-white transition">Pricing</a>
          <a href="#" className="hover:text-white transition">Contact</a>
        </div>

        {/* SOCIAL */}
        <div>
          <h3 className="text-white font-semibold mb-2">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">GitHub</a>
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-gray-500 mt-10 border-t border-gray-800 pt-6"
      >
        © {new Date().getFullYear()} CodeSpace. All rights reserved.
      </motion.div>
    </footer>
  );
}
