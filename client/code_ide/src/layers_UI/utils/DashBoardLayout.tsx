import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import type { JSX } from "react";
import Sidebar from "../Section/Dashboard/Sidebar";

export default function DashBoardLayout(): JSX.Element {
  return (
    <>
      <Navbar />

      <main className="">
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <Outlet />
        </div>
      </main>
     
    </>
  )
}