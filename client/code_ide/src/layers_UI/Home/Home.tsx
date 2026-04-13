import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Timeline from "./Timeline";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
import Footer from "./Footer";
import { Separator } from "@/components/ui/separator";
export default function Home() {
  const HandleNavigate = useHandleNavigate();

  return (
    <>
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6 py-16 md:py-24">

        {/* LEFT CONTENT */}
        <section className="flex flex-col gap-8 max-w-2xl">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-black leading-tight tracking-tight"
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl">
              CODE
            </span>

            <span className="block text-6xl sm:text-7xl md:text-8xl bg-gradient-to-br from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
              SPACE
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light"
          >
            The AI-powered developer platform to build, scale and integrate
            with GitHub and deliver software securely.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              className="w-full sm:w-auto"
              onClick={() => HandleNavigate("login")}
            >
              Login
            </Button>

            <Button variant="secondary" className="w-full sm:w-auto">
              Explore More
            </Button>
          </motion.div>
        </section>

        {/* RIGHT IMAGE */}
        <div className="flex items-center justify-center w-full md:w-1/2">
          <img
            src="/home1.png"   // ✅ from public folder
            alt="home"
            className="max-w-full h-auto object-contain"
          />
        </div>
      </div>

      <Separator />

      {/* TIMELINE HEADER */}
      <div className="text-center mt-16 mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black leading-tight tracking-tight"
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl bg-gradient-to-b from-gray-700 to-white text-transparent bg-clip-text">
            Timeline
          </span>

          <span className="block text-2xl sm:text-4xl underline bg-gradient-to-br from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
            SPACE
          </span>
        </motion.h1>
      </div>

      {/* TIMELINE */}
      <Timeline />

      {/* FOOTER */}
      <Footer />
    </>
  );
}
