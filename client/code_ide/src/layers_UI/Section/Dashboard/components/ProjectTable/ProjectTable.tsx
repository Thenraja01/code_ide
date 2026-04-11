import { useState } from "react";
import { Plus, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from "@/hooks/useProject.hooks";
import { useCreateRepoMutation } from "@/hooks/useGithub.hooks";
import { useHandleNavigate } from "@/layers_UI/utils/CustomFunction/HandleNavigate";
import { Card, CardContent } from "@/components/ui/card";
type Filter = "all" | "starred" | "recent";

interface ProjectTableProps {
    view?: Filter;
}

export default function ProjectTable({ view }: ProjectTableProps) {
    const { data: projects = [], isLoading } = useProjectsQuery();
    const { mutate: createProject, isPending: isCreating } = useCreateProjectMutation();
    const { mutate: deleteProject } = useDeleteProjectMutation();
    const { mutate: createRepo, isPending: isCreatingRepo } = useCreateRepoMutation();

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>(view || "all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [projectLanguage, setProjectLanguage] = useState("react");
    const [syncGithub, setSyncGithub] = useState(false);
    const [githubToken, setGithubToken] = useState("");

    const navigate = useHandleNavigate();

    // Use view prop if provided, otherwise fallback to internal state
    const currentFilter = view || filter;

    const filtered = projects.filter((p: any) => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
        
        // Basic filtering logic (can be expanded with real property checks)
        if (currentFilter === "starred") return matchSearch && p.isStarred;
        if (currentFilter === "recent") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return matchSearch && new Date(p.updatedAt || p.createdAt) > oneWeekAgo;
        }
        
        return matchSearch;
    });


    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createProject({ title: newProjectName, language: projectLanguage }, {
            onSuccess: (project: any) => {
                if (syncGithub) {
                    createRepo({ token: githubToken, name: newProjectName, description: "Created from CodeSpace IDE", private: false }, {
                        onSuccess: () => navigate(`dashboard/editor/${project.id}`)
                    });
                } else {
                    navigate(`dashboard/editor/${project.id}`);
                }
                setIsDialogOpen(false);
            }
        });
    };

    return (
        <section className="fade-in-up delay-300 flex flex-col gap-4">
            {/* Search + Filter Bar */}
            <Card className="p-3 rounded-2xl">
                <CardContent className="flex flex-col sm:flex-row gap-3 p-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {(["all", "starred", "recent"] as Filter[]).map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "default" : "secondary"}
                            size="sm"
                            onClick={() => setFilter(f)}
                            className="capitalize"
                        >
                            {f}
                        </Button>
                    ))}
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h2 className="text-lg font-semibold">Your Projects</h2>
                    <Button size="sm" className="gap-1.5" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> New Project
                    </Button>
                </div>
                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-card w-full max-w-md rounded-2xl p-6 shadow-xl relative border">
                            <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={() => setIsDialogOpen(false)}>✕</button>
                            <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <Input
                                    placeholder="Project Name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    required
                                />
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground uppercase">Template / Language</label>
                                    <select 
                                        className="w-full bg-background border rounded-lg px-3 py-2 text-sm" 
                                        value={projectLanguage} 
                                        onChange={(e) => setProjectLanguage(e.target.value)}
                                    >
                                        <option value="react">React.js (Vite)</option>
                                        <option value="express">Express.js Server</option>
                                        <option value="vanilla">Vanilla JavaScript</option>
                                        <option value="fastapi">FastAPI (Python)</option>
                                    </select>

                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="sync" checked={syncGithub} onChange={(e) => setSyncGithub(e.target.checked)} />
                                    <label htmlFor="sync" className="text-sm">Create and Sync with GitHub Repository</label>
                                </div>
                                {syncGithub && (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-xs text-muted-foreground uppercase">GitHub Personal Access Token</label>
                                        <Input 
                                            type="password" 
                                            placeholder="ghp_xxxxxxxxxxxx" 
                                            value={githubToken} 
                                            onChange={(e) => setGithubToken(e.target.value)} 
                                            required={syncGithub}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Required to create and push the repository.</p>
                                    </div>
                                )}
                                <Button type="submit" disabled={isCreating || isCreatingRepo} className="w-full">
                                    {(isCreating || isCreatingRepo) ? "Setting up workspace..." : "Create Workspace"}
                                </Button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-muted-foreground bg-muted/30 border-y border-border/50">
                            <tr>
                                <th className="text-left px-6 py-3 font-medium">Project</th>
                                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Template</th>
                                <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Created</th>
                                <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Status</th>
                                <th className="text-right px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading projects...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No projects found. Create one to get started!
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((project: any) => (
                                    <tr
                                        key={project.id}
                                        className="border-b border-border/40 hover:bg-muted/25 transition-colors cursor-pointer"
                                        onClick={() => navigate(`dashboard/editor/${project.id}`)}
                                    >

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <Star
                                                        className={`h-4 w-4 transition-colors text-muted-foreground`}
                                                    />
                                                </button>
                                                <span className="font-medium">{project.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground hidden md:table-cell capitalize">
                                            {project.language || 'react'}
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground hidden lg:table-cell">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-4 hidden md:table-cell">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize bg-green-500/15 text-green-500`}>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteProject(project.id)}>
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 text-xs text-muted-foreground border-t border-border/40">
                    {filtered.length} project{filtered.length !== 1 ? "s" : ""} shown
                </div>
            </Card>
        </section>
    );
}
export function ProjectForm(){
    return(
        <form >
            <Input />
        </form>
    )
}