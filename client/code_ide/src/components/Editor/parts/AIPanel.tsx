
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, Play, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { useQuery, useMutation } from 'convex/react'
import { api } from "@convex/_generated/api"
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

interface AIPanelProps {
  isOpen: boolean
  onClose?: () => void
  isEmbedded?: boolean
  fileId?: string
  sessionId?: string
  projectId?: string
  injectedUrlContent?: string
}

export default function AIPanel({
  isOpen,
  onClose,
  isEmbedded,
  fileId,
  sessionId,
  projectId,
  injectedUrlContent
}: AIPanelProps) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [isThinking, setIsThinking] = useState(false)

  const createFile = useMutation(api.files.createFile)
  const updateFileContent = useMutation(api.files.updateFileContent)
  const deleteFile = useMutation(api.files.deleteFile)


  const chunks = useQuery(api.aiStreams.getChunks, {
    fileId: fileId || "none",
    sessionId: sessionId || "none"
  })

  const projectFiles = useQuery(
    api.files.getFilesByProject,
    projectId ? { projectId: projectId as any } : 'skip'
  )

  const jobStatus = useQuery(api.jobStatus.getStatus, {
    fileId: fileId || "none",
    sessionId: sessionId || "none"
  })

  const updateJobStatus = useMutation(api.jobStatus.updateStatus)

  const aiOutputBuffer = useMemo(() => {
    if (!chunks?.length) return ''
    return chunks.map((c: any) => c.chunk).join('')
  }, [chunks])

  const handleGenerate = async () => {
    if (!input.trim() || !fileId || !sessionId) return;

    setMessages(prev => [...prev, { role: 'user', content: `Generate code: ${input}` }]);
    const currentInput = input;
    setInput('');

    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/').replace(/\/$/, '');
      await updateJobStatus({ fileId, sessionId, status: "generating", userId: user?.firebaseUid });

      await axios.post(`${baseUrl}/ai/generate`, {
        prompt: currentInput,
        fileId: fileId,
        sessionId: sessionId,
        language: "javascript" 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success("Code generation started in background");
    } catch (error: any) {
      console.error("Generate error", error);
      toast.error("Failed to start generation");
      await updateJobStatus({ fileId, sessionId, status: "error", userId: user?.firebaseUid });
    }
  }

  const handleSend = async (customAction?: string) => {
    const action = customAction || input
    if (!action.trim()) return

    setMessages(prev => [
      ...prev,
      { role: 'user', content: action }
    ])

    setInput('')

    try {
      await updateJobStatus({ fileId, sessionId, status: "running", userId: user?.firebaseUid })
      setIsThinking(true)

      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/ai/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prompt: action,
          sessionId,
          context: injectedUrlContent || ""
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullContent;
          return newMessages;
        });

        // ---------------- PARSE TOOL CALLS (Markers) ----------------
        if (chunk.includes('CREATE_FILE:')) {
          toast.info('AI is creating a file...');
        }
      }

      setIsThinking(false);

      // Final pass to apply file changes
      applyFileOperations(fullContent);

    } catch (error: any) {
      console.error('Agent error:', error)

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `AI failed: ${error.message}`
        }
      ])

      await updateJobStatus({
        fileId,
        sessionId,
        status: "error",
        userId: user?.firebaseUid
      }).catch(() => { })
    }
  }

  const applyFileOperations = async (content: string) => {
    // 1. Parse CREATE_FILE
    const createMatches = content.matchAll(/CREATE_FILE: ([\w\/\.-]+)\n```\w*\n([\s\S]*?)```/g);
    for (const match of createMatches) {
      const [_, path, code] = match;
      const fileName = path.split('/').pop() || 'newfile.txt';
      try {
        await createFile({
          name: fileName,
          content: code.trim(),
          projectId: projectId as any,
          userId: user?.firebaseUid
        });
        toast.success(`Created file: ${path}`);
      } catch (e) { console.error(e); }
    }

    // 2. Parse EDIT_FILE (Search/Replace style)
    const editMatches = content.matchAll(/EDIT_FILE: ([\w\/\.-]+)\n<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>>/g);
    for (const match of editMatches) {
      const [_, path, searchContent, replaceContent] = match;
      const fileName = path.split('/').pop();

      // Find the file by name in our project files
      const file = projectFiles?.find((f: any) => f.name === fileName);
      if (file) {
        const currentContent = file.content || "";
        if (currentContent.includes(searchContent.trim())) {
          const newContent = currentContent.replace(searchContent.trim(), replaceContent.trim());
          await updateFileContent({
            fileId: file._id,
            content: newContent,
            userId: user?.firebaseUid
          });
          toast.success(`Updated file: ${path}`);
        } else {
          toast.error(`Could not find search block in ${path}`);
        }
      }
    }

    const deleteMatches = content.matchAll(/DELETE_FILE: ([\w\/\.-]+)/g);
    for (const match of deleteMatches) {
      const [_, path] = match;
      const fileName = path.split('/').pop();
      const file = projectFiles?.find((f: any) => f.name === fileName);
      if (file) {
        try {
          await deleteFile({ fileId: file._id, userId: user?.firebaseUid });
          toast.warning(`Deleted file: ${path}`);
        } catch (e) {
          console.error("Delete error:", e);
          toast.error(`Failed to delete ${path}`);
        }
      }
    }
  }

  const handleAbort = async () => {
    if (!sessionId) return

    try {
      await updateJobStatus({
        fileId,
        sessionId,
        status: "cancelled",
        userId: user?.firebaseUid
      })

      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/').replace(/\/$/, '');
      await fetch(
        `${baseUrl}/ai/abort`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        }
      )

      toast.info("AI stopped")

    } catch (e) {
      console.error('Abort error:', e)
    }
  }

  const PanelContent = (
    <div className={cn(
      "flex flex-col h-full bg-[#0f0f11]",
      !isEmbedded && "w-[340px] shadow-2xl border-l border-zinc-800"
    )}>

      <div className="h-10 border-b border-[#1e1e1e] flex items-center justify-between px-3 bg-zinc-950/20">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
            <Sparkles size={12} className="text-blue-400" />
          </div>
          <span className="text-[10px] py-6 font-black uppercase tracking-[0.2em] text-zinc-400">Assistant</span>
        </div>

        {!isEmbedded && (
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "text-sm max-w-[90%]",
              msg.role === "user"
                ? "ml-auto text-blue-200"
                : "text-zinc-300"
            )}
          >
            {msg.content}
          </div>
        ))}

        {aiOutputBuffer && (
          <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-500">
            {aiOutputBuffer}
          </div>
        )}

        {(jobStatus?.status === "running" || jobStatus?.status === "generating" || isThinking) && !aiOutputBuffer && (
          <div className="flex flex-col gap-3 py-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 text-xs text-blue-400 font-medium">
              <div className="relative">
                <Sparkles size={16} className="animate-pulse text-blue-400" />
                <Loader2 size={24} className="absolute inset-0 -m-1 text-blue-500/20 animate-spin" />
              </div>
              <span className="tracking-wide">AI Agent is thinking...</span>
            </div>
            <div className="h-[2px] w-full bg-zinc-900 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* STATUS */}
        {jobStatus?.status === "running" && aiOutputBuffer && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-4 border-t border-zinc-800/50">
            <Loader2 className="animate-spin w-3 h-3" />
            <span>Streaming response...</span>
            <button onClick={handleAbort} className="underline hover:text-white transition-colors ml-auto">
              Stop
            </button>
          </div>
        )}

        {jobStatus?.status === "cancelled" && (
          <div className="text-xs text-zinc-600">
            Generation stopped
          </div>
        )}

        {jobStatus?.status === "error" && (
          <div className="text-xs text-red-500">
            Error occurred
          </div>
        )}

      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-[#222] bg-[#111]">
        {/* SUGGESTED ACTIONS */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: "Explain", icon: Sparkles, prompt: "Explain how this code works in detail." },
            { label: "Fix Bugs", icon: Zap, prompt: "Find and fix any potential bugs or edge cases in this code." },
            { label: "Refactor", icon: Play, prompt: "Refactor this code for better readability and performance." },
            { label: "Generate Code", icon: Sparkles, onClick: handleGenerate, prompt: "" }
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => action.onClick ? action.onClick() : handleSend(action.prompt)}
              disabled={jobStatus?.status === "running" || jobStatus?.status === "generating"}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e1e1e] border border-[#333] text-[10px] text-zinc-400 hover:text-white hover:border-blue-500/50 transition-all active:scale-95 disabled:opacity-50"
            >
              <action.icon size={10} />
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            id="ai-input"
            aria-label="Ask AI"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-[#1e1e1e] text-sm p-2 rounded border border-[#333] transition-colors focus:border-blue-500/50 outline-none"
            placeholder="Ask AI..."
            disabled={jobStatus?.status === "running"}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || jobStatus?.status === "running" || jobStatus?.status === "generating"}
            className="px-3 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            <Play size={12} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  )

  // ---------------- MODES ----------------
  if (isEmbedded) return isOpen ? PanelContent : null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="absolute right-0 top-0 bottom-0 z-30"
        >
          {PanelContent}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
