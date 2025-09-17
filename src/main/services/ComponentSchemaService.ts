export interface PropSchema {
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum' | 'color' | 'file'
    required?: boolean
    defaultValue?: any
    description?: string
    options?: string[] // For enum types
    validation?: {
        min?: number
        max?: number
        pattern?: string
        custom?: (value: any) => boolean | string
    }
    nested?: PropSchema[] // For object types
    itemType?: PropSchema // For array types
}

export interface ComponentSchema {
    name: string
    displayName: string
    description?: string
    category: string
    props: PropSchema[]
    examples?: {
        [key: string]: any
    }
}

export class ComponentSchemaService {
    private schemas: Map<string, ComponentSchema> = new Map()

    constructor() {
        this.initializeDefaultSchemas()
    }

    /**
     * Register a component schema
     */
    registerSchema(schema: ComponentSchema): void {
        this.schemas.set(schema.name, schema)
    }

    /**
     * Get a component schema by name
     */
    getSchema(componentName: string): ComponentSchema | undefined {
        return this.schemas.get(componentName)
    }

    /**
     * Get all registered schemas
     */
    getAllSchemas(): ComponentSchema[] {
        return Array.from(this.schemas.values())
    }

    /**
     * Get schemas by category
     */
    getSchemasByCategory(category: string): ComponentSchema[] {
        return Array.from(this.schemas.values()).filter(schema => schema.category === category)
    }

    /**
     * Validate a prop value against its schema
     */
    validateProp(schema: PropSchema, value: any): { valid: boolean; error?: string } {
        // Check required
        if (schema.required && (value === undefined || value === null || value === '')) {
            return { valid: false, error: `${schema.name} is required` }
        }

        // Skip validation if value is empty and not required
        if (!schema.required && (value === undefined || value === null || value === '')) {
            return { valid: true }
        }

        // Type validation
        switch (schema.type) {
            case 'string':
                if (typeof value !== 'string') {
                    return { valid: false, error: `${schema.name} must be a string` }
                }
                break
            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    return { valid: false, error: `${schema.name} must be a number` }
                }
                break
            case 'boolean':
                if (typeof value !== 'boolean') {
                    return { valid: false, error: `${schema.name} must be a boolean` }
                }
                break
            case 'object':
                if (typeof value !== 'object' || Array.isArray(value)) {
                    return { valid: false, error: `${schema.name} must be an object` }
                }
                break
            case 'array':
                if (!Array.isArray(value)) {
                    return { valid: false, error: `${schema.name} must be an array` }
                }
                break
            case 'enum':
                if (!schema.options?.includes(value)) {
                    return { valid: false, error: `${schema.name} must be one of: ${schema.options?.join(', ')}` }
                }
                break
        }

        // Custom validation
        if (schema.validation?.custom) {
            const result = schema.validation.custom(value)
            if (result !== true) {
                return { valid: false, error: typeof result === 'string' ? result : `${schema.name} is invalid` }
            }
        }

        // Range validation for numbers
        if (schema.type === 'number' && schema.validation) {
            if (schema.validation.min !== undefined && value < schema.validation.min) {
                return { valid: false, error: `${schema.name} must be at least ${schema.validation.min}` }
            }
            if (schema.validation.max !== undefined && value > schema.validation.max) {
                return { valid: false, error: `${schema.name} must be at most ${schema.validation.max}` }
            }
        }

        // Pattern validation for strings
        if (schema.type === 'string' && schema.validation?.pattern) {
            const regex = new RegExp(schema.validation.pattern)
            if (!regex.test(value)) {
                return { valid: false, error: `${schema.name} format is invalid` }
            }
        }

