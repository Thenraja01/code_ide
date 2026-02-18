import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useHandleNavigate } from "../utils/CustomFunction/HandleNavigate";
export default function Timeline() {
     const data = [
    {
      heading: "What is CodeSpace?",
      para: "Supports multiple programming languages. Cloud-based coding platform. No local setup required.",
      info: "Get access to 20+ pages including dashboard, charts, kanban, calendar, and e-commerce pages.",
      button: "Learn more",
      link:"docs"
    },
    {
      heading: "Documentation",
      para: "Well organized and beginner friendly docs.",
      info: "Step-by-step guides to integrate and deploy.",
      button: "Read docs",
       link:"docs"
    },
    {
      heading: "Dashboard",
      para: "Monitor projects in real-time.",
      info: "Analytics, reports, and team insights included.",
      button: "View dashboard",
       link:"dashboard"
    },
  ];
const HandleNavigate=useHandleNavigate()
    return(
        <>
        
      {/* TIMELINE / FEATURES */}
      <ol className="relative border-l m-12 p-6 space-y-10">

        {data.map((item, index) => (
          <li key={index} className="text-start sm:w-full lg:w-1/2">
            <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-1.5"></div>

            <h3 className="text-xl font-semibold">{item.heading}</h3>

            <p className="text-muted-foreground my-2">
              {item.para}
            </p>

            <p className="mb-3">{item.info}</p>

            <Button size="sm"  className="bg-primary" onClick={()=>HandleNavigate(item.link)}>{item.button}</Button>
          </li>
        ))}

      </ol></>
    )
};
