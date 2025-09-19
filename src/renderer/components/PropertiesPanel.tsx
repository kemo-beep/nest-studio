import { useState } from 'react'
import { TailwindClassEditor } from './TailwindClassEditor'

interface PageElement {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children: PageElement[]
    position: {
        x: number
        y: number
        width: number
        height: number
    }
    path: number[]
    className?: string
    content?: string
}

interface PropertiesPanelProps {
    selectedElement?: PageElement | null
    onElementUpdate?: (elementId: string, updates: Partial<PageElement>) => void
}

export function PropertiesPanel({ selectedElement, onElementUpdate }: PropertiesPanelProps) {
    const [activeTab, setActiveTab] = useState<'styles' | 'props' | 'computed'>('styles')

    // Debug logging
    console.log('PropertiesPanel: selectedElement received:', selectedElement)
    console.log('PropertiesPanel: selectedElement type:', typeof selectedElement)
    console.log('PropertiesPanel: selectedElement is null?', selectedElement === null)
    console.log('PropertiesPanel: selectedElement is undefined?', selectedElement === undefined)

    const handlePropChange = (propName: string, propValue: any) => {
        if (selectedElement && onElementUpdate) {
            const updates = {
                props: { ...selectedElement.props, [propName]: propValue }
            }
            onElementUpdate(selectedElement.id, updates)
        }
    }

    const handleClassNameChange = (newClassName: string) => {
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.id, { className: newClassName })
        }
    }

    const handleContentChange = (newContent: string) => {
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.id, { content: newContent })
        }
    }

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Properties</h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('styles')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${activeTab === 'styles'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Styles
                </button>
                <button
                    onClick={() => setActiveTab('props')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${activeTab === 'props'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Attributes
                </button>
                <button
                    onClick={() => setActiveTab('computed')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${activeTab === 'computed'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Computed
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
                {selectedElement ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected Element</h3>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedElement.name}</p>
                        </div>

                        {activeTab === 'styles' && (
                            <div className="space-y-6">
                                {/* Tailwind Classes */}
                                <TailwindClassEditor
                                    className={selectedElement.className || ''}
                                    onClassNameChange={handleClassNameChange}
                                />

                                {/* Layout & Box Model */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Layout & Box Model
                                    </h4>
                                    <div className="space-y-3">
                                        {/* Dimensions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Width</label>
                                                <input
                                                    type="text"
                                                    placeholder="auto, 100px, 50%"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Height</label>
                                                <input
                                                    type="text"
                                                    placeholder="auto, 100px, 50vh"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Min/Max Dimensions */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Min Width</label>
                                                <input
                                                    type="text"
                                                    placeholder="0, 100px"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Max Width</label>
                                                <input
                                                    type="text"
                                                    placeholder="none, 100%"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Margin */}
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Margin</label>
                                            <div className="grid grid-cols-4 gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="Top"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Right"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Bottom"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Left"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Padding */}
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Padding</label>
                                            <div className="grid grid-cols-4 gap-1">
                                                <input
                                                    type="text"
                                                    placeholder="Top"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Right"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Bottom"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Left"
                                                    className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Border */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Width</label>
                                                <input
                                                    type="text"
                                                    placeholder="1px"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Style</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="none">none</option>
                                                    <option value="solid">solid</option>
                                                    <option value="dashed">dashed</option>
                                                    <option value="dotted">dotted</option>
                                                    <option value="double">double</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Color</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Display & Position */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Display</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="block">block</option>
                                                    <option value="inline">inline</option>
                                                    <option value="inline-block">inline-block</option>
                                                    <option value="flex">flex</option>
                                                    <option value="grid">grid</option>
                                                    <option value="none">none</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Position</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="static">static</option>
                                                    <option value="relative">relative</option>
                                                    <option value="absolute">absolute</option>
                                                    <option value="fixed">fixed</option>
                                                    <option value="sticky">sticky</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Position Offsets */}
                                        <div className="grid grid-cols-4 gap-1">
                                            <input
                                                type="text"
                                                placeholder="Top"
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Right"
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Bottom"
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Left"
                                                className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Z-index & Overflow */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Z-Index</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Overflow</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="visible">visible</option>
                                                    <option value="hidden">hidden</option>
                                                    <option value="scroll">scroll</option>
                                                    <option value="auto">auto</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Typography */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Typography
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Family</label>
                                                <input
                                                    type="text"
                                                    placeholder="Arial, sans-serif"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Size</label>
                                                <input
                                                    type="text"
                                                    placeholder="16px, 1rem"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Weight</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="normal">normal</option>
                                                    <option value="bold">bold</option>
                                                    <option value="100">100</option>
                                                    <option value="200">200</option>
                                                    <option value="300">300</option>
                                                    <option value="400">400</option>
                                                    <option value="500">500</option>
                                                    <option value="600">600</option>
                                                    <option value="700">700</option>
                                                    <option value="800">800</option>
                                                    <option value="900">900</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Font Style</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="normal">normal</option>
                                                    <option value="italic">italic</option>
                                                    <option value="oblique">oblique</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Line Height</label>
                                                <input
                                                    type="text"
                                                    placeholder="1.5, 24px"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Letter Spacing</label>
                                                <input
                                                    type="text"
                                                    placeholder="0.1em, 1px"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Align</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="left">left</option>
                                                    <option value="right">right</option>
                                                    <option value="center">center</option>
                                                    <option value="justify">justify</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Decoration</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="none">none</option>
                                                    <option value="underline">underline</option>
                                                    <option value="line-through">line-through</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Transform</label>
                                            <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                <option value="none">none</option>
                                                <option value="uppercase">uppercase</option>
                                                <option value="lowercase">lowercase</option>
                                                <option value="capitalize">capitalize</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Colors & Background */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Colors & Background
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Color</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background Color</label>
                                                <input
                                                    type="color"
                                                    className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background Image</label>
                                            <input
                                                type="url"
                                                placeholder="url('image.jpg')"
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background Size</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="auto">auto</option>
                                                    <option value="cover">cover</option>
                                                    <option value="contain">contain</option>
                                                    <option value="100% 100%">100% 100%</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background Position</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="center">center</option>
                                                    <option value="top">top</option>
                                                    <option value="bottom">bottom</option>
                                                    <option value="left">left</option>
                                                    <option value="right">right</option>
                                                    <option value="top left">top left</option>
                                                    <option value="top right">top right</option>
                                                    <option value="bottom left">bottom left</option>
                                                    <option value="bottom right">bottom right</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Background Repeat</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="repeat">repeat</option>
                                                    <option value="no-repeat">no-repeat</option>
                                                    <option value="repeat-x">repeat-x</option>
                                                    <option value="repeat-y">repeat-y</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Opacity</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Flexbox & Grid */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Flexbox & Grid
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Flex Direction</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="row">row</option>
                                                    <option value="column">column</option>
                                                    <option value="row-reverse">row-reverse</option>
                                                    <option value="column-reverse">column-reverse</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Justify Content</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="flex-start">flex-start</option>
                                                    <option value="flex-end">flex-end</option>
                                                    <option value="center">center</option>
                                                    <option value="space-between">space-between</option>
                                                    <option value="space-around">space-around</option>
                                                    <option value="space-evenly">space-evenly</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Align Items</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="stretch">stretch</option>
                                                    <option value="flex-start">flex-start</option>
                                                    <option value="flex-end">flex-end</option>
                                                    <option value="center">center</option>
                                                    <option value="baseline">baseline</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Gap</label>
                                                <input
                                                    type="text"
                                                    placeholder="8px, 1rem"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Flex Wrap</label>
                                            <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                <option value="nowrap">nowrap</option>
                                                <option value="wrap">wrap</option>
                                                <option value="wrap-reverse">wrap-reverse</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Effects */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Visual Effects
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Border Radius</label>
                                                <input
                                                    type="text"
                                                    placeholder="4px, 50%"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Box Shadow</label>
                                                <input
                                                    type="text"
                                                    placeholder="0 2px 4px rgba(0,0,0,0.1)"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Text Shadow</label>
                                            <input
                                                type="text"
                                                placeholder="1px 1px 2px rgba(0,0,0,0.5)"
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Transition</label>
                                                <input
                                                    type="text"
                                                    placeholder="all 0.3s ease"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Transform</label>
                                                <input
                                                    type="text"
                                                    placeholder="rotate(45deg)"
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cursor</label>
                                            <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                <option value="default">default</option>
                                                <option value="pointer">pointer</option>
                                                <option value="text">text</option>
                                                <option value="move">move</option>
                                                <option value="not-allowed">not-allowed</option>
                                                <option value="help">help</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Misc */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Misc
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Visibility</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="visible">visible</option>
                                                    <option value="hidden">hidden</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">White Space</label>
                                                <select className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                                                    <option value="normal">normal</option>
                                                    <option value="nowrap">nowrap</option>
                                                    <option value="pre">pre</option>
                                                    <option value="pre-wrap">pre-wrap</option>
                                                    <option value="pre-line">pre-line</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Clip Path</label>
                                            <input
                                                type="text"
                                                placeholder="circle(50%)"
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'props' && (
                            <div className="space-y-4">
                                {/* Basic Properties */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Basic Properties
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Element Type
                                            </label>
                                            <input
                                                type="text"
                                                value={selectedElement.type}
                                                onChange={(e) => onElementUpdate?.(selectedElement.id, { type: e.target.value })}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Content
                                            </label>
                                            <textarea
                                                value={selectedElement.content || ''}
                                                onChange={(e) => handleContentChange(e.target.value)}
                                                rows={2}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Common HTML Attributes */}
                                {(() => {
                                    const commonAttrs = ['src', 'alt', 'href', 'target', 'rel', 'type', 'placeholder', 'value', 'disabled', 'checked', 'selected', 'multiple', 'required', 'readonly']
                                    const commonAttributes = commonAttrs.filter(attr => selectedElement.props[attr] !== undefined)

                                    if (commonAttributes.length > 0) {
                                        return (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                                    Common HTML Attributes
                                                </h4>
                                                <div className="space-y-2">
                                                    {commonAttributes.map(attr => (
                                                        <div key={attr} className="flex gap-2">
                                                            <label className="w-20 text-xs text-gray-600 dark:text-gray-400 pt-1">
                                                                {attr}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={String(selectedElement.props[attr] || '')}
                                                                onChange={(e) => handlePropChange(attr, e.target.value)}
                                                                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                })()}

                                {/* All Properties */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        All Properties
                                    </h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {Object.entries(selectedElement.props).map(([key, value]) => {
                                            if (key === 'className') return null // Handled in styles tab
                                            return (
                                                <div key={key} className="flex gap-2">
                                                    <label className="w-20 text-xs text-gray-600 dark:text-gray-400 pt-1 truncate">
                                                        {key}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={String(value)}
                                                        onChange={(e) => handlePropChange(key, e.target.value)}
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'computed' && (
                            <div className="space-y-4">
                                {/* Computed Styles */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Computed Styles
                                    </h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {Object.entries(selectedElement.props)
                                            .filter(([key]) => key.startsWith('style_'))
                                            .map(([key, value]) => (
                                                <div key={key} className="flex gap-2">
                                                    <label className="w-24 text-xs text-gray-600 dark:text-gray-400 pt-1 truncate">
                                                        {key.replace('style_', '')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={String(value)}
                                                        readOnly
                                                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Element Dimensions */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Element Dimensions
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Offset Width</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.offsetWidth || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Offset Height</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.offsetHeight || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Client Width</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.clientWidth || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Client Height</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.clientHeight || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Scroll Width</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.scrollWidth || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Scroll Height</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.scrollHeight || ''}
                                                readOnly
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Element Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-200 dark:border-gray-600 pb-1">
                                        Element Info
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <label className="w-20 text-xs text-gray-600 dark:text-gray-400 pt-1">Tag</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.tagName || ''}
                                                readOnly
                                                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <label className="w-20 text-xs text-gray-600 dark:text-gray-400 pt-1">Node Type</label>
                                            <input
                                                type="text"
                                                value={selectedElement.props.nodeType || ''}
                                                readOnly
                                                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                        <div className="text-4xl mb-4">👆</div>
                        <p>Select an element on the canvas to edit its properties.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
