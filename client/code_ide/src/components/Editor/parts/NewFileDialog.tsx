import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilePlus, FolderPlus, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface NewFileDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (name: string, type: "FILE" | "FOLDER") => void
    type: "FILE" | "FOLDER"
}

export default function NewFileDialog({ isOpen, onClose, onCreate, type }: NewFileDialogProps) {
    const [name, setName] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setName('')
            // Use a slight delay to ensure the input is mounted before focusing
            const timer = setTimeout(() => inputRef.current?.focus(), 50)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleCreate = () => {
        if (!name.trim()) return
        onCreate(name, type)
        onClose()
    }

    const placeholder = type === 'FOLDER' ? "Folder Name" : "File Name (e.g. index.html)"
    const Icon = type === 'FOLDER' ? FolderPlus : (name.includes('.') ? FileText : FilePlus)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-2">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        className="relative w-full max-w-[600px] bg-[#252526] shadow-2xl overflow-hidden border border-[#454545] rounded-sm"
                    >
                        <div className="flex items-center px-3 py-1 bg-[#37373d]/50 text-[#cccccc] text-[10px] uppercase tracking-wider font-bold">
                            <span>New {type.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 px-3">
                            <Icon size={16} className={type === 'FOLDER' ? "text-blue-400" : "text-purple-400"} />
                            <Input
                                ref={inputRef}
                                placeholder={placeholder}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate()
                                    if (e.key === 'Escape') onClose()
                                }}
                                className="bg-[#3c3c3c] border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-[#858585] h-8 text-[13px] rounded-sm ring-1 ring-transparent focus:ring-purple-500/50"
                            />
                        </div>
                        <div className="px-3 pb-2 text-[10px] text-[#858585] flex justify-between">
                            <span>Press Enter to confirm or Esc to cancel</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
