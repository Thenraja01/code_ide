import { Outlet } from "react-router-dom";
import type { JSX } from "react";
import Navbar from "@/layers_UI/Navbar/Navbar";
export default function AuthLayout(): JSX.Element {
  return (
    <>

      <main
        className="
          min-h-screen
          bg-[url('/src/assets/back.png')]
          bg-cover  
          brightness-75
          flex justify-center-safe
          px-4
        "
      >
        <div className="w-full max-w-md py-8
        ">
          <Outlet />
        </div>
      </main>
    </>
  )
}
