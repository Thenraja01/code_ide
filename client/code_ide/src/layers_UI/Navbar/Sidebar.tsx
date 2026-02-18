import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, Folder, Home, LayoutDashboard, Menu, Settings, Star } from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
      const [sidebarOpen, setSidebarOpen] = useState(true)
    return(
        <div className="">

      {/* Sidebar */}
      <aside
        className={`
            fixed md:static z-40
            top-26 left-0
            w-64
            bg-sidebar
            border-r border-sidebar-border
            p-6
            transition-transform
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            >

        <nav className="space-y-3 text-sm" >
          <SidebarItem icon={Home} label="Home" />
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
          <SidebarItem icon={Star} label="Starred" />
          <SidebarItem icon={Folder} label="Projects" />
          <SidebarItem icon={Clock} label="Recent" />
          <SidebarItem icon={CheckSquare} label="Todo" />
          <SidebarItem icon={Settings} label="Settings" />
          <Button variant={"destructive"} onClick={()=>setSidebarOpen(false)} className="md:hidden">Cancel</Button>
        </nav>
      </aside>
        {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header */}
        <div className="m-2">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu />
            </button>
           
          </div>

      {sidebarOpen && (
          <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          />
        )}
    </div>
    </div>
    )
};

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
