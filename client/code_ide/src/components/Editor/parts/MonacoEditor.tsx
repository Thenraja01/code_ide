import Editor, { type OnMount } from '@monaco-editor/react'
import { useCallback, useMemo, useRef } from 'react'
import axios from 'axios'

interface MonacoEditorProps {
  language: string
  content: string
  onContentChange: (value: string | undefined) => void
}

export default function MonacoEditor({
  language,
  content,
  onContentChange
}: MonacoEditorProps) {

  const monacoRef = useRef<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<any>(null)

  const handleChange = useCallback(
    (value: string | undefined) => {
      onContentChange(value)
    },
    [onContentChange]
  )

  const handleEditorDidMount: OnMount = (_editor, monaco) => {
    monacoRef.current = monaco
    
    // Register AI Autocomplete Provider
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', ' ', '(', '{'],
      provideCompletionItems: async (model: any, position: any) => {
        // 1. Debounce the request
        return new Promise((resolve) => {
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

          debounceTimerRef.current = setTimeout(async () => {
            // 2. Cancel previous request if still pending
            if (abortControllerRef.current) {
              abortControllerRef.current.abort()
            }
            abortControllerRef.current = new AbortController()

            // 3. Trim context: Send only some lines before the cursor
            const startLine = Math.max(1, position.lineNumber - 50)
            const textUntilPosition = model.getValueInRange({
              startLineNumber: startLine,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            })

            if (textUntilPosition.trim().length < 5) {
              resolve({ suggestions: [] })
              return
            }

            try {
              const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/ai/autocomplete`,
                {
                  prompt: textUntilPosition,
                  language: language
                },
                {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                  signal: abortControllerRef.current.signal
                }
              )

              const suggestion = response.data.suggestion
              if (!suggestion) {
                resolve({ suggestions: [] })
                return
              }

              // 4. Merge AI suggestions (Cursor-aware)
              resolve({
                suggestions: [
                  {
                    label: 'AI Suggestion',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: suggestion,
                    detail: 'AI21 Labs',
                    range: {
                      startLineNumber: position.lineNumber,
                      endLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endColumn: position.column,
                    },
                    sortText: '0000' // Ensure it appears at the top if possible
                  },
                ],
              })
            } catch (error: any) {
              if (error.name === 'AbortError') {
                console.log('Autocomplete request aborted')
              } else {
                console.error("Autocomplete fetch error", error)
              }
              resolve({ suggestions: [] })
            } finally {
              abortControllerRef.current = null
            }
          }, 300) // 300ms debounce
        })
      },
    })
  }

  const options = useMemo(
    () => ({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 16, bottom: 16 },
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      renderLineHighlight: 'all',
      contextmenu: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      bracketPairColorization: { enabled: true },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalSliderSize: 10,
        horizontalSliderSize: 10,
        useShadows: false
      },
      overviewRulerLanes: 3,
      renderWhitespace: 'selection',
      suggest: {
        preview: true,
        showSnippets: true,
        shareSuggestSelections: true,
      }
    }),
    []
  )

  return (
    <div className="flex-1 relative h-full bg-[#0f0f11]">
      <Editor
        theme="vs-dark"
        language={language}
        value={content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={options}
        loading={
          <div className="h-full flex items-center justify-center text-[#858585]">
            Loading Editor...
          </div>
        }
      />
    </div>
  )
}
