/**
 * Comprehensive Tailwind CSS Class Parser
 * Parses Tailwind classes and maps them to their corresponding CSS properties
 */

export interface ParsedStyle {
    property: string
    value: string
    responsive?: string
    important?: boolean
}

export interface ParsedClasses {
    styles: ParsedStyle[]
    spacing: ParsedStyle[]
    typography: ParsedStyle[]
    layout: ParsedStyle[]
    colors: ParsedStyle[]
    effects: ParsedStyle[]
    transforms: ParsedStyle[]
    transitions: ParsedStyle[]
    raw: string
}

export class TailwindParser {
    private static instance: TailwindParser

    // Tailwind class mappings
    private readonly classMappings = {
        // Typography
        'text-xs': { property: 'font-size', value: '0.75rem' },
        'text-sm': { property: 'font-size', value: '0.875rem' },
        'text-base': { property: 'font-size', value: '1rem' },
        'text-lg': { property: 'font-size', value: '1.125rem' },
        'text-xl': { property: 'font-size', value: '1.25rem' },
        'text-2xl': { property: 'font-size', value: '1.5rem' },
        'text-3xl': { property: 'font-size', value: '1.875rem' },
        'text-4xl': { property: 'font-size', value: '2.25rem' },
        'text-5xl': { property: 'font-size', value: '3rem' },
        'text-6xl': { property: 'font-size', value: '3.75rem' },
        'text-7xl': { property: 'font-size', value: '4.5rem' },
        'text-8xl': { property: 'font-size', value: '6rem' },
        'text-9xl': { property: 'font-size', value: '8rem' },

        'font-thin': { property: 'font-weight', value: '100' },
        'font-extralight': { property: 'font-weight', value: '200' },
        'font-light': { property: 'font-weight', value: '300' },
        'font-normal': { property: 'font-weight', value: '400' },
        'font-medium': { property: 'font-weight', value: '500' },
        'font-semibold': { property: 'font-weight', value: '600' },
        'font-bold': { property: 'font-weight', value: '700' },
        'font-extrabold': { property: 'font-weight', value: '800' },
        'font-black': { property: 'font-weight', value: '900' },

        'text-left': { property: 'text-align', value: 'left' },
        'text-center': { property: 'text-align', value: 'center' },
        'text-right': { property: 'text-align', value: 'right' },
        'text-justify': { property: 'text-align', value: 'justify' },

        'italic': { property: 'font-style', value: 'italic' },
        'not-italic': { property: 'font-style', value: 'normal' },

        'underline': { property: 'text-decoration', value: 'underline' },
        'line-through': { property: 'text-decoration', value: 'line-through' },
        'no-underline': { property: 'text-decoration', value: 'none' },

        'uppercase': { property: 'text-transform', value: 'uppercase' },
        'lowercase': { property: 'text-transform', value: 'lowercase' },
        'capitalize': { property: 'text-transform', value: 'capitalize' },
        'normal-case': { property: 'text-transform', value: 'none' },

        // Spacing
        'p-0': { property: 'padding', value: '0' },
        'p-1': { property: 'padding', value: '0.25rem' },
        'p-2': { property: 'padding', value: '0.5rem' },
        'p-3': { property: 'padding', value: '0.75rem' },
        'p-4': { property: 'padding', value: '1rem' },
        'p-5': { property: 'padding', value: '1.25rem' },
        'p-6': { property: 'padding', value: '1.5rem' },
        'p-8': { property: 'padding', value: '2rem' },
        'p-10': { property: 'padding', value: '2.5rem' },
        'p-12': { property: 'padding', value: '3rem' },
        'p-16': { property: 'padding', value: '4rem' },
        'p-20': { property: 'padding', value: '5rem' },
        'p-24': { property: 'padding', value: '6rem' },
        'p-32': { property: 'padding', value: '8rem' },

        'px-0': { property: 'padding-left', value: '0' },
        'px-1': { property: 'padding-left', value: '0.25rem' },
        'px-2': { property: 'padding-left', value: '0.5rem' },
        'px-3': { property: 'padding-left', value: '0.75rem' },
        'px-4': { property: 'padding-left', value: '1rem' },
        'px-5': { property: 'padding-left', value: '1.25rem' },
        'px-6': { property: 'padding-left', value: '1.5rem' },
        'px-8': { property: 'padding-left', value: '2rem' },
        'px-10': { property: 'padding-left', value: '2.5rem' },
        'px-12': { property: 'padding-left', value: '3rem' },
        'px-16': { property: 'padding-left', value: '4rem' },
        'px-20': { property: 'padding-left', value: '5rem' },
        'px-24': { property: 'padding-left', value: '6rem' },
        'px-32': { property: 'padding-left', value: '8rem' },

        'py-0': { property: 'padding-top', value: '0' },
        'py-1': { property: 'padding-top', value: '0.25rem' },
        'py-2': { property: 'padding-top', value: '0.5rem' },
        'py-3': { property: 'padding-top', value: '0.75rem' },
        'py-4': { property: 'padding-top', value: '1rem' },
        'py-5': { property: 'padding-top', value: '1.25rem' },
        'py-6': { property: 'padding-top', value: '1.5rem' },
        'py-8': { property: 'padding-top', value: '2rem' },
        'py-10': { property: 'padding-top', value: '2.5rem' },
        'py-12': { property: 'padding-top', value: '3rem' },
        'py-16': { property: 'padding-top', value: '4rem' },
        'py-20': { property: 'padding-top', value: '5rem' },
        'py-24': { property: 'padding-top', value: '6rem' },
        'py-32': { property: 'padding-top', value: '8rem' },

        'm-0': { property: 'margin', value: '0' },
        'm-1': { property: 'margin', value: '0.25rem' },
        'm-2': { property: 'margin', value: '0.5rem' },
        'm-3': { property: 'margin', value: '0.75rem' },
        'm-4': { property: 'margin', value: '1rem' },
        'm-5': { property: 'margin', value: '1.25rem' },
        'm-6': { property: 'margin', value: '1.5rem' },
        'm-8': { property: 'margin', value: '2rem' },
        'm-10': { property: 'margin', value: '2.5rem' },
        'm-12': { property: 'margin', value: '3rem' },
        'm-16': { property: 'margin', value: '4rem' },
        'm-20': { property: 'margin', value: '5rem' },
        'm-24': { property: 'margin', value: '6rem' },
        'm-32': { property: 'margin', value: '8rem' },

        'mx-0': { property: 'margin-left', value: '0' },
        'mx-1': { property: 'margin-left', value: '0.25rem' },
        'mx-2': { property: 'margin-left', value: '0.5rem' },
        'mx-3': { property: 'margin-left', value: '0.75rem' },
        'mx-4': { property: 'margin-left', value: '1rem' },
        'mx-5': { property: 'margin-left', value: '1.25rem' },
        'mx-6': { property: 'margin-left', value: '1.5rem' },
        'mx-8': { property: 'margin-left', value: '2rem' },
        'mx-10': { property: 'margin-left', value: '2.5rem' },
        'mx-12': { property: 'margin-left', value: '3rem' },
        'mx-16': { property: 'margin-left', value: '4rem' },
        'mx-20': { property: 'margin-left', value: '5rem' },
        'mx-24': { property: 'margin-left', value: '6rem' },
        'mx-32': { property: 'margin-left', value: '8rem' },

        'my-0': { property: 'margin-top', value: '0' },
        'my-1': { property: 'margin-top', value: '0.25rem' },
        'my-2': { property: 'margin-top', value: '0.5rem' },
        'my-3': { property: 'margin-top', value: '0.75rem' },
        'my-4': { property: 'margin-top', value: '1rem' },
        'my-5': { property: 'margin-top', value: '1.25rem' },
        'my-6': { property: 'margin-top', value: '1.5rem' },
        'my-8': { property: 'margin-top', value: '2rem' },
        'my-10': { property: 'margin-top', value: '2.5rem' },
        'my-12': { property: 'margin-top', value: '3rem' },
        'my-16': { property: 'margin-top', value: '4rem' },
        'my-20': { property: 'margin-top', value: '5rem' },
        'my-24': { property: 'margin-top', value: '6rem' },
        'my-32': { property: 'margin-top', value: '8rem' },

        // Layout
        'block': { property: 'display', value: 'block' },
        'inline-block': { property: 'display', value: 'inline-block' },
        'inline': { property: 'display', value: 'inline' },
        'flex': { property: 'display', value: 'flex' },
        'inline-flex': { property: 'display', value: 'inline-flex' },
        'grid': { property: 'display', value: 'grid' },
        'inline-grid': { property: 'display', value: 'inline-grid' },
        'hidden': { property: 'display', value: 'none' },

        'w-full': { property: 'width', value: '100%' },
        'w-auto': { property: 'width', value: 'auto' },
        'w-screen': { property: 'width', value: '100vw' },
        'h-full': { property: 'height', value: '100%' },
        'h-auto': { property: 'height', value: 'auto' },
        'h-screen': { property: 'height', value: '100vh' },

        'flex-row': { property: 'flex-direction', value: 'row' },
        'flex-col': { property: 'flex-direction', value: 'column' },
        'flex-row-reverse': { property: 'flex-direction', value: 'row-reverse' },
        'flex-col-reverse': { property: 'flex-direction', value: 'column-reverse' },

        'justify-start': { property: 'justify-content', value: 'flex-start' },
        'justify-end': { property: 'justify-content', value: 'flex-end' },
        'justify-center': { property: 'justify-content', value: 'center' },
        'justify-between': { property: 'justify-content', value: 'space-between' },
        'justify-around': { property: 'justify-content', value: 'space-around' },
        'justify-evenly': { property: 'justify-content', value: 'space-evenly' },

        'items-start': { property: 'align-items', value: 'flex-start' },
        'items-end': { property: 'align-items', value: 'flex-end' },
        'items-center': { property: 'align-items', value: 'center' },
        'items-baseline': { property: 'align-items', value: 'baseline' },
        'items-stretch': { property: 'align-items', value: 'stretch' },

        // Colors (basic set)
        'text-black': { property: 'color', value: '#000000' },
        'text-white': { property: 'color', value: '#ffffff' },
        'text-gray-100': { property: 'color', value: '#f3f4f6' },
        'text-gray-200': { property: 'color', value: '#e5e7eb' },
        'text-gray-300': { property: 'color', value: '#d1d5db' },
        'text-gray-400': { property: 'color', value: '#9ca3af' },
        'text-gray-500': { property: 'color', value: '#6b7280' },
        'text-gray-600': { property: 'color', value: '#4b5563' },
        'text-gray-700': { property: 'color', value: '#374151' },
        'text-gray-800': { property: 'color', value: '#1f2937' },
        'text-gray-900': { property: 'color', value: '#111827' },

        'bg-transparent': { property: 'background-color', value: 'transparent' },
        'bg-black': { property: 'background-color', value: '#000000' },
        'bg-white': { property: 'background-color', value: '#ffffff' },
        'bg-gray-100': { property: 'background-color', value: '#f3f4f6' },
        'bg-gray-200': { property: 'background-color', value: '#e5e7eb' },
        'bg-gray-300': { property: 'background-color', value: '#d1d5db' },
        'bg-gray-400': { property: 'background-color', value: '#9ca3af' },
        'bg-gray-500': { property: 'background-color', value: '#6b7280' },
        'bg-gray-600': { property: 'background-color', value: '#4b5563' },
        'bg-gray-700': { property: 'background-color', value: '#374151' },
        'bg-gray-800': { property: 'background-color', value: '#1f2937' },
        'bg-gray-900': { property: 'background-color', value: '#111827' },

        // Effects
        'shadow-sm': { property: 'box-shadow', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
        'shadow': { property: 'box-shadow', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
        'shadow-md': { property: 'box-shadow', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
        'shadow-lg': { property: 'box-shadow', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
        'shadow-xl': { property: 'box-shadow', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
        'shadow-2xl': { property: 'box-shadow', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
        'shadow-none': { property: 'box-shadow', value: 'none' },

        'rounded-none': { property: 'border-radius', value: '0' },
        'rounded-sm': { property: 'border-radius', value: '0.125rem' },
        'rounded': { property: 'border-radius', value: '0.25rem' },
        'rounded-md': { property: 'border-radius', value: '0.375rem' },
        'rounded-lg': { property: 'border-radius', value: '0.5rem' },
        'rounded-xl': { property: 'border-radius', value: '0.75rem' },
        'rounded-2xl': { property: 'border-radius', value: '1rem' },
        'rounded-3xl': { property: 'border-radius', value: '1.5rem' },
        'rounded-full': { property: 'border-radius', value: '9999px' },

        'opacity-0': { property: 'opacity', value: '0' },
        'opacity-5': { property: 'opacity', value: '0.05' },
        'opacity-10': { property: 'opacity', value: '0.1' },
        'opacity-20': { property: 'opacity', value: '0.2' },
        'opacity-25': { property: 'opacity', value: '0.25' },
        'opacity-30': { property: 'opacity', value: '0.3' },
        'opacity-40': { property: 'opacity', value: '0.4' },
        'opacity-50': { property: 'opacity', value: '0.5' },
        'opacity-60': { property: 'opacity', value: '0.6' },
        'opacity-70': { property: 'opacity', value: '0.7' },
        'opacity-75': { property: 'opacity', value: '0.75' },
        'opacity-80': { property: 'opacity', value: '0.8' },
        'opacity-90': { property: 'opacity', value: '0.9' },
        'opacity-95': { property: 'opacity', value: '0.95' },
        'opacity-100': { property: 'opacity', value: '1' },
    }

    // Responsive prefixes
    private readonly responsivePrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:']

    // Opacity modifiers (e.g., text-sm/6 means text-sm with opacity-60)
    private readonly opacityModifiers = {
        '0': '0',
        '5': '0.05',
        '10': '0.1',
        '20': '0.2',
        '25': '0.25',
        '30': '0.3',
        '40': '0.4',
        '50': '0.5',
        '60': '0.6',
        '70': '0.7',
        '75': '0.75',
        '80': '0.8',
        '90': '0.9',
        '95': '0.95',
        '100': '1'
    }

    static getInstance(): TailwindParser {
        if (!TailwindParser.instance) {
            TailwindParser.instance = new TailwindParser()
        }
        return TailwindParser.instance
    }

    /**
     * Parse Tailwind classes and return structured style properties
     */
    parseClasses(className: string): ParsedClasses {
        const classes = className.split(' ').filter(Boolean)
        const result: ParsedClasses = {
            styles: [],
            spacing: [],
            typography: [],
            layout: [],
            colors: [],
            effects: [],
            transforms: [],
            transitions: [],
            raw: className
        }

        for (const cls of classes) {
            const parsed = this.parseSingleClass(cls)
            if (parsed) {
                this.categorizeStyle(parsed, result)
            }
        }

        return result
    }

    /**
     * Parse a single Tailwind class
     */
    private parseSingleClass(className: string): ParsedStyle | null {
        // Handle opacity modifiers (e.g., text-sm/6)
        const opacityMatch = className.match(/^(.+)\/(\d+)$/)
        if (opacityMatch) {
            const baseClass = opacityMatch[1]
            const opacityValue = opacityMatch[2]
            const baseStyle = this.classMappings[baseClass as keyof typeof this.classMappings]

            if (baseStyle) {
                const opacity = this.opacityModifiers[opacityValue as keyof typeof this.opacityModifiers]
                if (opacity) {
                    return {
                        property: baseStyle.property,
                        value: baseStyle.value,
                        important: className.startsWith('!')
                    }
                }
            }
        }

        // Handle responsive prefixes
        for (const prefix of this.responsivePrefixes) {
            if (className.startsWith(prefix)) {
                const baseClass = className.substring(prefix.length)
                const baseStyle = this.classMappings[baseClass as keyof typeof this.classMappings]

                if (baseStyle) {
                    return {
                        property: baseStyle.property,
                        value: baseStyle.value,
                        responsive: prefix.slice(0, -1), // Remove the colon
                        important: className.startsWith('!')
                    }
                }
            }
        }

        // Handle regular classes
        const baseStyle = this.classMappings[className as keyof typeof this.classMappings]
        if (baseStyle) {
            return {
                property: baseStyle.property,
                value: baseStyle.value,
                important: className.startsWith('!')
            }
        }

        // Handle dynamic classes (e.g., w-12, h-8, etc.)
        const dynamicStyle = this.parseDynamicClass(className)
        if (dynamicStyle) {
            return dynamicStyle
        }

        return null
    }

    /**
     * Parse dynamic classes like w-12, h-8, etc.
     */
    private parseDynamicClass(className: string): ParsedStyle | null {
        // Width classes (w-*)
        const widthMatch = className.match(/^w-(\d+)$/)
        if (widthMatch) {
            const value = parseInt(widthMatch[1]) * 0.25 // Convert to rem
            return {
                property: 'width',
                value: `${value}rem`,
                important: className.startsWith('!')
            }
        }

        // Height classes (h-*)
        const heightMatch = className.match(/^h-(\d+)$/)
        if (heightMatch) {
            const value = parseInt(heightMatch[1]) * 0.25 // Convert to rem
            return {
                property: 'height',
                value: `${value}rem`,
                important: className.startsWith('!')
            }
        }

        // Padding classes (p-*, px-*, py-*, pt-*, pr-*, pb-*, pl-*)
        const paddingMatch = className.match(/^(p|px|py|pt|pr|pb|pl)-(\d+)$/)
        if (paddingMatch) {
            const direction = paddingMatch[1]
            const value = parseInt(paddingMatch[2]) * 0.25
            const properties = this.getPaddingProperties(direction)

            return {
                property: properties[0],
                value: `${value}rem`,
                important: className.startsWith('!')
            }
        }

        // Margin classes (m-*, mx-*, my-*, mt-*, mr-*, mb-*, ml-*)
        const marginMatch = className.match(/^(m|mx|my|mt|mr|mb|ml)-(\d+)$/)
        if (marginMatch) {
            const direction = marginMatch[1]
            const value = parseInt(marginMatch[2]) * 0.25
            const properties = this.getMarginProperties(direction)

            return {
                property: properties[0],
                value: `${value}rem`,
                important: className.startsWith('!')
            }
        }

        return null
    }

    /**
     * Get padding properties for a given direction
     */
    private getPaddingProperties(direction: string): string[] {
        switch (direction) {
            case 'p': return ['padding']
            case 'px': return ['padding-left', 'padding-right']
            case 'py': return ['padding-top', 'padding-bottom']
            case 'pt': return ['padding-top']
            case 'pr': return ['padding-right']
            case 'pb': return ['padding-bottom']
            case 'pl': return ['padding-left']
            default: return []
        }
    }

    /**
     * Get margin properties for a given direction
     */
    private getMarginProperties(direction: string): string[] {
        switch (direction) {
            case 'm': return ['margin']
            case 'mx': return ['margin-left', 'margin-right']
            case 'my': return ['margin-top', 'margin-bottom']
            case 'mt': return ['margin-top']
            case 'mr': return ['margin-right']
            case 'mb': return ['margin-bottom']
            case 'ml': return ['margin-left']
            default: return []
        }
    }

    /**
     * Categorize a parsed style into the appropriate category
     */
    private categorizeStyle(style: ParsedStyle, result: ParsedClasses): void {
        const { property } = style

        if (property.includes('font') || property.includes('text')) {
            result.typography.push(style)
        } else if (property.includes('padding') || property.includes('margin')) {
            result.spacing.push(style)
        } else if (property.includes('display') || property.includes('flex') || property.includes('grid') ||
            property.includes('width') || property.includes('height') || property.includes('justify') ||
            property.includes('align') || property.includes('items')) {
            result.layout.push(style)
        } else if (property.includes('color') || property.includes('background')) {
            result.colors.push(style)
        } else if (property.includes('shadow') || property.includes('opacity') || property.includes('border')) {
            result.effects.push(style)
        } else {
            result.styles.push(style)
        }
    }

    /**
     * Generate CSS from parsed classes
     */
    generateCSS(parsedClasses: ParsedClasses): string {
        const allStyles = [
            ...parsedClasses.typography,
            ...parsedClasses.spacing,
            ...parsedClasses.layout,
            ...parsedClasses.colors,
            ...parsedClasses.effects,
            ...parsedClasses.styles
        ]

        const cssRules: string[] = []
        const responsiveRules: { [key: string]: string[] } = {}

        for (const style of allStyles) {
            const important = style.important ? ' !important' : ''
            const rule = `${style.property}: ${style.value}${important};`

            if (style.responsive) {
                if (!responsiveRules[style.responsive]) {
                    responsiveRules[style.responsive] = []
                }
                responsiveRules[style.responsive].push(rule)
            } else {
                cssRules.push(rule)
            }
        }

        let css = cssRules.join('\n  ')

        // Add responsive rules
        for (const [breakpoint, rules] of Object.entries(responsiveRules)) {
            const mediaQuery = this.getMediaQuery(breakpoint)
            css += `\n\n@media (${mediaQuery}) {\n  ${rules.join('\n  ')}\n}`
        }

        return css
    }

    /**
     * Get media query for responsive breakpoint
     */
    private getMediaQuery(breakpoint: string): string {
        const breakpoints = {
            'sm': 'min-width: 640px',
            'md': 'min-width: 768px',
            'lg': 'min-width: 1024px',
            'xl': 'min-width: 1280px',
            '2xl': 'min-width: 1536px'
        }
        return breakpoints[breakpoint as keyof typeof breakpoints] || `min-width: ${breakpoint}px`
    }
}

export default TailwindParser
