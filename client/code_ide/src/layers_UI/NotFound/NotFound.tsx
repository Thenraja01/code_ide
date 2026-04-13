import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const handleNavigate = useHandleNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-chart-2/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl"
      >
        {/* Animated 404 Text */}
        <div className="relative mb-8">
          <motion.h1 
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 2,
              ease: "easeInOut" 
            }}
            className="text-9xl md:text-[12rem] font-black tracking-tighter bg-linear-to-bl from-primary via-purple-600 to-chart-2 text-transparent bg-clip-text drop-shadow-2xl"
          >
            404
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 -right-4 md:-top-8 md:-right-8"
          >
            <FileQuestion className="w-12 h-12 md:w-20 md:h-20 text-primary/40 rotate-12" />
          </motion.div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Lost in Code Space?</h2>
          <p className="text-muted-foreground text-lg md:text-xl mb-12 font-light max-w-md mx-auto">
            The module you're looking for was either deleted, moved, or never existed in this repository.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Button 
            size="lg" 
            className="gap-2 text-base px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            onClick={() => handleNavigate("")}
          >
            <Home className="w-4 h-4" />
            Back to Base
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2 text-base px-8 h-12 border-primary/20 hover:bg-primary/5 transition-all duration-300"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Node
          </Button>
        </motion.div>
      </motion.div>

      {/* Code Snippet Decoration */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-10 hidden xl:block pointer-events-none"
      >
        <pre className="text-xs text-primary/30 font-mono">
          {`// Error Trace
const handleError = () => {
  throw new Error("PageNotFound");
};

// Redirecting to safe zone...
router.push("/");`}
        </pre>
      </motion.div>
    </div>
  );
}
