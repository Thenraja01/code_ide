import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Timeline from "./Timeline";
import Footer from "./Footer";
import { Separator } from "@/components/ui/separator";
import homeImg from "@/assets/home1.png";
import { useNavigate } from "react-router-dom";
export default function Home() {
  const HandleNavigate = useNavigate();

  // Animation Variants for cleaner code
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  return (
    <>
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 px-6 py-16 md:py-28 max-w-7xl mx-auto">
        
        {/* Left Column: Text Content */}
        <section className="flex flex-col gap-8 md:w-1/2 text-left">
          
          {/* Animated Logo Title */}
          <motion.h1
            {...fadeInUp}
            className="font-black leading-tight tracking-tight"
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl">
              CODE
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl bg-gradient-to-bl from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
              SPACE
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light max-w-xl"
          >
            The AI-powered developer platform to build, scale and integrate
            with GitHub and deliver software securely.
          </motion.p>

          {/* Buttons */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button 
              className="w-full sm:w-auto px-8 py-6 text-lg" 
              onClick={() => HandleNavigate("login")}
            >
              Login
            </Button>
            <Button 
              variant="secondary" 
              className="w-full sm:w-auto px-8 py-6 text-lg"
            >
              Explore More
            </Button>
          </motion.div>
        </section>

        {/* Right Column: Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="md:w-1/2 flex justify-center w-full"
        >
          <img 
            src={homeImg} 
            alt="CodeSpace Platform Interface" 
            className="w-full max-w-[600px] h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>
    
    
      <Separator />

      {/* TIMELINE SECTION HEADER */}
      <div className="text-center mt-20 mb-12 px-6">
        <motion.h1
          {...fadeInUp}
          className="font-black leading-tight tracking-tight"
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl bg-gradient-to-b from-gray-700 to-gray-400 text-transparent bg-clip-text">
            Timeline
          </span>
          <span className="inline-block text-2xl sm:text-4xl underline decoration-purple-600 underline-offset-8 bg-gradient-to-bl from-red-600 via-purple-600 to-gray-700 text-transparent bg-clip-text">
            SPACE
          </span>
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Timeline />
      </div>

      <Footer />
    </>
  );
}
