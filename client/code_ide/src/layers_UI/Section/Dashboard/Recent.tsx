import { motion } from "framer-motion";
import SectionHeader from "./components/SectionHeader";
import ProjectTable from "./components/ProjectTable/ProjectTable";
import { Clock, History, Zap } from "lucide-react";

export default function Recent() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8 bg-linear-to-b from-[#0a0b1e] to-[#04050c] min-h-screen text-white"
    >
      <SectionHeader 
        title="Recent Activity"
        subtitle="Jump back into the codebases you've edited recently. Productivity starts where you left off."
        breadcrumbs={[{ label: "Recent" }]}
        rightElement={
          <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 shadow-lg shadow-blue-500/5 backdrop-blur-md">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-bold uppercase tracking-tight">Last 7 Days</span>
          </div>
        }
      />

      <div className="space-y-6">
        <div className="bg-linear-to-r from-blue-600/20 to-transparent p-8 rounded-[2rem] border border-blue-500/20 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden backdrop-blur-sm">
          <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
            <History className="h-8 w-8 text-blue-400" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-bold text-2xl text-white">Continue Your Streak</h3>
            <p className="text-sm text-white/50 max-w-lg mt-1">
              You've been active for 5 days this week. Open a recent project to keep the momentum going.
            </p>
          </div>
          <Zap className="absolute top-1/2 -translate-y-1/2 right-8 h-32 w-32 text-blue-500/10 rotate-12" />
        </div>

        <div className="bg-white/[0.02] rounded-[2rem] border border-white/5 overflow-hidden">
           <ProjectTable view="recent" />
        </div>
      </div>
    </motion.div>
  );
}
