import { X, FileCode, FileJson, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface EditorTabsProps {
  files: any[]
  activeFileId: string
  setActiveFileId: (id: string) => void
  onCloseFile: (id: string) => void
}

const getFileIcon = (name: string) => {
  if (name.endsWith('.js') || name.endsWith('.ts')) return <FileCode size={14} className="text-yellow-400" />
  if (name.endsWith('.tsx') || name.endsWith('.jsx')) return <FileCode size={14} className="text-blue-400" />
  if (name.endsWith('.json')) return <FileJson size={14} className="text-orange-400" />
  return <FileText size={14} className="text-gray-400" />
}

export default function EditorTabs({ files, activeFileId, setActiveFileId, onCloseFile }: EditorTabsProps) {
  return (
    <div className="flex bg-[#252526] overflow-x-auto scrollbar-none h-9 border-b border-[#1e1e1e]">
      {files.map((file) => (
        <div
          key={file.id}
          onClick={() => setActiveFileId(file.id)}
          className={cn(
            "group flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer transition-colors relative h-full",
            activeFileId === file.id
              ? "bg-[#1e1e1e] text-white"
              : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]"
          )}
        >
          {activeFileId === file.id && (
            <motion.div
              layoutId="tabUnderline"
              className="absolute top-0 left-0 w-full h-[1px] bg-purple-500"
            />
          )}
          {getFileIcon(file.name)}
          <span className="truncate text-[13px] flex-1">{file.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCloseFile(file.id)
            }}
            className={cn(
              "p-0.5 rounded-sm hover:bg-[#454545] text-[#969696] hover:text-white transition-all",
              activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
