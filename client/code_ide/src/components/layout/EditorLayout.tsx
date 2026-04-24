import { Outlet } from "react-router-dom";
import type { JSX } from "react";

export default function EditorLayout(): JSX.Element {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
    
      {/* Content area: sidebar + page */}
      <div className="flex flex-1 overflow-hidden">

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
