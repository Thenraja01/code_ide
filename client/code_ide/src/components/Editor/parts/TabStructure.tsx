import { useEditor } from "@/hooks/useEditor";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { X, FileText } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

interface TabStructureProps {
  projectId: Id<"projects">;
}

export default function TabStructure({ projectId }: TabStructureProps) {
  const { openTab, activeTabId, setActiveTab, closeTab, previewTabId } = useEditor(projectId);
  const files = useQuery(api.files.getFilesByProject, { projectId });

  if (!openTab || openTab.length === 0) return null;

  return (
    <div className="flex items-center bg-[#09090b] border-b border-[#222] overflow-x-auto no-scrollbar h-9">
      {openTab.map((fileId) => {
        const file = files?.find((f) => f._id === fileId);
        const isActive = activeTabId === fileId;
        const isPreview = previewTabId === fileId;

        return (
          <div
            key={fileId}
            onClick={() => setActiveTab(fileId)}
            className={cn(
              "flex items-center gap-2 px-3 h-full border-r border-[#222] cursor-pointer min-w-[120px] max-w-[200px] transition-colors group relative",
              isActive ? "bg-[#1e1e20] text-zinc-100" : "bg-[#0f0f11] text-zinc-400 hover:bg-[#151517]",
              isActive && "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-500"
            )}
          >
            <FileText size={14} className={cn(isActive ? "text-blue-400" : "text-zinc-500")} />
            <span className={cn(
              "text-[12px] truncate flex-1",
              isPreview && "italic"
            )}>
              {file?.name || "Loading..."}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(fileId);
              }}
              className="p-0.5 rounded hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
