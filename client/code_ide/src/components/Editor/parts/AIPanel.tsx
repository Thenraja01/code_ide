import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, Bug, Lightbulb, Code2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAI } from '@/hooks/useAI'

interface AIPanelProps {
  isOpen: boolean
  onClose: () => void
  currentCode: string
}

export default function AIPanel({ isOpen, onClose, currentCode }: AIPanelProps) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant. I can help you debug, edit, or suggest improvements for your code. Select an action below or ask me anything!' }
  ])

  const aiMutation = useAI();

  const handleSend = async (customAction?: string) => {
    const actionToUse = customAction || input;
    if (!actionToUse.trim()) return

    const userMsg = { role: 'user' as const, content: actionToUse }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    try {
      const response = await aiMutation.mutateAsync({
        code: currentCode,
        action: actionToUse
      });

      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}. Make sure your FastAPI server is running on port 8000.` }])
    }
  }

  const quickActions = [
    { label: 'Debug Code', icon: Bug, action: 'Analyze this code for bugs and suggest fixes.' },
    { label: 'Improvement', icon: Lightbulb, action: 'Suggest performance and readability improvements for this code.' },
    { label: 'Explain', icon: Code2, action: 'Explain how this code works in detail.' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-[320px] border-l border-[#333333] bg-[#1e1e1e] flex flex-col h-full overflow-hidden shadow-2xl relative z-30"
        >
          <div className="h-10 border-b border-[#333333] flex items-center justify-between px-4 bg-[#252526]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#cccccc]">
              <Sparkles size={14} className="text-purple-400" />
              <span>AI Assistant</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#333333] rounded-sm text-[#cccccc] transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-1 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 rounded-lg text-[13px] leading-relaxed whitespace-pre-wrap",
                    msg.role === 'user'
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-[#2d2d2d] text-[#cccccc] border border-[#333333]"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {aiMutation.isPending && (
              <div className="flex items-center gap-2 text-[#858585] text-xs animate-pulse italic">
                <Loader2 size={14} className="animate-spin" />
                AI is thinking...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#333333] bg-[#252526] space-y-3">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleSend(item.action)}
                  disabled={aiMutation.isPending}
                  className="flex items-center gap-1.5 px-2 py-1 bg-[#333333] hover:bg-[#444] rounded-md text-[11px] text-[#cccccc] border border-transparent hover:border-[#555] transition-all disabled:opacity-50"
                >
                  <item.icon size={12} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me to debug or edit..."
                disabled={aiMutation.isPending}
                className="w-full bg-[#3c3c3c] border border-[#333333] rounded-md px-3 py-2 text-[13px] text-[#cccccc] outline-none focus:border-purple-500 transition-all placeholder:text-[#888] disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={aiMutation.isPending || !input.trim()}
                className="absolute right-2 top-1.5 p-1 text-[#888] hover:text-purple-400 transition-colors disabled:opacity-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
