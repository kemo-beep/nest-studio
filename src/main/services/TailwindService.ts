export interface TailwindClass {
    name: string
    category: string
    description?: string
    values?: string[]
    responsive?: boolean
    hover?: boolean
    focus?: boolean
    dark?: boolean
    group?: boolean
    peer?: boolean
}

export interface TailwindSuggestion {
    class: string
    category: string
    description?: string
    score: number
}

export class TailwindService {
    private classes: Map<string, TailwindClass> = new Map()
    private categories: Set<string> = new Set()

    constructor() {
        this.initializeTailwindClasses()
    }

    /**
     * Get all available Tailwind classes
     */
    getAllClasses(): TailwindClass[] {
        return Array.from(this.classes.values())
    }

    /**
     * Get classes by category
     */
    getClassesByCategory(category: string): TailwindClass[] {
        return Array.from(this.classes.values()).filter(cls => cls.category === category)
    }

    /**
     * Get all categories
     */
    getCategories(): string[] {
        return Array.from(this.categories)
    }

    /**
     * Search for classes matching a query
     */
    searchClasses(query: string, limit: number = 20): TailwindSuggestion[] {
        if (!query.trim()) return []

        const suggestions: TailwindSuggestion[] = []
        const queryLower = query.toLowerCase()

        for (const [className, classData] of this.classes) {
            let score = 0

            // Exact match gets highest score
            if (className === query) {
                score = 100
            }
            // Starts with query gets high score
            else if (className.startsWith(query)) {
                score = 80
            }
            // Contains query gets medium score
            else if (className.includes(query)) {
                score = 60
            }
            // Description contains query gets low score
            else if (classData.description?.toLowerCase().includes(queryLower)) {
                score = 40
            }

            if (score > 0) {
                suggestions.push({
                    class: className,
                    category: classData.category,
                    description: classData.description,
                    score
                })
            }
        }

        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
    }

    /**
     * Validate a Tailwind class
     */
    validateClass(className: string): { valid: boolean; error?: string; suggestion?: string } {
        // Check if it's a valid Tailwind class
        if (this.classes.has(className)) {
            return { valid: true }
        }

        // Check for common mistakes and suggest corrections
        const suggestions = this.searchClasses(className, 3)
        if (suggestions.length > 0) {
            return {
                valid: false,
                error: `Unknown class: ${className}`,
                suggestion: suggestions[0].class
            }
        }

        return {
            valid: false,
            error: `Unknown class: ${className}`
        }
    }

    /**
     * Parse a className string into individual classes
     */
    parseClassString(classString: string): string[] {
        return classString
            .split(/\s+/)
            .filter(cls => cls.trim().length > 0)
    }

