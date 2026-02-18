import { Outlet } from "react-router-dom";
import Navbar from "../../Navbar/MarketingNavbar/MarketingNavbar";
import type { JSX } from "react";

export default function AuthLayout(): JSX.Element {
  return (
    <>
      <Navbar />

      <main
        className="
          min-h-[calc(100vh-64px)]
          flex items-center justify-center
          bg-muted/30
          px-4
        "
      >
        <div className="w-full flex justify-center py-12">
          <Outlet />
        </div>
      </main>
    </>
  )
}
