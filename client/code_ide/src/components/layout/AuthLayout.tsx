import { Outlet } from "react-router-dom";
import type { JSX } from "react";
import backImg from "@/assets/back.png";

export default function AuthLayout(): JSX.Element {
  return (
    <>
      <main
        style={{ backgroundImage: `url(${backImg})` }}
        className="
          min-h-screen
          bg-cover  
          brightness-75
          flex justify-center-safe
          px-4
        "
      >
        <div className="w-full max-w-md py-8">
          <Outlet />
        </div>
      </main>
    </>
  );
}
