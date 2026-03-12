import Editor from '@monaco-editor/react'
import { X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorViewProps {
    files: any[]
    activeFileId: string
    setActiveFileId: (id: string) => void
    onCloseFile: (id: string) => void
    onContentChange: (value: string | undefined) => void
}

export default function EditorView({
    files,
    activeFileId,
    setActiveFileId,
    onCloseFile,
    onContentChange
}: EditorViewProps) {
    const activeFile = files.find(f => f.id === activeFileId)

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
            {/* Breadcrumbs */}
            <div className="h-6 flex items-center px-4 text-[11px] text-muted-foreground border-b border-border bg-background/50">
                <span className="hover:text-foreground cursor-pointer">src</span>
                <ChevronRight size={12} className="mx-1" />
                <span className="text-foreground">{activeFile?.name || 'No file open'}</span>
            </div>

            {/* Tabs */}
            <div className="flex bg-secondary/20 overflow-x-auto scrollbar-none border-b border-border h-9">
                {files.map((file) => (
                    <div
                        key={file.id}
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                            "group flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-border cursor-pointer transition-colors relative",
                            activeFileId === file.id
                                ? "bg-background text-foreground"
                                : "bg-secondary/10 text-muted-foreground hover:bg-secondary/30"
                        )}
                    >
                        {activeFileId === file.id && (
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary" />
                        )}
                        <span className="truncate text-xs flex-1">{file.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onCloseFile(file.id)
                            }}
                            className={cn(
                                "p-0.5 rounded-sm hover:bg-muted-foreground/20 text-muted-foreground transition-opacity",
                                activeFileId === file.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Editor Container */}
            <div className="flex-1 relative">
                {activeFile ? (
                    <Editor
                        theme="vs-dark"
                        language={activeFile.language}
                        value={activeFile.content}
                        onChange={onContentChange}
                        options={{
                            fontSize: 14,
                            fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16 },
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            contextmenu: true,
                        }}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-4xl font-black tracking-tighter">CODE SPACE</span>
                            <span className="text-xs">Open a file from the explorer to begin</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                            <span className="text-right">New File</span> <span className="text-foreground font-mono">Alt + N</span>
                            <span className="text-right">Run Code</span> <span className="text-foreground font-mono">F5</span>
                            <span className="text-right">Search</span> <span className="text-foreground font-mono">Ctrl + F</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
