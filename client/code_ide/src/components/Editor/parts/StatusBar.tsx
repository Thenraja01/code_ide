import { Globe, RefreshCw, CheckCircle2, Layers } from 'lucide-react'

interface StatusBarProps {
    language: string
    lineCount: number
}

export default function StatusBar({ language, lineCount }: StatusBarProps) {
    return (
        <div className="h-6 flex items-center justify-between px-3 bg-primary text-primary-foreground text-[11px] font-sans">
            <div className="flex items-center gap-4 h-full">
                <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors font-bold">
                    <Globe size={12} />
                    <span>main*</span>
                </div>
                <div className="flex items-center gap-1.5 hover:bg-white/10 h-full px-2 cursor-pointer transition-colors">
                    <RefreshCw size={12} />
                </div>
                <div className="flex items-center gap-1.5 hover:bg-white/10 h-full px-2 cursor-pointer transition-colors">
                    <CheckCircle2 size={12} />
                    <span>Ln {lineCount}, Col 1</span>
                </div>
            </div>

            <div className="flex items-center gap-4 h-full">
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer">
                    <span>Spaces: 2</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer">
                    <span>UTF-8</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer uppercase">
                    <span>{language}</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center cursor-pointer">
                    <Globe size={12} className="mr-1.5" />
                    <span>Live Share</span>
                </div>
                <div className="hover:bg-white/10 h-full px-2 flex items-center transition-colors">
                    <Layers size={12} />
                </div>
            </div>
        </div>
    )
}
