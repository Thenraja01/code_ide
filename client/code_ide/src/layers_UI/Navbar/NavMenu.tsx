import { Button } from "@/components/ui/button";
import { pages } from "./Navbar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function NavMenu() {
    const navigate=useNavigate()
    return (
        <div className="md:flex items-center justify-between p-2">
            <div className="md:hidden flex  ">
                {/* <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <NavMenu /> */}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <X className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                        <Menu className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                        <span className="sr-only">Side bar</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {pages.map((component) => (
                        <DropdownMenuItem onClick={() => {navigate(`${component.href}`)}}>
                                <div className="flex items-center font-medium text-pretty cursor-pointer gap-2 p-2 m-2
                                 hover:text-chart-2 ">
                                {component.icons}
                                {component.title}
                        </div>
                            </DropdownMenuItem>
                    ))}

                </DropdownMenuContent>
            </DropdownMenu>


        </div>
    )
};
