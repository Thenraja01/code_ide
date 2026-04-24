import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilePlus, FolderPlus, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface NewFileDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, type: "FILE" | "FOLDER") => void
  type: "FILE" | "FOLDER"
}

export default function NewFileDialog({
  isOpen,
  onClose,
  onCreate,
  type
}: NewFileDialogProps) {

  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // ---------------- FOCUS HANDLING (CURSOR STYLE) ----------------
  useEffect(() => {
    if (!isOpen) return

    setName('')
    setError('')

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [isOpen])

  // ---------------- ICON ----------------
  const Icon = useMemo(() => {
    if (type === 'FOLDER') return FolderPlus
    return name.includes('.') ? FileText : FilePlus
  }, [type, name])

  // ---------------- CREATE ----------------
  const handleCreate = () => {
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Name cannot be empty')
      return
    }

    if (trimmed.length < 2) {
      setError('Name too short')
      return
    }

    onCreate(trimmed, type)
    onClose()
  }

  // ---------------- KEY HANDLER ----------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()

    if (e.key === 'Enter') {
      handleCreate()
    }

    if (e.key === 'Escape') {
      onClose()
    }
  }

  const placeholder =
    type === 'FOLDER'
      ? "Folder Name"
      : "File Name (e.g. index.tsx)"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-2">

          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40"
          />

          {/* DIALOG */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="relative w-full max-w-[600px] bg-[#252526] shadow-2xl overflow-hidden border border-[#454545] rounded-sm"
          >

            {/* HEADER */}
            <div className="flex items-center px-3 py-1 bg-[#37373d]/50 text-[#cccccc] text-[10px] uppercase tracking-wider font-bold">
              New {type.toLowerCase()}
            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2 p-2 px-3">
              <Icon size={16} className={type === 'FOLDER' ? "text-blue-400" : "text-purple-400"} />

              <Input
                ref={inputRef}
                placeholder={placeholder}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                className="bg-[#3c3c3c] border-none focus-visible:ring-0 text-white placeholder:text-[#858585] h-8 text-[13px]"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="px-3 pb-1 text-[10px] text-red-400">
                {error}
              </div>
            )}

            {/* FOOTER */}
            <div className="px-3 pb-2 text-[10px] text-[#858585] flex justify-between">
              <span>Enter to create • Esc to cancel</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
