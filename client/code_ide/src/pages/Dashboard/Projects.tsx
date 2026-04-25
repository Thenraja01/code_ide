import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/dashboard/SectionHeader";
import ProjectTable from "@/components/dashboard/ProjectTable/ProjectTable";
import {
  Plus, LayoutGrid, List, Search, Filter,
  Github, Link2, FolderGit2, X, Loader2, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCloneFromGithubMutation } from "@/hooks/useGithub.hooks";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// ---------- GitHub Clone Modal ----------
function GitHubCloneModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mutateAsync: cloneRepo, isPending } = useCloneFromGithubMutation();

  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");

  // Auto-fill project name from URL
  const handleUrlChange = (value: string) => {
    setRepoUrl(value);
    try {
      const urlParts = new URL(value).pathname.split("/").filter(Boolean);
      if (urlParts.length >= 2) {
        setProjectName(urlParts[urlParts.length - 1]);
      }
    } catch {
      // not a valid URL yet — ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const trimmedUrl = repoUrl.trim();
    const trimmedName = projectName.trim();

    if (!trimmedUrl || !trimmedName) return;

    // Basic GitHub URL validation
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?$/;
    if (!githubPattern.test(trimmedUrl)) {
      return;
    }

    try {
      const result = await cloneRepo({
        repoUrl: trimmedUrl,
        projectName: trimmedName,
        userId: user.id,
      });

      onClose();
      if (result?.id || result?._id) {
        setTimeout(() => navigate(`/dashboard/editor/${result.id ?? result._id}`), 100);
      }
    } catch {
      // error handled by the hook
    }
  };

  return (
    // Backdrop
    <motion.div
      id="github-clone-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-lg mx-4"
      >
        {/* Glow halo */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-transparent blur-xl pointer-events-none" />

        <div className="relative bg-[#0d0f1f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Header strip */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Github className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Clone GitHub Repository</h2>
                <p className="text-xs text-white/40">Import any public or private repo as a new project</p>
              </div>
            </div>
            <button
              id="github-clone-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Repo URL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
                <Link2 className="h-3.5 w-3.5" />
                Repository URL
              </label>
              <div className="relative">
                <Input
                  id="github-repo-url-input"
                  placeholder="https://github.com/owner/repository"
                  value={repoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  required
                  disabled={isPending}
                  className="bg-white/5 border-white/10 placeholder:text-white/20 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-xl pr-10 transition-all"
                />
                <Github className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
              </div>
              <p className="text-[11px] text-white/30 pl-1">
                Supports any public GitHub URL — e.g.{" "}
                <code className="text-indigo-400/70">github.com/facebook/react</code>
              </p>
            </div>

            {/* Project Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-white/50 uppercase tracking-widest">
                <FolderGit2 className="h-3.5 w-3.5" />
                Project Name
              </label>
              <Input
                id="github-project-name-input"
                placeholder="my-awesome-project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                disabled={isPending}
                className="bg-white/5 border-white/10 placeholder:text-white/20 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/50 rounded-xl transition-all"
              />
            </div>

            {/* Info chip */}
            <div className="flex items-start gap-3 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
              <div className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-indigo-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-indigo-300">i</span>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">
                The repository will be cloned into a new workspace. You can then open it in the editor and start coding immediately.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                id="github-clone-submit-btn"
                type="submit"
                disabled={isPending || !repoUrl.trim() || !projectName.trim()}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl px-6 shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cloning…
                  </>
                ) : (
                  <>
                    Clone & Open
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Main Page ----------
export default function Projects() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

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
              id="github-workspace-btn"
              onClick={() => setIsGithubModalOpen(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub Workspace
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

      {/* GitHub Clone Modal */}
      <AnimatePresence>
        {isGithubModalOpen && (
          <GitHubCloneModal onClose={() => setIsGithubModalOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
