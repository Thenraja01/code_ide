import { Terminal as TerminalIcon, X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TerminalProps {
    output: string
    isVisible: boolean
    onClose: () => void
    onClear: () => void
}

export default function Terminal({ output, isVisible, onClose, onClear }: TerminalProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 180 }}
                    exit={{ height: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="bg-card border-t border-border flex flex-col min-h-0"
                >
                    <div className="h-8 flex items-center justify-between px-4 border-b border-border bg-secondary/20">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-foreground border-b border-primary h-full px-1 pt-1 tracking-wider uppercase">
                                <TerminalIcon size={12} />
                                <span>Output</span>
                            </div>
                            <div className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer pt-1 tracking-wider uppercase">
                                Debug Console
                            </div>
                            <div className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer pt-1 tracking-wider uppercase">
                                Terminal
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={onClear}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                                title="Clear Output"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-sm whitespace-pre-wrap selection:bg-primary/30">
                        {output ? (
                            <div className="text-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
                                {output}
                            </div>
                        ) : (
                            <div className="text-muted-foreground italic opacity-50">
                                Wait for code execution output...
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
