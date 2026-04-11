import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Play, Square, FilePlus, FolderPlus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  'File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help', 'Home'
]

interface TopBarProps {
  onPlay?: () => void;
  isPreviewRunning?: boolean;
  onToggleTerminal?: () => void;
  onNewFile?: (type: "FILE" | "FOLDER") => void;
}

export default function TopBar({ onPlay, isPreviewRunning, onToggleTerminal, onNewFile }: TopBarProps) {
  const navigate = useNavigate();
  
  const handleNavItemClick = (item: string) => {
    if (item === 'Home') navigate('/dashboard');
    if (item === 'Run') onPlay?.();
    if (item === 'Terminal') onToggleTerminal?.();
  };

  return (
    <div className="h-10 flex items-center bg-[#0b0b0f] text-[#f4f4f5] text-[13px] px-2 border-b border-border/20 select-none">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
        {menuItems.map((item) => (
          item === 'File' ? (
            <DropdownMenu key={item}>
              <DropdownMenuTrigger asChild>
                <button
                  className="px-3 h-7 flex items-center hover:bg-muted/20 rounded-md transition-colors cursor-default whitespace-nowrap outline-none"
                >
                  {item}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#252526] border-[#333333] text-[#cccccc] min-w-[200px] z-[110]">
                <DropdownMenuItem 
                    onClick={() => onNewFile?.("FILE")}
                    className="flex items-center gap-2 focus:bg-primary focus:text-white cursor-pointer"
                >
                  <FilePlus size={14} />
                  <span>New File</span>
                  <span className="ml-auto text-[10px] opacity-50">Ctrl+N</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                     onClick={() => onNewFile?.("FILE")}
                     className="flex items-center gap-2 focus:bg-primary focus:text-white cursor-pointer"
                >
                  <FileText size={14} />
                  <span>New Text File</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    onClick={() => onNewFile?.("FOLDER")}
                    className="flex items-center gap-2 focus:bg-primary focus:text-white cursor-pointer"
                >
                  <FolderPlus size={14} />
                  <span>New Folder</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#333333]" />
                <DropdownMenuItem className="flex items-center gap-2 focus:bg-primary focus:text-white cursor-pointer">
                  <span>Open...</span>
                  <span className="ml-auto text-[10px] opacity-50">Ctrl+O</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 focus:bg-primary focus:text-white cursor-pointer">
                  <span>Save</span>
                  <span className="ml-auto text-[10px] opacity-50">Ctrl+S</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              key={item}
              onClick={() => handleNavItemClick(item)}
              className={cn(
                "px-3 h-7 flex items-center hover:bg-muted/20 rounded-md transition-colors cursor-default whitespace-nowrap",
                item === 'Home' && "text-primary font-bold hover:text-primary/80"
              )}
            >
              {item}
            </button>
          )
        ))}
      </div>


      <div className="ml-auto flex items-center gap-4 px-4">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={onPlay}
            className={cn(
                "h-7 gap-2 text-[11px] font-bold uppercase transition-all",
                isPreviewRunning ? "text-destructive hover:text-destructive/80" : "text-green-500 hover:text-green-400"
            )}
        >
          {isPreviewRunning ? (
            <><Square className="h-3 w-3 fill-current" /> Stop</>
          ) : (
            <><Play className="h-3 w-3 fill-current" /> Run</>
          )}
        </Button>
        <div className="text-[10px] opacity-40 uppercase tracking-widest font-bold hidden sm:block">
            CodeSpace v1.0
        </div>
      </div>
    </div>
  )
}

