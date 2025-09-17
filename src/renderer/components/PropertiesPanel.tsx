import { useState } from 'react'
import { ProjectInfo } from '@/shared/types'

interface PropertiesPanelProps {
    project: ProjectInfo
}

export function PropertiesPanel({ project }: PropertiesPanelProps) {
    const [activeTab, setActiveTab] = useState<'props' | 'styles' | 'layout' | 'responsive'>('props')

    return (
        <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('props')}
                    className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'props'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Props
                </button>
                <button
                    onClick={() => setActiveTab('styles')}
                    className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'styles'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Styles
                </button>
                <button
                    onClick={() => setActiveTab('layout')}
                    className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'layout'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Layout
                </button>
                <button
                    onClick={() => setActiveTab('responsive')}
                    className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === 'responsive'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Responsive
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'props' && <PropsEditor project={project} />}
                {activeTab === 'styles' && <StylesEditor project={project} />}
                {activeTab === 'layout' && <LayoutEditor project={project} />}
                {activeTab === 'responsive' && <ResponsiveEditor project={project} />}
            </div>
        </div>
    )
}

function PropsEditor({ project: _project }: { project: ProjectInfo }) {
    return (
        <div className="p-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Component Type
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>Button</option>
                        <option>Input</option>
                        <option>Card</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Variant
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>default</option>
                        <option>outline</option>
                        <option>ghost</option>
                        <option>link</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Size
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>sm</option>
                        <option>default</option>
                        <option>lg</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Children
                    </label>
                    <input
                        type="text"
                        placeholder="Button text"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="disabled"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="disabled" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Disabled
                    </label>
                </div>
            </div>
        </div>
    )
}

function StylesEditor({ project: _project }: { project: ProjectInfo }) {
    const [tailwindClasses, setTailwindClasses] = useState('')

    return (
        <div className="p-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tailwind Classes
                    </label>
                    <input
                        type="text"
                        value={tailwindClasses}
                        onChange={(e) => setTailwindClasses(e.target.value)}
                        placeholder="bg-blue-500 text-white px-4 py-2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter Tailwind CSS classes separated by spaces
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Background Color
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option>bg-white</option>
                            <option>bg-gray-100</option>
                            <option>bg-blue-500</option>
                            <option>bg-red-500</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Text Color
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option>text-gray-900</option>
                            <option>text-white</option>
                            <option>text-blue-600</option>
                            <option>text-red-600</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Padding
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option>p-0</option>
                            <option>p-1</option>
                            <option>p-2</option>
                            <option>p-4</option>
                            <option>p-6</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Margin
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option>m-0</option>
                            <option>m-1</option>
                            <option>m-2</option>
                            <option>m-4</option>
                            <option>m-6</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LayoutEditor({ project: _project }: { project: ProjectInfo }) {
    return (
        <div className="p-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>block</option>
                        <option>flex</option>
                        <option>grid</option>
                        <option>inline</option>
                        <option>inline-block</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Flex Direction
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>row</option>
                        <option>column</option>
                        <option>row-reverse</option>
                        <option>column-reverse</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Justify Content
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>flex-start</option>
                        <option>flex-end</option>
                        <option>center</option>
                        <option>space-between</option>
                        <option>space-around</option>
                        <option>space-evenly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Align Items
                    </label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        <option>flex-start</option>
                        <option>flex-end</option>
                        <option>center</option>
                        <option>baseline</option>
                        <option>stretch</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

function ResponsiveEditor({ project: _project }: { project: ProjectInfo }) {
    const [activeBreakpoint, setActiveBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

    return (
        <div className="p-4">
            <div className="space-y-4">
                {/* Breakpoint Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Breakpoint
                    </label>
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveBreakpoint('mobile')}
                            className={`flex-1 px-3 py-2 text-xs rounded-md ${activeBreakpoint === 'mobile'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Mobile
                        </button>
                        <button
                            onClick={() => setActiveBreakpoint('tablet')}
                            className={`flex-1 px-3 py-2 text-xs rounded-md ${activeBreakpoint === 'tablet'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Tablet
                        </button>
                        <button
                            onClick={() => setActiveBreakpoint('desktop')}
                            className={`flex-1 px-3 py-2 text-xs rounded-md ${activeBreakpoint === 'desktop'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Desktop
                        </button>
                    </div>
                </div>

                {/* Responsive Properties */}
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Width
                        </label>
                        <input
                            type="text"
                            placeholder="w-full"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Height
                        </label>
                        <input
                            type="text"
                            placeholder="h-auto"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Display
                        </label>
                        <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                            <option>block</option>
                            <option>flex</option>
                            <option>grid</option>
                            <option>hidden</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}
