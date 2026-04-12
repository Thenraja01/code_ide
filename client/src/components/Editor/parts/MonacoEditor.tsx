import Editor from '@monaco-editor/react'

interface MonacoEditorProps {
  language: string
  content: string
  onContentChange: (value: string | undefined) => void
}

export default function MonacoEditor({ language, content, onContentChange }: MonacoEditorProps) {
  return (
    <div className="flex-1 relative h-full">
      <Editor
        theme="vs-dark"
        language={language}
        value={content}
        onChange={onContentChange}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 20 },
          cursorBlinking: 'expand',
          smoothScrolling: true,
          contextmenu: true,
          renderLineHighlight: 'all',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalSliderSize: 10,
            horizontalSliderSize: 10,
            useShadows: false
          }
        }}
        loading={<div className="h-full flex items-center justify-center text-[#858585]">Loading Editor...</div>}
      />
    </div>
  )
}
