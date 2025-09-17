import { useState, useEffect } from 'react'
import { PropSchema, ComponentSchema } from '@/main/services/ComponentSchemaService'

interface DynamicPropsEditorProps {
    componentName: string
    componentSchema?: ComponentSchema
    currentProps: Record<string, any>
    onPropsChange: (props: Record<string, any>) => void
}

export function DynamicPropsEditor({
    componentName,
    componentSchema,
    currentProps,
    onPropsChange
}: DynamicPropsEditorProps) {
    const [props, setProps] = useState<Record<string, any>>(currentProps)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        setProps(currentProps)
    }, [currentProps])

    const handlePropChange = (propName: string, value: any) => {
        const newProps = { ...props, [propName]: value }
        setProps(newProps)

        // Validate the prop
        if (componentSchema) {
            const propSchema = componentSchema.props.find(p => p.name === propName)
            if (propSchema) {
                validateProp(propSchema, value)
            }
        }

        onPropsChange(newProps)
    }

    const validateProp = (propSchema: PropSchema, value: any) => {
        // Basic validation logic
        const newErrors = { ...errors }

        if (propSchema.required && (!value || value === '')) {
            newErrors[propSchema.name] = `${propSchema.name} is required`
        } else {
            delete newErrors[propSchema.name]
        }

        setErrors(newErrors)
    }

    const renderPropInput = (propSchema: PropSchema) => {
        const value = props[propSchema.name] ?? propSchema.defaultValue ?? ''
        const hasError = errors[propSchema.name]

        switch (propSchema.type) {
            case 'string':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handlePropChange(propSchema.name, e.target.value)}
                        placeholder={propSchema.description}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                )

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handlePropChange(propSchema.name, parseFloat(e.target.value) || 0)}
                        placeholder={propSchema.description}
                        min={propSchema.validation?.min}
                        max={propSchema.validation?.max}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                )

            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handlePropChange(propSchema.name, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {propSchema.description || propSchema.name}
                        </span>
                    </div>
                )

            case 'enum':
                return (
                    <select
                        value={value}
                        onChange={(e) => handlePropChange(propSchema.name, e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        {propSchema.options?.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )

            case 'color':
                return (
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => handlePropChange(propSchema.name, e.target.value)}
                            className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handlePropChange(propSchema.name, e.target.value)}
                            placeholder={propSchema.description}
                            className={`flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                    </div>
                )

            case 'file':
                return (
                    <div className="space-y-2">
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    // Convert to data URL for preview
                                    const reader = new FileReader()
                                    reader.onload = (event) => {
                                        handlePropChange(propSchema.name, event.target?.result)
                                    }
                                    reader.readAsDataURL(file)
                                }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {value && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                File selected: {value.substring(0, 50)}...
                            </div>
                        )}
                    </div>
                )

            case 'object':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value)
                                    handlePropChange(propSchema.name, parsed)
                                } catch {
                                    handlePropChange(propSchema.name, e.target.value)
                                }
                            }}
                            placeholder={propSchema.description || 'Enter JSON object'}
                            rows={3}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono ${hasError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Enter as JSON object
                        </div>
                    </div>
                )

            case 'array':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={Array.isArray(value) ? value.join('\n') : ''}
                            onChange={(e) => {
                                const arrayValue = e.target.value.split('\n').filter(item => item.trim())
                                handlePropChange(propSchema.name, arrayValue)
                            }}
                            placeholder={propSchema.description || 'Enter array items (one per line)'}
                            rows={3}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                                }`}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Enter array items (one per line)
                        </div>
                    </div>
                )

            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handlePropChange(propSchema.name, e.target.value)}
                        placeholder={propSchema.description}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${hasError
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                            }`}
                    />
                )
        }
    }

    if (!componentSchema) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No schema available for {componentName}</p>
                <p className="text-sm mt-1">Component schemas will be loaded automatically</p>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {componentSchema.displayName}
                </h3>
                {componentSchema.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {componentSchema.description}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                {componentSchema.props.map((propSchema) => (
                    <div key={propSchema.name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {propSchema.name}
                            {propSchema.required && (
                                <span className="text-red-500 ml-1">*</span>
                            )}
                        </label>

                        {renderPropInput(propSchema)}

                        {propSchema.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {propSchema.description}
                            </p>
                        )}

                        {errors[propSchema.name] && (
                            <p className="text-xs text-red-500">
                                {errors[propSchema.name]}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Examples section */}
            {componentSchema.examples && Object.keys(componentSchema.examples).length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Examples
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(componentSchema.examples).map(([name, exampleProps]) => (
                            <button
                                key={name}
                                onClick={() => {
                                    const newProps = { ...props, ...exampleProps }
                                    setProps(newProps)
                                    onPropsChange(newProps)
                                }}
                                className="w-full text-left px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                            >
                                <div className="font-medium capitalize">{name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {Object.entries(exampleProps).map(([key, value]) =>
                                        `${key}: ${typeof value === 'string' ? `"${value}"` : String(value)}`
                                    ).join(', ')}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
