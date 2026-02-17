'use client'
import {
  Plus,
  Github,
  Search,
  Pencil,
  Trash2,
  ExternalLink
} from 'lucide-react'
import {
  Card,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
const projects = [
  {
    name: 'AI Code Editor',
    template: 'Next.js + AI',
    created: '2026-02-01',
    user: 'Arun',
  },
  {
    name: 'Portfolio Builder',
    template: 'React',
    created: '2026-01-20',
    user: 'Arun',
  },
]

export default function Dashboard() {

 

  return (
    <div className="bg-background">

      {/* Main */}
      <div className=" flex flex-col md:flex-1 md:ml-64 p-6 md:p-10">

        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              Main Dashboard
            </h1>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Playground
          </Button>
        </div>
        
        {/* Action Cards */}
        <div className="grid  md:grid-cols-2 gap-6 mb-12">

          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Plus />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Add New Playground
                </h3>
                <p className="text-muted-foreground text-sm">
                  Start coding instantly with AI assistance
                </p>
              </div>
            </div>
            </Card>
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Github />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Open GitHub Repository
                </h3>
                <p className="text-muted-foreground text-sm">
                  Import and edit projects directly from GitHub
                </p>
              </div>
            </div>
          </Card>
            </div>

        {/* Search + Filters */}
        <Card className="p-4 rounded-2xl shadow-sm">
          <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-10" />
            </div>
            <Button variant="secondary">All</Button>
            <Button variant="secondary">Starred</Button>
            <Button variant="secondary">Recent</Button>
          </CardContent>
        </Card>
         {/* Project Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            Your Projects
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left">Template</th>
                  <th className="text-left">Created</th>
                  <th className="text-left">User</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, i) => (
                  <tr
                    key={i}
                    className="border-b hover:bg-muted/40 transition"
                  >
                    <td className="py-4 font-medium">
                      {project.name}
                    </td>
                    <td>{project.template}</td>
                    <td>{project.created}</td>
                    <td>{project.user}</td>
                    <td className="text-right space-x-2">
                      <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>


      </div>
      </div>
  )
}