        return { valid: true }
    }

    /**
     * Get default props for a component
     */
    getDefaultProps(componentName: string): Record<string, any> {
        const schema = this.getSchema(componentName)
        if (!schema) return {}

        const defaultProps: Record<string, any> = {}
        schema.props.forEach(prop => {
            if (prop.defaultValue !== undefined) {
                defaultProps[prop.name] = prop.defaultValue
            }
        })
        return defaultProps
    }

    /**
     * Initialize default component schemas
     */
    private initializeDefaultSchemas(): void {
        // Button component schema
        this.registerSchema({
            name: 'Button',
            displayName: 'Button',
            description: 'A clickable button component',
            category: 'Form',
            props: [
                {
                    name: 'children',
                    type: 'string',
                    required: true,
                    defaultValue: 'Button',
                    description: 'Button text content'
                },
                {
                    name: 'variant',
                    type: 'enum',
                    required: false,
                    defaultValue: 'default',
                    options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
                    description: 'Button visual style variant'
                },
                {
                    name: 'size',
                    type: 'enum',
                    required: false,
                    defaultValue: 'default',
                    options: ['default', 'sm', 'lg', 'icon'],
                    description: 'Button size'
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    required: false,
                    defaultValue: false,
                    description: 'Whether the button is disabled'
                },
                {
                    name: 'onClick',
                    type: 'string',
                    required: false,
                    description: 'Click handler function (as string)'
                },
                {
                    name: 'className',
                    type: 'string',
                    required: false,
                    description: 'Additional CSS classes'
                }
            ],
            examples: {
                primary: { variant: 'default', children: 'Primary Button' },
                secondary: { variant: 'secondary', children: 'Secondary Button' },
                outline: { variant: 'outline', children: 'Outline Button' },
                destructive: { variant: 'destructive', children: 'Delete' },
                small: { size: 'sm', children: 'Small Button' },
                large: { size: 'lg', children: 'Large Button' }
            }
        })

        // Input component schema
        this.registerSchema({
            name: 'Input',
            displayName: 'Input',
            description: 'A text input component',
            category: 'Form',
            props: [
                {
                    name: 'type',
                    type: 'enum',
                    required: false,
                    defaultValue: 'text',
                    options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
                    description: 'Input type'
                },
                {
                    name: 'placeholder',
                    type: 'string',
                    required: false,
                    description: 'Placeholder text'
                },
                {
                    name: 'value',
                    type: 'string',
                    required: false,
                    description: 'Input value'
                },
                {
                    name: 'disabled',
                    type: 'boolean',
                    required: false,
                    defaultValue: false,
                    description: 'Whether the input is disabled'
                },
                {
                    name: 'required',
                    type: 'boolean',
                    required: false,
                    defaultValue: false,
                    description: 'Whether the input is required'
                },
                {
                    name: 'className',
                    type: 'string',
                    required: false,
                    description: 'Additional CSS classes'
                }
            ],
            examples: {
                text: { type: 'text', placeholder: 'Enter text...' },
                email: { type: 'email', placeholder: 'Enter email...' },
                password: { type: 'password', placeholder: 'Enter password...' },
                disabled: { type: 'text', placeholder: 'Disabled input', disabled: true }
            }
        })

        // Card component schema
        this.registerSchema({
            name: 'Card',
            displayName: 'Card',
            description: 'A card container component',
            category: 'Layout',
            props: [
                {
                    name: 'children',
                    type: 'string',
                    required: false,
                    description: 'Card content'
                },
                {
                    name: 'title',
                    type: 'string',
                    required: false,
                    description: 'Card title'
                },
                {
                    name: 'description',
                    type: 'string',
                    required: false,
                    description: 'Card description'
                },
                {
                    name: 'className',
                    type: 'string',
                    required: false,
                    description: 'Additional CSS classes'
                }
            ],
            examples: {
                basic: { title: 'Card Title', description: 'Card description' },
                withContent: { title: 'Card Title', children: 'Card content goes here' }
            }
        })

        // Badge component schema
        this.registerSchema({
            name: 'Badge',
            displayName: 'Badge',
            description: 'A badge component for labels and status',
            category: 'Display',
            props: [
                {
                    name: 'children',
                    type: 'string',
                    required: true,
                    defaultValue: 'Badge',
                    description: 'Badge text content'
                },
                {
                    name: 'variant',
                    type: 'enum',
                    required: false,
                    defaultValue: 'default',
                    options: ['default', 'secondary', 'destructive', 'outline'],
                    description: 'Badge visual style variant'
                },
                {
                    name: 'className',
                    type: 'string',
                    required: false,
                    description: 'Additional CSS classes'
                }
            ],
            examples: {
                default: { children: 'Default' },
                secondary: { variant: 'secondary', children: 'Secondary' },
                destructive: { variant: 'destructive', children: 'Error' },
                outline: { variant: 'outline', children: 'Outline' }
            }
        })

        // Avatar component schema
        this.registerSchema({
            name: 'Avatar',
            displayName: 'Avatar',
            description: 'An avatar component for user images',
            category: 'Display',
            props: [
                {
                    name: 'src',
                    type: 'string',
                    required: false,
                    description: 'Image source URL'
                },
                {
                    name: 'alt',
                    type: 'string',
                    required: false,
                    description: 'Alt text for the image'
                },
                {
                    name: 'fallback',
                    type: 'string',
                    required: false,
                    description: 'Fallback text when image fails to load'
                },
                {
                    name: 'size',
                    type: 'enum',
                    required: false,
                    defaultValue: 'default',
                    options: ['sm', 'default', 'lg'],
                    description: 'Avatar size'
                },
                {
                    name: 'className',
                    type: 'string',
                    required: false,
                    description: 'Additional CSS classes'
                }
            ],
            examples: {
                withImage: { src: 'https://github.com/shadcn.png', alt: 'User avatar' },
                withFallback: { fallback: 'JD', alt: 'John Doe' },
                small: { size: 'sm', fallback: 'AB' },
                large: { size: 'lg', fallback: 'CD' }
            }
        })
    }
}