    /**
     * Validate a className string
     */
    validateClassString(classString: string): { valid: boolean; errors: string[]; suggestions: Record<string, string> } {
        const classes = this.parseClassString(classString)
        const errors: string[] = []
        const suggestions: Record<string, string> = {}

        for (const className of classes) {
            const validation = this.validateClass(className)
            if (!validation.valid) {
                errors.push(validation.error || `Invalid class: ${className}`)
                if (validation.suggestion) {
                    suggestions[className] = validation.suggestion
                }
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            suggestions
        }
    }

    /**
     * Get responsive variants for a class
     */
    getResponsiveVariants(className: string): string[] {
        const variants = ['sm:', 'md:', 'lg:', 'xl:', '2xl:']
        return variants.map(variant => `${variant}${className}`)
    }

    /**
     * Get state variants for a class
     */
    getStateVariants(className: string): string[] {
        const variants = ['hover:', 'focus:', 'active:', 'disabled:', 'group-hover:', 'peer-focus:']
        return variants.map(variant => `${variant}${className}`)
    }

    /**
     * Initialize Tailwind classes data
     */
    private initializeTailwindClasses(): void {
        // Layout
        this.addClass('block', 'Layout', 'Display as block element')
        this.addClass('inline-block', 'Layout', 'Display as inline-block element')
        this.addClass('inline', 'Layout', 'Display as inline element')
        this.addClass('flex', 'Layout', 'Display as flex container')
        this.addClass('inline-flex', 'Layout', 'Display as inline flex container')
        this.addClass('grid', 'Layout', 'Display as grid container')
        this.addClass('inline-grid', 'Layout', 'Display as inline grid container')
        this.addClass('hidden', 'Layout', 'Hide element')

        // Flexbox
        this.addClass('flex-row', 'Flexbox', 'Flex direction row')
        this.addClass('flex-col', 'Flexbox', 'Flex direction column')
        this.addClass('flex-wrap', 'Flexbox', 'Allow flex items to wrap')
        this.addClass('flex-nowrap', 'Flexbox', 'Prevent flex items from wrapping')
        this.addClass('justify-start', 'Flexbox', 'Justify content start')
        this.addClass('justify-center', 'Flexbox', 'Justify content center')
        this.addClass('justify-end', 'Flexbox', 'Justify content end')
        this.addClass('justify-between', 'Flexbox', 'Justify content space between')
        this.addClass('justify-around', 'Flexbox', 'Justify content space around')
        this.addClass('justify-evenly', 'Flexbox', 'Justify content space evenly')
        this.addClass('items-start', 'Flexbox', 'Align items start')
        this.addClass('items-center', 'Flexbox', 'Align items center')
        this.addClass('items-end', 'Flexbox', 'Align items end')
        this.addClass('items-stretch', 'Flexbox', 'Align items stretch')
        this.addClass('items-baseline', 'Flexbox', 'Align items baseline')

        // Spacing
        this.addClass('p-0', 'Spacing', 'Padding 0')
        this.addClass('p-1', 'Spacing', 'Padding 0.25rem')
        this.addClass('p-2', 'Spacing', 'Padding 0.5rem')
        this.addClass('p-3', 'Spacing', 'Padding 0.75rem')
        this.addClass('p-4', 'Spacing', 'Padding 1rem')
        this.addClass('p-5', 'Spacing', 'Padding 1.25rem')
        this.addClass('p-6', 'Spacing', 'Padding 1.5rem')
        this.addClass('p-8', 'Spacing', 'Padding 2rem')
        this.addClass('p-10', 'Spacing', 'Padding 2.5rem')
        this.addClass('p-12', 'Spacing', 'Padding 3rem')
        this.addClass('p-16', 'Spacing', 'Padding 4rem')
        this.addClass('p-20', 'Spacing', 'Padding 5rem')
        this.addClass('p-24', 'Spacing', 'Padding 6rem')
        this.addClass('p-32', 'Spacing', 'Padding 8rem')
        this.addClass('p-40', 'Spacing', 'Padding 10rem')
        this.addClass('p-48', 'Spacing', 'Padding 12rem')
        this.addClass('p-56', 'Spacing', 'Padding 14rem')
        this.addClass('p-64', 'Spacing', 'Padding 16rem')
        this.addClass('p-px', 'Spacing', 'Padding 1px')

        this.addClass('m-0', 'Spacing', 'Margin 0')
        this.addClass('m-1', 'Spacing', 'Margin 0.25rem')
        this.addClass('m-2', 'Spacing', 'Margin 0.5rem')
        this.addClass('m-3', 'Spacing', 'Margin 0.75rem')
        this.addClass('m-4', 'Spacing', 'Margin 1rem')
        this.addClass('m-5', 'Spacing', 'Margin 1.25rem')
        this.addClass('m-6', 'Spacing', 'Margin 1.5rem')
        this.addClass('m-8', 'Spacing', 'Margin 2rem')
        this.addClass('m-10', 'Spacing', 'Margin 2.5rem')
        this.addClass('m-12', 'Spacing', 'Margin 3rem')
        this.addClass('m-16', 'Spacing', 'Margin 4rem')
        this.addClass('m-20', 'Spacing', 'Margin 5rem')
        this.addClass('m-24', 'Spacing', 'Margin 6rem')
        this.addClass('m-32', 'Spacing', 'Margin 8rem')
        this.addClass('m-40', 'Spacing', 'Margin 10rem')
        this.addClass('m-48', 'Spacing', 'Margin 12rem')
        this.addClass('m-56', 'Spacing', 'Margin 14rem')
        this.addClass('m-64', 'Spacing', 'Margin 16rem')
        this.addClass('m-px', 'Spacing', 'Margin 1px')

        // Colors
        this.addClass('text-black', 'Colors', 'Text color black')
        this.addClass('text-white', 'Colors', 'Text color white')
        this.addClass('text-gray-50', 'Colors', 'Text color gray-50')
        this.addClass('text-gray-100', 'Colors', 'Text color gray-100')
        this.addClass('text-gray-200', 'Colors', 'Text color gray-200')
        this.addClass('text-gray-300', 'Colors', 'Text color gray-300')
        this.addClass('text-gray-400', 'Colors', 'Text color gray-400')
        this.addClass('text-gray-500', 'Colors', 'Text color gray-500')
        this.addClass('text-gray-600', 'Colors', 'Text color gray-600')
        this.addClass('text-gray-700', 'Colors', 'Text color gray-700')
        this.addClass('text-gray-800', 'Colors', 'Text color gray-800')
        this.addClass('text-gray-900', 'Colors', 'Text color gray-900')
        this.addClass('text-red-500', 'Colors', 'Text color red-500')
        this.addClass('text-blue-500', 'Colors', 'Text color blue-500')
        this.addClass('text-green-500', 'Colors', 'Text color green-500')
        this.addClass('text-yellow-500', 'Colors', 'Text color yellow-500')
        this.addClass('text-purple-500', 'Colors', 'Text color purple-500')
        this.addClass('text-pink-500', 'Colors', 'Text color pink-500')
        this.addClass('text-indigo-500', 'Colors', 'Text color indigo-500')

        this.addClass('bg-black', 'Colors', 'Background color black')
        this.addClass('bg-white', 'Colors', 'Background color white')
        this.addClass('bg-gray-50', 'Colors', 'Background color gray-50')
        this.addClass('bg-gray-100', 'Colors', 'Background color gray-100')
        this.addClass('bg-gray-200', 'Colors', 'Background color gray-200')
        this.addClass('bg-gray-300', 'Colors', 'Background color gray-300')
        this.addClass('bg-gray-400', 'Colors', 'Background color gray-400')
        this.addClass('bg-gray-500', 'Colors', 'Background color gray-500')
        this.addClass('bg-gray-600', 'Colors', 'Background color gray-600')
        this.addClass('bg-gray-700', 'Colors', 'Background color gray-700')
        this.addClass('bg-gray-800', 'Colors', 'Background color gray-800')
        this.addClass('bg-gray-900', 'Colors', 'Background color gray-900')
        this.addClass('bg-red-500', 'Colors', 'Background color red-500')
        this.addClass('bg-blue-500', 'Colors', 'Background color blue-500')
        this.addClass('bg-green-500', 'Colors', 'Background color green-500')
        this.addClass('bg-yellow-500', 'Colors', 'Background color yellow-500')
        this.addClass('bg-purple-500', 'Colors', 'Background color purple-500')
        this.addClass('bg-pink-500', 'Colors', 'Background color pink-500')
        this.addClass('bg-indigo-500', 'Colors', 'Background color indigo-500')

        // Typography
        this.addClass('text-xs', 'Typography', 'Font size 0.75rem')
        this.addClass('text-sm', 'Typography', 'Font size 0.875rem')
        this.addClass('text-base', 'Typography', 'Font size 1rem')
        this.addClass('text-lg', 'Typography', 'Font size 1.125rem')
        this.addClass('text-xl', 'Typography', 'Font size 1.25rem')
        this.addClass('text-2xl', 'Typography', 'Font size 1.5rem')
        this.addClass('text-3xl', 'Typography', 'Font size 1.875rem')
        this.addClass('text-4xl', 'Typography', 'Font size 2.25rem')
        this.addClass('text-5xl', 'Typography', 'Font size 3rem')
        this.addClass('text-6xl', 'Typography', 'Font size 3.75rem')
        this.addClass('text-7xl', 'Typography', 'Font size 4.5rem')
        this.addClass('text-8xl', 'Typography', 'Font size 6rem')
        this.addClass('text-9xl', 'Typography', 'Font size 8rem')

        this.addClass('font-thin', 'Typography', 'Font weight 100')
        this.addClass('font-extralight', 'Typography', 'Font weight 200')
        this.addClass('font-light', 'Typography', 'Font weight 300')
        this.addClass('font-normal', 'Typography', 'Font weight 400')
        this.addClass('font-medium', 'Typography', 'Font weight 500')
        this.addClass('font-semibold', 'Typography', 'Font weight 600')
        this.addClass('font-bold', 'Typography', 'Font weight 700')
        this.addClass('font-extrabold', 'Typography', 'Font weight 800')
        this.addClass('font-black', 'Typography', 'Font weight 900')

        this.addClass('text-left', 'Typography', 'Text align left')
        this.addClass('text-center', 'Typography', 'Text align center')
        this.addClass('text-right', 'Typography', 'Text align right')
        this.addClass('text-justify', 'Typography', 'Text align justify')

        // Borders
        this.addClass('border', 'Borders', 'Border width 1px')
        this.addClass('border-0', 'Borders', 'Border width 0')
        this.addClass('border-2', 'Borders', 'Border width 2px')
        this.addClass('border-4', 'Borders', 'Border width 4px')
        this.addClass('border-8', 'Borders', 'Border width 8px')

        this.addClass('border-solid', 'Borders', 'Border style solid')
        this.addClass('border-dashed', 'Borders', 'Border style dashed')
        this.addClass('border-dotted', 'Borders', 'Border style dotted')
        this.addClass('border-double', 'Borders', 'Border style double')
        this.addClass('border-none', 'Borders', 'Border style none')

        this.addClass('rounded', 'Borders', 'Border radius 0.25rem')
        this.addClass('rounded-sm', 'Borders', 'Border radius 0.125rem')
        this.addClass('rounded-md', 'Borders', 'Border radius 0.375rem')
        this.addClass('rounded-lg', 'Borders', 'Border radius 0.5rem')
        this.addClass('rounded-xl', 'Borders', 'Border radius 0.75rem')
        this.addClass('rounded-2xl', 'Borders', 'Border radius 1rem')
        this.addClass('rounded-3xl', 'Borders', 'Border radius 1.5rem')
        this.addClass('rounded-full', 'Borders', 'Border radius 9999px')
        this.addClass('rounded-none', 'Borders', 'Border radius 0')

        // Sizing
        this.addClass('w-auto', 'Sizing', 'Width auto')
        this.addClass('w-full', 'Sizing', 'Width 100%')
        this.addClass('w-screen', 'Sizing', 'Width 100vw')
        this.addClass('w-min', 'Sizing', 'Width min-content')
        this.addClass('w-max', 'Sizing', 'Width max-content')
        this.addClass('w-fit', 'Sizing', 'Width fit-content')

        this.addClass('h-auto', 'Sizing', 'Height auto')
        this.addClass('h-full', 'Sizing', 'Height 100%')
        this.addClass('h-screen', 'Sizing', 'Height 100vh')
        this.addClass('h-min', 'Sizing', 'Height min-content')
        this.addClass('h-max', 'Sizing', 'Height max-content')
        this.addClass('h-fit', 'Sizing', 'Height fit-content')

        // Position
        this.addClass('static', 'Position', 'Position static')
        this.addClass('relative', 'Position', 'Position relative')
        this.addClass('absolute', 'Position', 'Position absolute')
        this.addClass('fixed', 'Position', 'Position fixed')
        this.addClass('sticky', 'Position', 'Position sticky')

        // Effects
        this.addClass('shadow-sm', 'Effects', 'Box shadow small')
        this.addClass('shadow', 'Effects', 'Box shadow default')
        this.addClass('shadow-md', 'Effects', 'Box shadow medium')
        this.addClass('shadow-lg', 'Effects', 'Box shadow large')
        this.addClass('shadow-xl', 'Effects', 'Box shadow extra large')
        this.addClass('shadow-2xl', 'Effects', 'Box shadow 2x large')
        this.addClass('shadow-inner', 'Effects', 'Box shadow inner')
        this.addClass('shadow-none', 'Effects', 'Box shadow none')

        this.addClass('opacity-0', 'Effects', 'Opacity 0')
        this.addClass('opacity-25', 'Effects', 'Opacity 0.25')
        this.addClass('opacity-50', 'Effects', 'Opacity 0.5')
        this.addClass('opacity-75', 'Effects', 'Opacity 0.75')
        this.addClass('opacity-100', 'Effects', 'Opacity 1')

        // Transforms
        this.addClass('transform', 'Transforms', 'Enable transforms')
        this.addClass('scale-0', 'Transforms', 'Scale 0')
        this.addClass('scale-50', 'Transforms', 'Scale 0.5')
        this.addClass('scale-75', 'Transforms', 'Scale 0.75')
        this.addClass('scale-90', 'Transforms', 'Scale 0.9')
        this.addClass('scale-95', 'Transforms', 'Scale 0.95')
        this.addClass('scale-100', 'Transforms', 'Scale 1')
        this.addClass('scale-105', 'Transforms', 'Scale 1.05')
        this.addClass('scale-110', 'Transforms', 'Scale 1.1')
        this.addClass('scale-125', 'Transforms', 'Scale 1.25')
        this.addClass('scale-150', 'Transforms', 'Scale 1.5')

        this.addClass('rotate-0', 'Transforms', 'Rotate 0deg')
        this.addClass('rotate-1', 'Transforms', 'Rotate 1deg')
        this.addClass('rotate-2', 'Transforms', 'Rotate 2deg')
        this.addClass('rotate-3', 'Transforms', 'Rotate 3deg')
        this.addClass('rotate-6', 'Transforms', 'Rotate 6deg')
        this.addClass('rotate-12', 'Transforms', 'Rotate 12deg')
        this.addClass('rotate-45', 'Transforms', 'Rotate 45deg')
        this.addClass('rotate-90', 'Transforms', 'Rotate 90deg')
        this.addClass('rotate-180', 'Transforms', 'Rotate 180deg')

        // Transitions
        this.addClass('transition-none', 'Transitions', 'No transition')
        this.addClass('transition-all', 'Transitions', 'Transition all properties')
        this.addClass('transition', 'Transitions', 'Transition default properties')
        this.addClass('transition-colors', 'Transitions', 'Transition colors')
        this.addClass('transition-opacity', 'Transitions', 'Transition opacity')
        this.addClass('transition-shadow', 'Transitions', 'Transition shadow')
        this.addClass('transition-transform', 'Transitions', 'Transition transform')

        this.addClass('duration-75', 'Transitions', 'Duration 75ms')
        this.addClass('duration-100', 'Transitions', 'Duration 100ms')
        this.addClass('duration-150', 'Transitions', 'Duration 150ms')
        this.addClass('duration-200', 'Transitions', 'Duration 200ms')
        this.addClass('duration-300', 'Transitions', 'Duration 300ms')
        this.addClass('duration-500', 'Transitions', 'Duration 500ms')
        this.addClass('duration-700', 'Transitions', 'Duration 700ms')
        this.addClass('duration-1000', 'Transitions', 'Duration 1000ms')

        this.addClass('ease-linear', 'Transitions', 'Easing linear')
        this.addClass('ease-in', 'Transitions', 'Easing ease-in')
        this.addClass('ease-out', 'Transitions', 'Easing ease-out')
        this.addClass('ease-in-out', 'Transitions', 'Easing ease-in-out')
    }

    private addClass(name: string, category: string, description?: string, values?: string[]): void {
        this.classes.set(name, {
            name,
            category,
            description,
            values,
            responsive: true,
            hover: true,
            focus: true,
            dark: true
        })
        this.categories.add(category)
    }
}
