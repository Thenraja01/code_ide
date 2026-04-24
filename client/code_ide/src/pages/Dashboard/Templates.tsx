import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, FolderOpen, Server, Code } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProjectMutation } from "@/hooks/useProject.hooks";

const templates = [
  {
    id: "react",
    title: "React App",
    description: "Frontend app using React + Vite",
    icon: Code
  },
  {
    id: "node",
    title: "Node API",
    description: "Backend server with Express",
    icon: Server
  },
  {
    id: "ai",
    title: "AI Project",
    description: "AI-powered app with prompt support",
    icon: Sparkles
  },
  {
    id: "vanilla",
    title: "Vanilla JS",
    description: "Simple JavaScript starter",
    icon: FolderOpen
  }
];

export default function TemplatePage() {
  const navigate = useNavigate();
  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [projectName, setProjectName] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleCreate = () => {
    createProject(
      {
        title: projectName,
        language: selectedTemplate.id,
        description: prompt
      },
      {
        onSuccess: (project: any) => {
          navigate(`/dashboard/editor/${project.id}?prompt=${encodeURIComponent(prompt)}`);
        }
      }
    );
  };

  return (
    <div className="p-6 md:p-10 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Create New Project</h1>
        <p className="text-sm text-muted-foreground">
          Choose a template to get started quickly.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => {
          const Icon = tpl.icon;

          return (
            <Card
              key={tpl.id}
              className="p-5 cursor-pointer hover:border-indigo-500 transition"
              onClick={() => setSelectedTemplate(tpl)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-500" />
                </div>
                <h2 className="font-semibold">{tpl.title}</h2>
              </div>

              <p className="text-sm text-muted-foreground">
                {tpl.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Setup Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0  flex items-center justify-center">
          <div className=" bg-primary/0 backdrop-blur-sm p-6 rounded-xl w-full max-w-md space-y-4">

            <h2 className="font-bold text-lg">
              {selectedTemplate.title}
            </h2>

            <input
              className="w-full border p-2 rounded"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              placeholder="Describe your project (optional AI prompt)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                Cancel
              </Button>

              <Button onClick={handleCreate} disabled={isPending}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
