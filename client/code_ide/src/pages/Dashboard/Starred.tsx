import { motion } from "framer-motion";
import SectionHeader from "@/components/dashboard/SectionHeader";
import ProjectTable from "@/components/dashboard/ProjectTable/ProjectTable";
import { Star, Sparkles, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Starred() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 md:p-10 space-y-8 bg-linear-to-b from-[#0a0b1e] to-[#04050c] min-h-screen text-white"
    >
      <SectionHeader 
        title="Starred Workspaces"
        subtitle="Your bookmarked and favorite projects, pinned for quick access and priority management."
        breadcrumbs={[{ label: "Starred" }]}
        rightElement={
          <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 shadow-lg shadow-amber-500/5 backdrop-blur-md">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="text-sm font-bold uppercase tracking-tight">VIP Projects</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
           <div className="bg-white/[0.02] rounded-[2rem] border border-white/5 overflow-hidden">
             <ProjectTable />
           </div>
        </div>
        
        <div className="space-y-6">
           <Card className="border-none bg-linear-to-br from-amber-500/20 via-transparent to-transparent backdrop-blur-md rounded-[2rem] p-8 border border-white/5 overflow-hidden relative">
              <div className="relative z-10">
                 <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
                   <Trophy className="h-6 w-6 text-amber-500" />
                 </div>
                 <h3 className="font-bold text-xl text-white mb-2">Priority Mode</h3>
                 <p className="text-sm text-white/50 leading-relaxed">
                   Starred projects get prioritized in your search and dashboard overview. Keep your most important work here.
                 </p>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500/10" />
           </Card>
           
           <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
              <h4 className="font-black text-[10px] uppercase text-indigo-400 mb-3 tracking-[0.2em]">Quick Bookmark</h4>
              <p className="text-xs text-white/40 leading-relaxed">
                Click the star icon next to any project name in the repository to pin it here.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
