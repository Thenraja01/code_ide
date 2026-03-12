import { Outlet } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import type { JSX } from "react";
import Sidebar from "../../Navbar/Sidebar";

export default function DashBoardLayout(): JSX.Element {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navbar */}
      <Navbar />

      {/* Content area: sidebar + page */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}