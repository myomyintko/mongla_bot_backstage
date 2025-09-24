import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Bold, Italic, Code, Link, List, ListOrdered, Quote, Undo, Redo,  Heading1, Heading2, Heading3 } from 'lucide-react'

// Toolbar component for formatting buttons
function Toolbar({ 
  onFormat, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  activeFormats
}: { 
  onFormat: (format: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  activeFormats: Set<string>
}) {
  const toolbarButtons = [
    { key: 'bold', icon: Bold, title: 'Bold', shortcut: 'Ctrl+B' },
    { key: 'italic', icon: Italic, title: 'Italic', shortcut: 'Ctrl+I' },
    { key: 'code', icon: Code, title: 'Code', shortcut: 'Ctrl+`' },
    { key: 'link', icon: Link, title: 'Link', shortcut: 'Ctrl+K' },
  ]

  const headingButtons = [
    { key: 'heading1', icon: Heading1, title: 'Heading 1', shortcut: 'Ctrl+1' },
    { key: 'heading2', icon: Heading2, title: 'Heading 2', shortcut: 'Ctrl+2' },
    { key: 'heading3', icon: Heading3, title: 'Heading 3', shortcut: 'Ctrl+3' },
  ]

  const listButtons = [
    { key: 'quote', icon: Quote, title: 'Quote', shortcut: 'Ctrl+Shift+>' },
    { key: 'list', icon: List, title: 'Bullet List', shortcut: 'Ctrl+Shift+8' },
    { key: 'orderedList', icon: ListOrdered, title: 'Numbered List', shortcut: 'Ctrl+Shift+7' },
  ]

  const ButtonGroup = ({ buttons }: { buttons: typeof toolbarButtons }) => (
    <div className="flex items-center gap-1">
      {buttons.map(({ key, icon: Icon, title, shortcut }) => {
        const isActive = activeFormats.has(key)
        const toggleText = isActive ? 'Remove' : 'Add'
        
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFormat(key)}
            className={`p-1.5 sm:p-2 rounded transition-colors ${
              isActive
                ? 'bg-blue-100 text-blue-600 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700'
                : 'hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
            }`}
            title={`${toggleText} ${title} (${shortcut})`}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="border-b border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800">
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <ButtonGroup buttons={toolbarButtons} />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          <ButtonGroup buttons={headingButtons} />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          <ButtonGroup buttons={listButtons} />
        </div>
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 sm:p-2 rounded transition-colors ${
              canUndo 
                ? 'hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 sm:p-2 rounded transition-colors ${
              canRedo 
                ? 'hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden p-2 space-y-2">
        {/* First row - Basic formatting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ButtonGroup buttons={toolbarButtons} />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded transition-colors ${
                canUndo 
                  ? 'hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                  : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
              }`}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded transition-colors ${
                canRedo 
                  ? 'hover:bg-gray-200 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-300'
                  : 'text-gray-300 cursor-not-allowed dark:text-gray-600'
              }`}
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>
        </div>
        
        {/* Second row - Headings and lists */}
        <div className="flex items-center gap-1">
          <ButtonGroup buttons={headingButtons} />
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
          <ButtonGroup buttons={listButtons} />
        </div>
      </div>
    </div>
  )
}

interface TelegramEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
  onInsertVariable?: (insertFn: (variable: string) => void) => void
}

// Debounce hook for performance optimization (available for future use)
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value)
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay)
//     return () => clearTimeout(handler)
//   }, [value, delay])
//   return debouncedValue
// }

// Character count component
function CharacterCount({ text }: { text: string }) {
  const count = text.length
  const maxLength = 4096 // Telegram message limit
  
  return (
    <div className={`text-xs px-2 py-1 ${
      count > maxLength * 0.9 
        ? 'text-red-600 dark:text-red-400' 
        : count > maxLength * 0.8 
        ? 'text-yellow-600 dark:text-yellow-400' 
        : 'text-gray-500 dark:text-gray-400'
    }`}>
      {count}/{maxLength}
    </div>
  )
}

export function TelegramEditor({ value, onChange, placeholder = "Enter your message...", height = 300, onInsertVariable }: TelegramEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([value || ''])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const formatDetectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Detect active formats at cursor position - optimized to prevent infinite loops
  const detectActiveFormats = useCallback((text: string, cursorPos: number) => {
    const formats = new Set<string>()
    
    // Early return if no text
    if (!text || cursorPos < 0) {
      setActiveFormats(formats)
      return
    }
    
    // Check for inline formatting (bold, italic, code, link)
    const inlineFormats = [
      { pattern: /\*([^*]+)\*/g, type: 'bold' },
      { pattern: /_([^_]+)_/g, type: 'italic' },
      { pattern: /`([^`]+)`/g, type: 'code' },
      { pattern: /\[([^\]]+)\]\([^)]+\)/g, type: 'link' }
    ]
    
    for (const { pattern, type } of inlineFormats) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        if (cursorPos >= match.index && cursorPos <= match.index + match[0].length) {
          formats.add(type)
          break
        }
      }
    }
    
    // Check for line-based formatting
    const lines = text.substring(0, cursorPos).split('\n')
    const currentLine = lines[lines.length - 1] || ''
    
    if (currentLine.startsWith('# ')) {
      formats.add('heading1')
    } else if (currentLine.startsWith('## ')) {
      formats.add('heading2')
    } else if (currentLine.startsWith('### ')) {
      formats.add('heading3')
    } else if (currentLine.startsWith('> ')) {
      formats.add('quote')
    } else if (currentLine.startsWith('• ')) {
      formats.add('list')
    } else if (/^\d+\.\s/.test(currentLine)) {
      formats.add('orderedList')
    }
    
    setActiveFormats(formats)
  }, [])
  
  // Debounced format detection to prevent excessive calls
  const debouncedDetectFormats = useCallback((text: string, cursorPos: number) => {
    if (formatDetectionTimeoutRef.current) {
      clearTimeout(formatDetectionTimeoutRef.current)
    }
    
    formatDetectionTimeoutRef.current = setTimeout(() => {
      detectActiveFormats(text, cursorPos)
    }, 50)
  }, [detectActiveFormats])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (formatDetectionTimeoutRef.current) {
        clearTimeout(formatDetectionTimeoutRef.current)
      }
    }
  }, [])

  // Insert variable at cursor position
  const insertVariable = useCallback((variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)
    
    const newText = beforeText + variable + afterText
    const newCursorPos = start + variable.length
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newText)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    onChange(newText)
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
        debouncedDetectFormats(newText, newCursorPos)
      }
    }, 0)
  }, [value, history, historyIndex, onChange, debouncedDetectFormats])

  // Expose insertVariable function to parent component
  useEffect(() => {
    if (onInsertVariable) {
      onInsertVariable(insertVariable)
    }
  }, [onInsertVariable, insertVariable])

  // Check if text at cursor position has specific formatting
  const hasFormatting = useCallback((text: string, start: number, end: number, format: string): boolean => {
    const selectedText = text.substring(start, end)
    
    switch (format) {
      case 'bold':
        return /^\*([^*]+)\*$/.test(selectedText)
      case 'italic':
        return /^_([^_]+)_$/.test(selectedText)
      case 'code':
        return /^`([^`]+)`$/.test(selectedText)
      case 'link':
        return /^\[([^\]]+)\]\([^)]+\)$/.test(selectedText)
      case 'heading1':
        // Check if the line starts with # and the selection includes the beginning of the line
        const lines = text.substring(0, start).split('\n')
        const currentLine = lines[lines.length - 1]
        return /^#\s/.test(currentLine) && selectedText.startsWith('# ')
      case 'heading2':
        const lines2 = text.substring(0, start).split('\n')
        const currentLine2 = lines2[lines2.length - 1]
        return /^##\s/.test(currentLine2) && selectedText.startsWith('## ')
      case 'heading3':
        const lines3 = text.substring(0, start).split('\n')
        const currentLine3 = lines3[lines3.length - 1]
        return /^###\s/.test(currentLine3) && selectedText.startsWith('### ')
      case 'quote':
        const lines4 = text.substring(0, start).split('\n')
        const currentLine4 = lines4[lines4.length - 1]
        return /^>\s/.test(currentLine4) && selectedText.startsWith('> ')
      case 'list':
        const lines5 = text.substring(0, start).split('\n')
        const currentLine5 = lines5[lines5.length - 1]
        return /^•\s/.test(currentLine5) && selectedText.startsWith('• ')
      case 'orderedList':
        const lines6 = text.substring(0, start).split('\n')
        const currentLine6 = lines6[lines6.length - 1]
        return /^\d+\.\s/.test(currentLine6) && /^\d+\.\s/.test(selectedText)
      default:
        return false
    }
  }, [])

  // Remove formatting from text
  const removeFormatting = useCallback((text: string, format: string): string => {
    switch (format) {
      case 'bold':
        return text.replace(/^\*([^*]+)\*$/, '$1')
      case 'italic':
        return text.replace(/^_([^_]+)_$/, '$1')
      case 'code':
        return text.replace(/^`([^`]+)`$/, '$1')
      case 'link':
        return text.replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1')
      case 'heading1':
        return text.replace(/^#\s/, '')
      case 'heading2':
        return text.replace(/^##\s/, '')
      case 'heading3':
        return text.replace(/^###\s/, '')
      case 'quote':
        return text.replace(/^>\s/, '')
      case 'list':
        return text.replace(/^•\s/, '')
      case 'orderedList':
        return text.replace(/^\d+\.\s/, '')
      default:
        return text
    }
  }, [])

  // Optimized formatting function with toggle support
  const handleFormat = useCallback((format: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)

    let formattedText = selectedText
    let newCursorPos = start

    // Check if we should toggle (remove) formatting
    const shouldToggle = hasFormatting(value, start, end, format)
    
    if (shouldToggle) {
      // Remove formatting
      formattedText = removeFormatting(selectedText, format)
      newCursorPos = start + formattedText.length
    } else {
      // Add formatting
      switch (format) {
        case 'bold':
          formattedText = selectedText ? `*${selectedText}*` : '**'
          newCursorPos = selectedText ? start + formattedText.length : start + 1
          break
        case 'italic':
          formattedText = selectedText ? `_${selectedText}_` : '__'
          newCursorPos = selectedText ? start + formattedText.length : start + 1
          break
        case 'code':
          formattedText = selectedText ? `\`${selectedText}\`` : '``'
          newCursorPos = selectedText ? start + formattedText.length : start + 1
          break
        case 'link':
          formattedText = selectedText ? `[${selectedText}](url)` : '[text](url)'
          newCursorPos = selectedText ? start + formattedText.length - 4 : start + 1
          break
        case 'heading1':
          formattedText = `# ${selectedText}`
          newCursorPos = start + formattedText.length
          break
        case 'heading2':
          formattedText = `## ${selectedText}`
          newCursorPos = start + formattedText.length
          break
        case 'heading3':
          formattedText = `### ${selectedText}`
          newCursorPos = start + formattedText.length
          break
        case 'quote':
          formattedText = `> ${selectedText}`
          newCursorPos = start + formattedText.length
          break
        case 'list':
          formattedText = `• ${selectedText}`
          newCursorPos = start + formattedText.length
          break
        case 'orderedList':
          formattedText = `1. ${selectedText}`
          newCursorPos = start + formattedText.length
          break
      }
    }

    const newText = beforeText + formattedText + afterText
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newText)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    onChange(newText)
    
    // Set cursor position
    setTimeout(() => {
      if (textarea) {
        textarea.setSelectionRange(newCursorPos, newCursorPos)
        textarea.focus()
        detectActiveFormats(newText, newCursorPos)
      }
    }, 0)
  }, [value, history, historyIndex, onChange, debouncedDetectFormats, hasFormatting, removeFormatting])

  // Optimized undo/redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }, [historyIndex, history, onChange])

  // Optimized text change handler - prevent infinite loops
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    
    // Only update if value actually changed
    if (newValue === value) return
    
    // Add to history only for significant changes (not every keystroke)
    const shouldAddToHistory = Math.abs(newValue.length - value.length) > 1 || 
                              newValue.length === 0 || 
                              value.length === 0
    
    if (shouldAddToHistory && newValue !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newValue)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
    
    onChange(newValue)
  }, [value, history, historyIndex, onChange])

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleFormat('bold')
          break
        case 'i':
          e.preventDefault()
          handleFormat('italic')
          break
        case 'k':
          e.preventDefault()
          handleFormat('link')
          break
        case '`':
          e.preventDefault()
          handleFormat('code')
          break
        case '1':
          e.preventDefault()
          handleFormat('heading1')
          break
        case '2':
          e.preventDefault()
          handleFormat('heading2')
          break
        case '3':
          e.preventDefault()
          handleFormat('heading3')
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
          break
        case 'y':
          e.preventDefault()
          handleRedo()
          break
      }
    } else if (e.shiftKey) {
      switch (e.key) {
        case '>':
          e.preventDefault()
          handleFormat('quote')
          break
        case '8':
          e.preventDefault()
          handleFormat('list')
          break
        case '7':
          e.preventDefault()
          handleFormat('orderedList')
          break
      }
    }

    // Detect active formats on cursor movement - debounced
    if (textarea && textarea.selectionStart !== undefined) {
      debouncedDetectFormats(value, textarea.selectionStart)
    }
  }, [handleFormat, handleUndo, handleRedo, value, debouncedDetectFormats])

  // Memoized computed values
  const canUndo = useMemo(() => historyIndex > 0, [historyIndex])
  const canRedo = useMemo(() => historyIndex < history.length - 1, [historyIndex])

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden dark:border-gray-600 w-full max-w-full">
      <Toolbar 
        onFormat={handleFormat}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        activeFormats={activeFormats}
      />
        <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onSelect={() => {
            const textarea = textareaRef.current
            if (textarea && textarea.selectionStart !== undefined) {
              debouncedDetectFormats(value, textarea.selectionStart)
            }
          }}
          placeholder={placeholder}
          className="w-full p-3 sm:p-4 outline-none resize-none font-mono text-sm leading-relaxed bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-[120px] sm:min-h-[150px]"
                style={{ height: `${height}px` }}
          maxLength={4096}
        />
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
          <CharacterCount text={value} />
        </div>
        </div>
    </div>
  )
}
