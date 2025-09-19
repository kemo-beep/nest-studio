import React, { useState, useEffect } from 'react'
import { TailwindParser, ParsedClasses } from '../../shared/services/TailwindParser'

interface TailwindClassEditorProps {
    className: string
    onClassNameChange: (newClassName: string) => void
}

export function TailwindClassEditor({ className, onClassNameChange }: TailwindClassEditorProps) {
    const [parsedClasses, setParsedClasses] = useState<ParsedClasses | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(className)

    const parser = TailwindParser.getInstance()

    useEffect(() => {
        if (className) {
            const parsed = parser.parseClasses(className)
            setParsedClasses(parsed)
            setEditValue(className)
        }
    }, [className])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = () => {
        onClassNameChange(editValue)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditValue(className)
        setIsEditing(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    const renderStyleGroup = (title: string, styles: any[], color: string) => {
        if (styles.length === 0) return null

        return (
            <div className="mb-4">
                <h4 className={`text-sm font-medium ${color} mb-2`}>{title}</h4>
                <div className="space-y-1">
                    {styles.map((style, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                                {style.property}
                            </span>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-800 dark:text-gray-200">
                                    {style.value}
                                </span>
                                {style.responsive && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">
                                        {style.responsive}
                                    </span>
                                )}
                                {style.important && (
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1 rounded">
                                        !
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (isEditing) {
        return (
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tailwind Classes
                </label>
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm font-mono"
                    rows={3}
                    placeholder="Enter Tailwind classes..."
                />
                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tailwind Classes
                </label>
                <button
                    onClick={handleEdit}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    Edit
                </button>
            </div>

            {/* Raw classes display */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <code className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">
                    {className || 'No classes'}
                </code>
            </div>

            {/* Parsed styles */}
            {parsedClasses && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parsed Styles
                    </h4>

                    {renderStyleGroup('Typography', parsedClasses.typography, 'text-blue-600 dark:text-blue-400')}
                    {renderStyleGroup('Spacing', parsedClasses.spacing, 'text-green-600 dark:text-green-400')}
                    {renderStyleGroup('Layout', parsedClasses.layout, 'text-purple-600 dark:text-purple-400')}
                    {renderStyleGroup('Colors', parsedClasses.colors, 'text-orange-600 dark:text-orange-400')}
                    {renderStyleGroup('Effects', parsedClasses.effects, 'text-pink-600 dark:text-pink-400')}
                    {renderStyleGroup('Other', parsedClasses.styles, 'text-gray-600 dark:text-gray-400')}

                    {/* Responsive summary */}
                    {Object.keys(parsedClasses).some(key =>
                        Array.isArray(parsedClasses[key as keyof ParsedClasses]) &&
                        parsedClasses[key as keyof ParsedClasses].some((style: any) => style.responsive)
                    ) && (
                            <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                <h5 className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                                    Responsive Breakpoints
                                </h5>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                    This element has responsive styles. Hover over the breakpoint badges above to see which styles apply at different screen sizes.
                                </div>
                            </div>
                        )}
                </div>
            )}

            {/* Class suggestions */}
            <div className="mt-4">
                <h5 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Quick Add
                </h5>
                <div className="flex flex-wrap gap-1">
                    {['text-sm', 'text-center', 'font-bold', 'p-4', 'bg-blue-500', 'rounded-lg', 'shadow-md'].map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => {
                                const newClasses = className ? `${className} ${suggestion}` : suggestion
                                onClassNameChange(newClasses)
                            }}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                        >
                            + {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
