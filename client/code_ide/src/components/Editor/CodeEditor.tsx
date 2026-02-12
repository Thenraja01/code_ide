'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, File, Play, Save, Plus, Terminal as TerminalIcon, X } from 'lucide-react'

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
      content: "console.log('Hello CodeSpace');",
    },
  ])

  const [activeFileId, setActiveFileId] = useState('1')
  const [showTerminal, setShowTerminal] = useState(true)
  const [previewOutput, setPreviewOutput] = useState('')

  const activeFile = files.find((f) => f.id === activeFileId)

  const createNewFile = () => {
    const newFile: FileType = {
      id: Date.now().toString(),
      name: `file${files.length + 1}.js`,
      language: 'javascript',
      content: '',
    }
    setFiles([...files, newFile])
    setActiveFileId(newFile.id)
  }

  const updateFileContent = (value: string | undefined) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === activeFileId ? { ...file, content: value || '' } : file
      )
    )
  }

  const closeFile = (id: string) => {
    const filtered = files.filter((file) => file.id !== id)
    setFiles(filtered)
    if (id === activeFileId && filtered.length > 0) {
      setActiveFileId(filtered[0].id)
    }
  }

  const runCode = () => {
    try {
      const result = eval(activeFile?.content || '')
      setPreviewOutput(String(result ?? 'Code executed successfully.'))
    } catch (err: any) {
      setPreviewOutput(err.message)
    }
  }

  const saveFile = () => {
    const blob = new Blob([activeFile?.content || ''], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = activeFile?.name || 'file.txt'
    link.click()
  }

  const openFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const newFile: FileType = {
        id: Date.now().toString(),
        name: file.name,
        language: 'javascript',
        content: event.target?.result as string,
      }
      setFiles((prev) => [...prev, newFile])
      setActiveFileId(newFile.id)
    }
    reader.readAsText(file)
  }

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <TopBar
        onRun={runCode}
        onSave={saveFile}
        onNew={createNewFile}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
        onOpen={openFile}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar files={files} setActive={setActiveFileId} active={activeFileId} />

        <div className="flex flex-col flex-1">
          <Tabs
            files={files}
            active={activeFileId}
            setActive={setActiveFileId}
            closeFile={closeFile}
          />

          <div className="flex-1">
            <Editor
              theme="vs-dark"
              language={activeFile?.language}
              value={activeFile?.content}
              onChange={updateFileContent}
              height="100%"
            />
          </div>

          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 150 }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card border-t border-border p-3 text-sm overflow-auto"
              >
                <div className="text-muted-foreground">Terminal</div>
                <div className="mt-2 whitespace-pre-wrap">{previewOutput}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// -----------------------------
// Top Bar
// -----------------------------

function TopBar({ onRun, onSave, onNew, onToggleTerminal, onOpen }: any) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
      <div className="flex  items-center gap-2">
        <button onClick={onNew} className="btn-primary flex items-center">
          <Plus size={16} /> New
        </button>
        <label className="btn-secondary  flex items-center cursor-pointer">
          Open
          <input type="file" hidden onChange={onOpen} />
        </label>
        <button onClick={onSave} className="btn-secondary  flex items-center">
          <Save size={16} /> Save
        </button>
        <button onClick={onRun} className="btn-primary  flex items-center">
          <Play size={16} /> Run
        </button>
      </div>

      <button onClick={onToggleTerminal} className="btn-secondary">
        <TerminalIcon size={16} /> Terminal
      </button>
    </div>
  )
}

// -----------------------------
// Sidebar (File Tree)
// -----------------------------

function Sidebar({ files, setActive, active }: any) {
  return (
    <div className="w-56 bg-secondary border-r border-border p-3">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
        <Folder size={16} /> Explorer
      </div>
      <div className="space-y-1">
        {files.map((file: any) => (
          <motion.div
            whileHover={{ x: 4 }}
            key={file.id}
            onClick={() => setActive(file.id)}
            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-sm ${
              active === file.id ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <File size={14} /> {file.name}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// -----------------------------
// Tabs
// -----------------------------

function Tabs({ files, active, setActive, closeFile }: any) {
  return (
    <div className="flex bg-card border-b border-border overflow-x-auto">
      {files.map((file: any) => (
        <div
          key={file.id}
          className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer border-r border-border ${
            active === file.id ? 'bg-background' : ''
          }`}
          onClick={() => setActive(file.id)}
        >
          {file.name}
          <X
            size={14}
            onClick={(e) => {
              e.stopPropagation()
              closeFile(file.id)
            }}
          />
        </div>
      ))}
    </div>
  )
}