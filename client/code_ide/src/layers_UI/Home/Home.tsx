import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Timeline from "./Timeline";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
import Footer from "./Footer";
import { Separator } from "@/components/ui/separator";

export default function Home() {

 const HandleNavigate=useHandleNavigate()

  return (
    <>
    <div className="flex items-center ">

      {/* HERO */}
      <section className="px-6 py-16 md:py-24 flex  flex-col gap-8">

        {/* Animated Logo Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black leading-tight tracking-tight"
          >
          <span className="block text-5xl sm:text-6xl md:text-7xl">
            CODE
          </span>

          <span className="block text-6xl sm:text-7xl md:text-8xl bg-linear-to-bl from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
            SPACE
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-3xl   text-muted-foreground  font-light"
          >
          The AI-powered developer platform to build, scale and integrate
          with GitHub and deliver software securely.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="hidden text-lg sm:text-xl md:text-3xl   text-muted-foreground  font-light"
          >
          The AI-powered developer platform to build, scale and integrate
          with GitHub and deliver software securely.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col  sm:flex-row gap-4"
          >
          <Button className="w-full sm:w-auto" onClick={()=>HandleNavigate("login")}>Login</Button>
          <Button variant="secondary" className="w-full sm:w-auto"  onClick={()=>HandleNavigate("docs")}>
            Explore More
          </Button>
        </motion.div>

      </section>
      <div className="">

          <img src="/src/assets/home1.png" alt="home"  />
      </div>
          </div>
      <Separator />
       {/* Animated Logo Title */}
       <div className="text-center mt-16 mb-8">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black leading-tight tracking-tight"
          >
          <span className="block text-5xl  sm:text-6xl md:text-7xl bg-linear-to-b from-gray-700 to-white  text-transparent bg-clip-text">
            Timeline
          </span>

          <span className="block text-2xl sm:text-5xl  underline md:text-4xl bg-linear-to-bl from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
            SPACE
          </span>
        </motion.h1>
            </div>
      <Timeline/>
      <Footer />

    </>
  );
}
