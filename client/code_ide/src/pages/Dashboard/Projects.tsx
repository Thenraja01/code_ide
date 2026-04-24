import { motion } from "framer-motion";
import SectionHeader from "@/components/dashboard/SectionHeader";
import ProjectTable from "@/components/dashboard/ProjectTable/ProjectTable";
import { Plus, LayoutGrid, List, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Projects() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 space-y-8 bg-linear-to-b from-[#0a0b1e] to-[#04050c] min-h-screen text-white"
    >
      <SectionHeader 
        title="Project Repository"
        subtitle="Manage, monitor and deploy your development workspaces from a single interface."
        breadcrumbs={[{ label: "Projects" }]}
        rightElement={
          <div className="flex gap-2">
            <Button 
                onClick={() => toast.info("Please use the 'New Project' button in the table below to start.")}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Workspace
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 backdrop-blur-md">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input 
                placeholder="Search your codebases..." 
                className="pl-10 bg-white/5 border-white/10 rounded-xl focus-visible:ring-indigo-500/50"
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="ghost" className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl gap-2 text-white/70">
                 <Filter className="h-4 w-4" />
                 Filters
              </Button>
              <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block" />
              <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 ml-auto md:ml-0">
                <Button 
                  variant={viewMode === 'grid' ? "secondary" : "ghost"} 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? "secondary" : "ghost"} 
                  size="icon" 
                  className={`h-8 w-8 rounded-lg ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
           </div>
        </div>

        <div className="bg-white/[0.02] rounded-[2rem] border border-white/5 overflow-hidden">
           <ProjectTable />
        </div>
      </div>
    </motion.div>
  );
}
