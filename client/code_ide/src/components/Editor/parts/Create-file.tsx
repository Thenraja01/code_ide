import { useState } from "react"
import { Input } from "@/components/ui/input"
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils"

interface CreateFileInputProps {
  type: "file" | "folder"
  onSubmit: (name: string) => void
  onCancel: () => void
}

export default function CreateFile({ type, onSubmit, onCancel }: CreateFileInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    const trimValue = value.trim()
    if (trimValue) {
      onSubmit(trimValue)
    } else {
      onCancel()
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 bg-zinc-800/30 min-w-0">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {type === "file" ? (
          <FileIcon 
            fileName={value || "unnamed"} 
            autoAssign
            className="w-4 h-4 shrink-0" 
          />
        ) : (
          <FolderIcon 
            folderName={value || "unnamed"} 
            className="w-4 h-4 shrink-0" 
          />
        )}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit()
            if (e.key === 'Escape') onCancel()
          }}
          className="h-6 bg-transparent border-none focus-visible:ring-0 p-0 text-[13px] text-zinc-200 w-full"
          autoFocus
          placeholder={type === "file" ? "file name..." : "folder name..."}
        />
      </div>
    </div>
  )
}