'use client'

import {
  LayoutDashboard,
  Home,
  Star,
  Folder,
  Clock,
  Settings,
  Plus,
  Github,
  Pencil,
  Trash2,
  ExternalLink,
  Menu
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40
          top-0 left-0 h-full
          w-64
          bg-sidebar
          border-r border-sidebar-border
          p-6
          transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <h2 className="text-xl font-bold mb-8 text-primary">
          CodeSpace
        </h2>

        <nav className="space-y-3 text-sm">
          <SidebarItem icon={Home} label="Home" />
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Star} label="Starred" />
          <SidebarItem icon={Folder} label="Projects" />
          <SidebarItem icon={Clock} label="Recent" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-64 p-6 md:p-10">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
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
        <div className="grid md:grid-cols-2 gap-6 mb-12">

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

        {/* Footer description */}
        <p className="mt-10 text-muted-foreground text-sm max-w-2xl">
          This Online IDE with AI assistance integrates directly with GitHub,
          simplifying development workflows, reducing setup time, and improving
          overall developer productivity.
        </p>
      </div>
    </div>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  active,
}: {
  icon: any
  label: string
  active?: boolean
}) {
  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        ${active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}
      `}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  )
}
