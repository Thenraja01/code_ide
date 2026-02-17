import { motion } from "framer-motion"; 
export default function DocsHome() {
    return(
   <>
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
            WelCome To
          </span>

          <span className="block text-6xl sm:text-7xl md:text-8xl bg-linear-to-tl from-red-800 via-purple-700 to-gray-500 text-transparent bg-clip-text">
           CODE SPACE
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl   text-muted-foreground  font-light"
        >
          The AI-powered developer platform to build, scale and integrate
          with GitHub and deliver software securely.
        </motion.p>
</section>
</>
    )
};
