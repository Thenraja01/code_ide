import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface NewFileDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (name: string, language: string) => void
}

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', ext: '.js' },
    { id: 'typescript', name: 'TypeScript', ext: '.ts' },
    { id: 'python', name: 'Python', ext: '.py' },
    { id: 'html', name: 'HTML', ext: '.html' },
    { id: 'css', name: 'CSS', ext: '.css' },
    { id: 'json', name: 'JSON', ext: '.json' },
]

export default function NewFileDialog({ isOpen, onClose, onCreate }: NewFileDialogProps) {
    const [name, setName] = useState('')
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0])

    useEffect(() => {
        if (isOpen) {
            setName('')
            setSelectedLang(LANGUAGES[0])
        }
    }, [isOpen])

    const handleCreate = () => {
        if (!name.trim()) return
        const fullName = name.includes('.') ? name : `${name}${selectedLang.ext}`
        onCreate(fullName, selectedLang.id)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-2 font-semibold">
                                <FileText size={18} className="text-primary" />
                                <span>Create New File</span>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">File Name</label>
                                <Input
                                    autoFocus
                                    placeholder="index"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    className="bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {LANGUAGES.map((lang) => (
                                        <div
                                            key={lang.id}
                                            onClick={() => setSelectedLang(lang)}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer border transition-all",
                                                selectedLang.id === lang.id
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-secondary/20 border-transparent hover:border-border text-muted-foreground"
                                            )}
                                        >
                                            <span className="text-sm font-medium">{lang.name}</span>
                                            <span className="text-[10px] opacity-60 font-mono">{lang.ext}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary/10 flex justify-end gap-3 mt-4">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={!name.trim()}>Create File</Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
