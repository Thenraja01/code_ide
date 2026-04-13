import { Terminal, RefreshCw, CheckCircle2, GitBranch } from 'lucide-react'

interface StatusBarProps {
    language: string
    lineCount: number
    onToggleTerminal: () => void
}

export default function StatusBar({ language, lineCount, onToggleTerminal }: StatusBarProps) {
    return (
        <div className="h-6 flex items-center justify-between px-3 bg-[#007acc] text-white text-[11px] font-sans transition-colors">
            <div className="flex items-center gap-4 h-full">
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors font-medium">
                    <GitBranch size={12} />
                    <span>main*</span>
                </div>
                <div className="flex items-center gap-1.5 hover:bg-white/10 h-full px-2 cursor-pointer transition-colors">
                    <RefreshCw size={12} className="animate-spin-slow" />
                </div>
                <div className="flex items-center gap-1.5 h-full px-2 transition-colors">
                    <CheckCircle2 size={12} />
                    <span>Ln {lineCount}, Col 1</span>
                </div>
            </div>

            <div className="flex items-center gap-2 h-full">
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer transition-colors">
                    <span>Spaces: 2</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer transition-colors">
                    <span>UTF-8</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer uppercase transition-colors">
                    <span>{language}</span>
                </div>
                <button 
                  onClick={onToggleTerminal}
                  className="hover:bg-white/20 bg-white/5 h-full px-3 flex items-center transition-all gap-1.5 text-white active:scale-95"
                >
                    <Terminal size={12} />
                    <span>Terminal</span>
                </button>
            </div>
        </div>
    )
}
