'use client'

import { useState, useEffect } from 'react'
import ActivityBar from './parts/ActivityBar'
import Sidebar from './parts/Sidebar'
import EditorTabs from './parts/EditorTabs'
import MonacoEditor from './parts/MonacoEditor'
import StatusBar from './parts/StatusBar'
import TopBar from './parts/TopBar'
import AIPanel from './parts/AIPanel'
import NewFileDialog from './parts/NewFileDialog'
import TerminalPanel from '../Terminal/TerminalPanel'
import PreviewPanel from '../Preview/PreviewPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { useFilesQuery, useUpdateFileMutation, useCreateFileMutation } from '@/hooks/useFile.hooks'
import { useInitializeProjectMutation } from '@/hooks/useProject.hooks'
import { useCommandMutation, useStartPreviewMutation, useStopPreviewMutation } from '@/hooks/useExecution.hooks'
import { toast } from 'sonner'

type FileType = {
  id: string
  name: string
  language: string
  content: string
}

export default function CodeEditor() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: projectFiles = [] } = useFilesQuery(projectId || '')
  const { mutate: initializeProject } = useInitializeProjectMutation()
  
  // Execution Hooks
  const { mutate: executeCommand } = useCommandMutation()
  const { mutate: startPreview, isPending: isStartingPreview } = useStartPreviewMutation()
  const { mutate: stopPreview } = useStopPreviewMutation()
  const { mutate: createFile } = useCreateFileMutation()
  const { mutate: updateFile } = useUpdateFileMutation(projectId)

  const [files, setFiles] = useState<FileType[]>([])
  const [activeFileId, setActiveFileId] = useState('')
  const [activeTab, setActiveTab] = useState('explorer')
  const [showTerminal, setShowTerminal] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false)
  const [creationType, setCreationType] = useState<"FILE" | "FOLDER">("FILE")

  // Auto-initialize project on load
  useEffect(() => {
    if (projectId) {
      initializeProject(projectId);
    }
  }, [projectId, initializeProject]);

  useEffect(() => {
    if (projectFiles.length > 0) {
      const mappedFiles: (FileType & { type: string })[] = projectFiles
        .map((f: any) => ({
          id: f.id,
          name: f.name,
          language: f.name.endsWith('.jsx') || f.name.endsWith('.tsx') ? 'javascript' : (f.name.endsWith('.css') ? 'css' : 'javascript'),
          content: f.content || '',
          type: f.type
        }))
      
      // Merge local changed files to prevent reset during debounced typing updates
      setFiles(prev => {
        if (prev.length === 0) return mappedFiles;
        return mappedFiles.map(mf => {
          const existing = prev.find(pf => pf.id === mf.id);
          // Prefer local content if it exists to avoid cursor jumping
          return existing ? { ...mf, content: existing.content } : mf;
        });
      });
      if (!activeFileId && mappedFiles.length > 0) {
        setActiveFileId(mappedFiles[0].id)
      }
    }
  }, [projectFiles])

  const activeFile = files.find((f) => f.id === activeFileId)

  useEffect(() => {
    if (!activeFile) return;
    const timer = setTimeout(() => {
      const original = projectFiles.find((f: any) => f.id === activeFile.id);
      if (original && original.content !== activeFile.content) {
        updateFile({ id: activeFile.id, content: activeFile.content });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeFile?.content, activeFile?.id, projectFiles, updateFile]);

  const handleCommand = (command: string) => {
    if (!projectId) return;
    executeCommand({ projectId, command }, {
        onSuccess: (data) => toast.success(data.message),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to execute command")
    });
  }

  const handleTogglePreview = () => {
    if (!projectId) return;
    if (showPreview) {
        stopPreview(projectId);
        setShowPreview(false);
        setPreviewUrl('');
    } else {
        // Find framework from files (package.json check would be better)
        const framework = projectFiles.find((f: any) => f.name === 'package.json') ? 'react' : 'vanilla';
        startPreview({ projectId, framework }, {
            onSuccess: (data) => {
                setPreviewUrl(data.url);
                setShowPreview(true);
            },
            onError: (err: any) => toast.error(err.response?.data?.message || "Failed to start preview")
        });
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0b0f] text-[#f4f4f5] overflow-hidden font-sans select-none">
      <TopBar 
        onPlay={handleTogglePreview} 
        isPreviewRunning={showPreview} 
        onToggleTerminal={() => setShowTerminal(!showTerminal)} 
        onNewFile={(type) => {
            setCreationType(type);
            setIsNewFileDialogOpen(true);
        }}
      />


      <div className="flex flex-1 overflow-hidden relative">
        <ActivityBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAiOpen={isAiOpen}
          toggleAi={() => setIsAiOpen(!isAiOpen)}
        />

        <AnimatePresence>
          {activeTab !== 'none' && (
            <Sidebar
              activeTab={activeTab}
              files={files}
              activeFileId={activeFileId}
              setActiveFileId={setActiveFileId}
              onNewFile={(type) => {
                  setCreationType(type);
                  setIsNewFileDialogOpen(true);
              }}
              onCloseSidebar={() => setActiveTab('none')}
            />
          )}
        </AnimatePresence>

        <div className="flex flex-1 min-w-0 bg-[#0b0b0f]">
          <div className="flex flex-col flex-1 border-r border-border/20">
            <EditorTabs
              files={files}
              activeFileId={activeFileId}
              setActiveFileId={setActiveFileId}
              onCloseFile={(id) => setFiles(f => f.filter(x => x.id !== id))}
            />

            <div className="flex-1 relative overflow-hidden">
              {activeFile ? (
                <MonacoEditor
                  language={activeFile.language}
                  content={activeFile.content}
                  onContentChange={(val) => setFiles(prev => prev.map(f => f.id === activeFileId ? {...f, content: val || ''} : f))}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-50">
                  <span className="text-4xl font-black tracking-tighter">CODE SPACE</span>
                  <span className="text-xs">Open a file from the explorer to begin</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {showTerminal && (
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 260 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-border/20"
                >
                  <TerminalPanel projectId={projectId || ''} onCommand={handleCommand} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live Preview Pane */}
          {showPreview && (
            <div className="w-1/3 min-w-[350px] p-2 bg-background/50 backdrop-blur-sm">
                <PreviewPanel 
                    url={previewUrl} 
                    isLoading={isStartingPreview}
                    onRefresh={() => {}} 
                    onStop={handleTogglePreview}
                />
            </div>
          )}
        </div>

        <AIPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} currentCode={activeFile?.content || ''} />
      </div>

      <StatusBar
        language={activeFile?.language || 'plain text'}
        lineCount={activeFile?.content.split('\n').length || 0}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
      />

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
        type={creationType}
        onCreate={(name, type) => {
            if (!projectId) return;
            createFile({
                projectId,
                name,
                type,
                content: '',
                parentId: null
            }, {
                onSuccess: (newFile) => {
                    if (newFile.type === 'FILE' && newFile.id) {
                        setActiveFileId(newFile.id);
                    }
                }
            });
        }}
      />
    </div>
  )
}
