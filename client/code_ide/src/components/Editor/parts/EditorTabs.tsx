import {
  X,
  FileCode,
  FileJson,
  FileText,
  FileCode2
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'

interface FileItem {
  id: string
  name: string
}

interface EditorTabsProps {
  files: FileItem[]
  activeFileId: string
  setActiveFileId: (id: string) => void
  onCloseFile: (id: string) => void
}

const getFileIcon = (ext?: string) => {
  switch (ext) {
    case 'js':
    case 'jsx':
      return <FileCode size={14} className="text-amber-400" />

    case 'ts':
    case 'tsx':
      return <FileCode2 size={14} className="text-blue-400" />

    case 'json':
      return <FileJson size={14} className="text-orange-400" />

    case 'css':
      return <FileText size={14} className="text-cyan-400" />

    default:
      return <FileText size={14} className="text-zinc-500" />
  }
}

export default function EditorTabs({
  files,
  activeFileId,
  setActiveFileId,
  onCloseFile
}: EditorTabsProps) {

  const containerRef = useRef<HTMLDivElement | null>(null)

  const fileList = useMemo(() => files, [files])

  // Auto-scroll active tab into view (Cursor-like UX)
  useEffect(() => {
    const active = document.getElementById(`tab-${activeFileId}`)
    if (active) {
      active.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      })
    }
  }, [activeFileId])

  if (!fileList.length) return null

  return (
    <div
      ref={containerRef}
      className="flex bg-zinc-950 overflow-x-auto h-10 border-b border-zinc-800/50"
    >
      {fileList.map((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        const isActive = activeFileId === file.id

        return (
          <div
            key={file.id}
            id={`tab-${file.id}`}
            onClick={() => setActiveFileId(file.id)}
            className={cn(
              "group flex items-center gap-2 px-4 min-w-[120px] max-w-[200px] border-r border-zinc-800 cursor-pointer relative h-full transition-all",
              isActive
                ? "bg-zinc-900 text-white"
                : "bg-zinc-950 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
            )}
          >

            {/* ACTIVE INDICATOR */}
            {isActive && (
              <motion.div
                layoutId="tabAccent"
                className="absolute top-0 left-0 w-full h-[2px] bg-blue-500"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}

            {/* ICON */}
            {getFileIcon(ext)}

            {/* NAME */}
            <span className="truncate text-xs font-medium flex-1">
              {file.name}
            </span>

            {/* CLOSE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseFile(file.id)
              }}
              className={cn(
                "p-1 rounded-md transition-opacity",
                "hover:bg-zinc-700/40 hover:text-white",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <X size={12} />
            </button>

          </div>
        )
      })}
    </div>
  )
}
