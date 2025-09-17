import { useState, useEffect, useRef } from 'react'

interface TailwindClassesEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

interface TailwindSuggestion {
    class: string
    category: string
    description?: string
    score: number
}

export function TailwindClassesEditor({
    value,
    onChange,
    placeholder = "Enter Tailwind classes...",
    className = ""
}: TailwindClassesEditorProps) {
    const [suggestions, setSuggestions] = useState<TailwindSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [cursorPosition, setCursorPosition] = useState(0)
    const [currentQuery, setCurrentQuery] = useState('')

    const inputRef = useRef<HTMLTextAreaElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Get current word at cursor position
    const getCurrentWord = (text: string, cursorPos: number): string => {
        const beforeCursor = text.substring(0, cursorPos)
        const afterCursor = text.substring(cursorPos)

        // Find word boundaries
        const beforeMatch = beforeCursor.match(/\S+$/)
        const afterMatch = afterCursor.match(/^\S+/)

        const before = beforeMatch ? beforeMatch[0] : ''
        const after = afterMatch ? afterMatch[0] : ''

        return before + after
    }

    // Search for Tailwind suggestions
    const searchSuggestions = async (query: string) => {
        if (!query.trim() || !window.electronAPI?.tailwind?.searchClasses) {
            setSuggestions([])
            return
        }

        try {
            const result = await window.electronAPI.tailwind.searchClasses(query, 10)
            if (result.success && result.data) {
                setSuggestions(result.data)
                setShowSuggestions(true)
                setSelectedIndex(0)
            }
        } catch (error) {
            console.error('Error searching Tailwind classes:', error)
        }
    }

    // Validate current classes
    const validateClasses = async (classString: string) => {
        if (!window.electronAPI?.tailwind?.validateClassString) {
            return
        }

        try {
            const result = await window.electronAPI.tailwind.validateClassString(classString)
            if (result.success) {
                setValidationErrors(result.data?.errors || [])
            }
        } catch (error) {
            console.error('Error validating Tailwind classes:', error)
        }
    }

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        const newCursorPosition = e.target.selectionStart

        onChange(newValue)
        setCursorPosition(newCursorPosition)

        // Get current word for suggestions
        const currentWord = getCurrentWord(newValue, newCursorPosition)
        setCurrentQuery(currentWord)

        // Search for suggestions if there's a current word
        if (currentWord.trim()) {
            searchSuggestions(currentWord)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }

        // Validate classes
        validateClasses(newValue)
    }

    // Handle key down for suggestions navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showSuggestions || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (suggestions[selectedIndex]) {
                    insertSuggestion(suggestions[selectedIndex].class)
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                break
            case 'Tab':
                e.preventDefault()
                if (suggestions[selectedIndex]) {
                    insertSuggestion(suggestions[selectedIndex].class)
                }
                break
        }
    }

    // Insert suggestion into input
    const insertSuggestion = (suggestion: string) => {
        if (!inputRef.current) return

        const textarea = inputRef.current
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const currentWord = getCurrentWord(value, cursorPosition)

        // Replace current word with suggestion
        const beforeWord = value.substring(0, start - currentWord.length)
        const afterWord = value.substring(end)
        const newValue = beforeWord + suggestion + afterWord

        onChange(newValue)
        setShowSuggestions(false)
        setSuggestions([])

        // Focus back to input
        setTimeout(() => {
            textarea.focus()
            const newCursorPos = beforeWord.length + suggestion.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
        }, 0)
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: TailwindSuggestion) => {
        insertSuggestion(suggestion.class)
    }

    // Handle input blur (hide suggestions after delay)
    const handleInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false)
        }, 200)
    }

    // Handle input focus
    const handleInputFocus = () => {
        if (currentQuery.trim()) {
            searchSuggestions(currentQuery)
        }
    }

    // Format class string with syntax highlighting
    const formatClassString = (classString: string): string => {
        return classString
            .split(/\s+/)
            .map(cls => {
                if (validationErrors.some(error => error.includes(cls))) {
                    return `❌ ${cls}`
                }
                return cls
            })
            .join(' ')
    }

    return (
        <div className={`relative ${className}`}>
            {/* Input */}
            <textarea
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                placeholder={placeholder}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono resize-none ${validationErrors.length > 0
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                rows={3}
            />

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                        <div key={index} className="text-xs text-red-500 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {error}
                        </div>
                    ))}
                </div>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.class}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${index === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-blue-600 dark:text-blue-400">
                                    {suggestion.class}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {suggestion.category}
                                </span>
                            </div>
                            {suggestion.description && (
                                <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {suggestion.description}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-2 flex flex-wrap gap-1">
                <button
                    onClick={() => onChange('')}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                    Clear
                </button>
                <button
                    onClick={() => {
                        const formatted = value.split(/\s+/).filter(cls => cls.trim()).join(' ')
                        onChange(formatted)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                    Format
                </button>
                <button
                    onClick={() => {
                        const classes = value.split(/\s+/).filter(cls => cls.trim())
                        const sorted = classes.sort()
                        onChange(sorted.join(' '))
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                >
                    Sort
                </button>
            </div>

            {/* Class Count */}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {value.split(/\s+/).filter(cls => cls.trim()).length} classes
            </div>
        </div>
    )
}
