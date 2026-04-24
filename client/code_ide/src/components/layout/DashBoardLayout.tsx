import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar/Navbar";
import { useState, type JSX } from "react";
import Sidebar from "@/components/layout/Navbar/Sidebar";

export default function DashBoardLayout(): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Content area: sidebar + page */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
