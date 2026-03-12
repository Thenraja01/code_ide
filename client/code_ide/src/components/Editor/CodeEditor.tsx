'use client'

import { useState } from 'react'
import ActivityBar from './parts/ActivityBar'
import Sidebar from './parts/Sidebar'
import EditorView from './parts/EditorView'
import Terminal from './parts/Terminal'
import StatusBar from './parts/StatusBar'
import NewFileDialog from './parts/NewFileDialog'

type FileType = {
  id: string
  name: string
  language: string
  content: string
}

export default function CodeEditor() {
  const [files, setFiles] = useState<FileType[]>([
    {
      id: '1',
      name: 'index.js',
      language: 'javascript',
      content: "// Welcome to CodeSpace IDE\nconsole.log('Build something amazing!');\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet('Developer'));",
    },
  ])

  const [activeFileId, setActiveFileId] = useState('1')
  const [activeTab, setActiveTab] = useState('explorer')
  const [showTerminal, setShowTerminal] = useState(false)
  const [previewOutput, setPreviewOutput] = useState('')
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)

  const activeFile = files.find((f) => f.id === activeFileId)

  const handleCreateNewFile = (name: string, language: string) => {
    const newFile: FileType = {
      id: Date.now().toString(),
      name,
      language,
      content: '',
    }
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
    if (activeTab === 'none') setActiveTab('explorer')
  }

  const handleUpdateFileContent = (value: string | undefined) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === activeFileId ? { ...file, content: value || '' } : file
      )
    )
  }

  const handleCloseFile = (id: string) => {
    const filtered = files.filter((file) => file.id !== id)
    setFiles(filtered)
    if (id === activeFileId && filtered.length > 0) {
      setActiveFileId(filtered[0].id)
    } else if (filtered.length === 0) {
      setActiveFileId('')
    }
  }

  const handleRunCode = () => {
    setShowTerminal(true)
    setPreviewOutput('Executing code...\n')

    // Virtual console capture
    const logs: string[] = []
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' '))
    }

    try {
      // Simple evaluation with captured console
      const executeCode = new Function('console', activeFile?.content || '')
      const result = executeCode(customConsole)

      const finalOutput = logs.length > 0 ? logs.join('\n') : (result !== undefined ? String(result) : 'Code executed with no output.')
      setPreviewOutput(finalOutput)
    } catch (err: any) {
      setPreviewOutput(`Execution Error:\n${err.message}`)
    }
  }

  const handleToggleTab = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab('none')
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden font-sans select-none">
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar - Global Navigation */}
        <ActivityBar
          activeTab={activeTab}
          setActiveTab={handleToggleTab}
          onRun={handleRunCode}
        />

        {/* Sidebar - Contextual Views */}
        <Sidebar
          activeTab={activeTab}
          files={files}
          activeFileId={activeFileId}
          setActiveFileId={setActiveFileId}
          onNewFile={() => setIsNewFileDialogOpen(true)}
          onCloseSidebar={() => setActiveTab('none')}
        />

        <div className="flex flex-col flex-1 min-w-0">
          {/* Main Editor Area */}
          <EditorView
            files={files}
            activeFileId={activeFileId}
            setActiveFileId={setActiveFileId}
            onCloseFile={handleCloseFile}
            onContentChange={handleUpdateFileContent}
          />

          {/* Terminal / Output */}
          <Terminal
            output={previewOutput}
            isVisible={showTerminal}
            onClose={() => setShowTerminal(false)}
            onClear={() => setPreviewOutput('')}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        language={activeFile?.language || 'plain text'}
        lineCount={activeFile?.content.split('\n').length || 0}
      />

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        onCreate={handleCreateNewFile}
      />
    </div>
  )
}
