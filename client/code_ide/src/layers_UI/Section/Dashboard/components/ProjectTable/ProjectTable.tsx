import { useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface Project {
    id: number;
    name: string;
    template: string;
    created: string;
    user: string;
    starred: boolean;
    status: "active" | "paused" | "completed";
}

const STATUS_STYLES: Record<Project["status"], string> = {
    active: "bg-green-500/15 text-green-500",
    paused: "bg-amber-500/15 text-amber-500",
    completed: "bg-blue-500/15 text-blue-400",
};

const INITIAL_PROJECTS: Project[] = [
    { id: 1, name: "AI Code Editor", template: "Next.js + AI", created: "2026-02-01", user: "Arun", starred: true, status: "active" },
    { id: 2, name: "Portfolio Builder", template: "React", created: "2026-01-20", user: "Arun", starred: false, status: "active" },
    { id: 3, name: "E-Commerce Dashboard", template: "Vite + TS", created: "2026-01-10", user: "Arun", starred: true, status: "completed" },
    { id: 4, name: "API Gateway Service", template: "Node.js", created: "2026-01-05", user: "Arun", starred: false, status: "paused" },
];

type Filter = "all" | "starred" | "recent";

export default function ProjectTable() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const filtered = projects.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        if (filter === "starred") return matchSearch && p.starred;
        if (filter === "recent") return matchSearch;
        return matchSearch;
    });

    const toggleStar = (id: number) =>
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)));
    const deleteProject = (id: number) =>
        setProjects((prev) => prev.filter((p) => p.id !== id));

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
                    <Button size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> New Project
                    </Button>
                </div>

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
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        No projects found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((project) => (
                                    <tr
                                        key={project.id}
                                        className="border-b border-border/40 hover:bg-muted/25 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleStar(project.id)} className="shrink-0">
                                                    <Star
                                                        className={`h-4 w-4 transition-colors ${project.starred ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
                                                            }`}
                                                    />
                                                </button>
                                                <span className="font-medium">{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground hidden md:table-cell">
                                            {project.template}
                                        </td>
                                        <td className="px-3 py-4 text-muted-foreground hidden lg:table-cell">
                                            {project.created}
                                        </td>
                                        <td className="px-3 py-4 hidden md:table-cell">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[project.status]}`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => deleteProject(project.id)}>
                                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <ExternalLink className="h-3.5 w-3.5" />
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