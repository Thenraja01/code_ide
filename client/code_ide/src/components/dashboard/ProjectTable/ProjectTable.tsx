import { useState, useMemo } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

type Filter = "all" | "starred" | "recent";

export default function ProjectTable() {
  const { user } = useAuth();

  const _projects = useQuery(api.projects.getProjectsByUser, {
    userId: user?.id as any,
  });

  const projects = _projects || [];
  const isLoading = _projects === undefined;

  const createProject = useMutation(api.projects.createProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const toggleStar = useMutation(api.projects.toggleStar);

  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [projectLanguage, setProjectLanguage] = useState("react");

  // ✅ NEW: AI PROMPT STATE
  const [projectPrompt, setProjectPrompt] = useState("");

  const filtered = useMemo(() => {
    return projects.filter((p: any) => {
      const match = p.title.toLowerCase().includes(search.toLowerCase());
      if (filter === "starred") return match && p.isStarred;
      return match;
    });
  }, [projects, search, filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsCreating(true);
    try {
      const projectId = await createProject({
        title: newProjectName,
        language: projectLanguage,
        userId: user.id as any,
        isPublic: false,
        prompt: projectPrompt,
      });

      toast.success("Project created successfully");

      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/ai/project.create`, {
          projectId,
          prompt: projectPrompt,
          language: projectLanguage
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (err) {
        console.warn("AI generation failed to start:", err);
      }

      setNewProjectName("");
      setProjectPrompt("");
      setIsDialogOpen(false);

      setTimeout(() => {
        navigate(`/dashboard/editor/${projectId}`);
      }, 100);
    } catch (err: any) {
      console.error("Create project failed:", err);
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <Card className="p-3 bg-[#111] border-[#222]">
        <CardContent className="flex flex-col md:flex-row gap-3 p-0">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1e1e1e] border-[#333]"
          />

          <div className="flex gap-2">
            {(["all", "starred", "recent"] as Filter[]).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "bg-blue-600"
                    : "bg-[#1e1e1e] border-[#333] hover:bg-[#252525]"
                }
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="bg-[#111] border-[#222]">
        <div className="flex justify-between p-4">
          <h2 className="font-bold text-lg">My Projects</h2>

          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Language</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#222]">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-zinc-500">
                    Loading your workspace...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-zinc-500">
                    No matching projects found
                  </td>
                </tr>
              ) : (
                filtered.map((project: any) => (
                  <tr
                    key={project._id}
                    className="hover:bg-zinc-900/50 transition-colors"
                  >
                    {/* NAME + STAR */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button
                        onClick={() =>
                          toggleStar({ projectId: project._id as any })
                        }
                      >
                        <Star
                          className={`h-4 w-4 ${
                            project.isStarred
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-600 hover:text-zinc-400"
                          }`}
                        />
                      </button>

                      <span className="font-medium text-zinc-200">
                        {project.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {project.language}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            navigate(`/dashboard/editor/${project._id}`)
                          }
                          className="hover:bg-zinc-800"
                        >
                          Open
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm("Delete project?")) {
                              deleteProject({
                                projectId: project._id as any,
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500/70 hover:text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CREATE MODAL */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[100]">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-full max-w-md border border-[#333] shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Create Project</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* PROJECT NAME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Project Name
                </label>
                <Input
                  placeholder="e.g. My Awesome App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  className="bg-[#2a2a2a] border-[#333] focus:border-blue-500"
                />
              </div>

              {/* ENVIRONMENT */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Environment
                </label>
                <select
                  className="w-full bg-[#2a2a2a] border border-[#333] p-2 rounded focus:outline-none focus:border-blue-500 text-zinc-200"
                  value={projectLanguage}
                  onChange={(e) => setProjectLanguage(e.target.value)}
                >
                  <option value="react">React (Vite)</option>
                  <option value="python">Python 3</option>
                  <option value="node">Node.js</option>
                  <option value="nextjs">Next.js</option>
                </select>
              </div>

              {/* 🧠 AI PROMPT SECTION */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  AI Project Prompt
                </label>

                <textarea
                  placeholder="e.g. Build a SaaS dashboard with auth, sidebar, charts, and dark mode..."
                  value={projectPrompt}
                  onChange={(e) => setProjectPrompt(e.target.value)}
                  className="w-full h-24 bg-[#2a2a2a] border border-[#333] p-2 rounded focus:outline-none focus:border-blue-500 text-zinc-200 resize-none"
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:bg-zinc-800"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 min-w-[100px]"
                  disabled={isCreating}
                >
                  {isCreating ? "Initializing..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}