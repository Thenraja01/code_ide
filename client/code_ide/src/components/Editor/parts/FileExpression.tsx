import { useState, useMemo } from "react"
import { ChevronsRightIcon, FilePlus, FolderPlus, ChevronRight, ChevronDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useQuery, useMutation } from "convex/react"
import CreateFile from "./Create-file"
import { useAuth } from "@/context/AuthContext"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"



interface FileTreeProps {
    files: any[]
    parentId?: Id<"files">
    level: number
    onSelect: (fileId: string) => void
    activeFileId?: string
    onAdd: (type: "file" | "folder", parentId?: Id<"files">) => void
    onDelete: (fileId: Id<"files">) => void
    creating: { type: "file" | "folder", parentId?: Id<"files"> } | null
    onSubmitCreate: (name: string) => void
    onCancelCreate: () => void
}

function FileTree({
    files,
    parentId,
    level,
    onSelect,
    activeFileId,
    onAdd,
    onDelete,
    creating,
    onSubmitCreate,
    onCancelCreate
}: FileTreeProps) {
    const items = useMemo(() =>
        files.filter(f => f.parentId === parentId)
            .sort((a, b) => {
                if (a.type !== b.type) return a.type === "folder" ? -1 : 1
                return a.name.localeCompare(b.name)
            }),
        [files, parentId])

    return (
        <div className="flex flex-col">
            {items.map(item => (
                <FileItem
                    key={item._id}
                    item={item}
                    level={level}
                    allFiles={files}
                    onSelect={onSelect}
                    activeFileId={activeFileId}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    creating={creating}
                    onSubmitCreate={onSubmitCreate}
                    onCancelCreate={onCancelCreate}
                />
            ))}
        </div>
    )
}

function FileItem({
    item,
    level,
    allFiles,
    onSelect,
    activeFileId,
    onAdd,
    onDelete,
    creating,
    onSubmitCreate,
    onCancelCreate
}: {
    item: any,
    level: number,
    allFiles: any[],
    onSelect: (fileId: string) => void,
    activeFileId?: string,
    onAdd: (type: "file" | "folder", parentId?: Id<"files">) => void,
    onDelete: (fileId: Id<"files">) => void,
    creating: { type: "file" | "folder", parentId?: Id<"files"> } | null,
    onSubmitCreate: (name: string) => void,
    onCancelCreate: () => void
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const isFolder = item.type === "folder"
    const isActive = activeFileId === item._id

    const isTargetOfCreation = creating?.parentId === item._id

    return (
        <div className="flex flex-col">
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 hover:bg-zinc-800/50 cursor-pointer group transition-colors relative",
                    isActive && "bg-zinc-800 text-white border-l-2 border-blue-500"
                )}
                style={{ paddingLeft: `${(level + 1) * 12}px` }}
                onClick={() => {
                    if (isFolder) setIsExpanded(!isExpanded)
                    else onSelect(item._id)
                }}
            >
                {isFolder ? (
                    isExpanded ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />
                ) : (
                    <div className="w-[14px]" />
                )}

                {isFolder ? (
                    <FolderIcon folderName={item.name} className="w-4 h-4 shrink-0" />
                ) : (
                    <FileIcon fileName={item.name} autoAssign className="w-4 h-4 shrink-0" />
                )}

                <span className={cn(
                    "text-[12px] truncate flex-1",
                    isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-300"
                )}>
                    {item.name}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isFolder && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true);
                                    onAdd("file", item._id)
                                }}
                                className="p-0.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300"
                            >
                                <FilePlus size={12} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(true);
                                    onAdd("folder", item._id)
                                }}
                                className="p-0.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300"
                            >
                                <FolderPlus size={12} />
                            </button>
                        </>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item._id) }}
                        className="p-0.5 hover:bg-zinc-700 rounded text-zinc-500 hover:text-red-400"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {isFolder && (isExpanded || isTargetOfCreation) && (
                <div className="flex flex-col">
                    {isTargetOfCreation && creating && (
                        <div style={{ paddingLeft: `${(level + 2) * 12}px` }} className="py-0.5">
                            <CreateFile
                                type={creating.type}
                                onSubmit={onSubmitCreate}
                                onCancel={onCancelCreate}
                            />
                        </div>
                    )}
                    <FileTree
                        files={allFiles}
                        parentId={item._id}
                        level={level + 1}
                        onSelect={onSelect}
                        activeFileId={activeFileId}
                        onAdd={onAdd}
                        onDelete={onDelete}
                        creating={creating}
                        onSubmitCreate={onSubmitCreate}
                        onCancelCreate={onCancelCreate}
                    />
                </div>
            )}
        </div>
    )
}

export default function FileExpression({
    projectId,
    onFileSelect,
    activeFileId
}: {
    projectId: Id<"projects">,
    onFileSelect: (fileId: string) => void,
    activeFileId?: string
}) {
    const [isOpen, setIsOpen] = useState(true)
    const { user } = useAuth()

    const project = useQuery(api.projects.getProjectById, { projectId })
    const projectFiles = useQuery(api.files.getFilesByProject, {
        projectId,
        userId: user?.firebaseUid
    })

    const [creating, setCreating] = useState<{ type: "file" | "folder", parentId?: Id<"files"> } | null>(null)

    const createFile = useMutation(api.files.createFile)
    const createFolder = useMutation(api.files.createFolder)
    const deleteFile = useMutation(api.files.deleteFile)

    const handleCreate = async (name: string) => {
        if (!creating) return
        const { type, parentId } = creating
        setCreating(null)

        try {
            if (type === "file") {
                await createFile({
                    projectId,
                    name,
                    content: "",
                    parentId,
                    userId: user?.firebaseUid
                })
            } else if (type === "folder") {
                await createFolder({
                    projectId,
                    name,
                    parentId,
                    userId: user?.firebaseUid
                })
            }
        } catch (error) {
            console.error("Failed to create:", error)
        }
    }

    const handleDelete = async (fileId: Id<"files">) => {
        if (window.confirm("Are you sure you want to delete this?")) {
            await deleteFile({ fileId, userId: user?.firebaseUid })
        }
    }

    return (
        <div className="flex flex-col gap-1 select-none h-full overflow-hidden">
            <div
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-zinc-800/50 cursor-pointer group transition-colors sticky top-0 bg-zinc-900 z-10"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChevronsRightIcon
                    size={14}
                    className={cn(
                        "transition-transform duration-200 text-zinc-500",
                        isOpen ? "rotate-90" : ""
                    )}
                />
                <span className="text-[11px] font-bold text-zinc-300 uppercase truncate flex-1 tracking-tight">
                    {project?.title ?? "Loading..."}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(true)
                            setCreating({ type: "file" })
                        }}
                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        title="New File"
                    >
                        <FilePlus size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(true)
                            setCreating({ type: "folder" })
                        }}
                        className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white"
                        title="New Folder"
                    >
                        <FolderPlus size={14} />
                    </button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                {isOpen && (
                    <div className="pb-10">
                        {creating && !creating.parentId && (
                            <div className="pl-4 py-0.5">
                                <CreateFile
                                    type={creating.type}
                                    onSubmit={handleCreate}
                                    onCancel={() => setCreating(null)}
                                />
                            </div>
                        )}

                        <FileTree
                            files={projectFiles || []}
                            parentId={undefined}
                            level={0}
                            onSelect={onFileSelect}
                            activeFileId={activeFileId}
                            onAdd={(type, parentId) => setCreating({ type, parentId })}
                            onDelete={handleDelete}
                            creating={creating}
                            onSubmitCreate={handleCreate}
                            onCancelCreate={() => setCreating(null)}
                        />
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}