/// <reference types="react" />

declare global {
    interface Window {
        electronAPI: {
            project: {
                create: (options: any) => Promise<{ success: boolean; data?: any; error?: string }>
                import: (projectPath: string) => Promise<{ success: boolean; data?: any; error?: string }>
                detect: (projectPath: string) => Promise<{ success: boolean; data?: any; error?: string }>
            }
            fs: {
                readFile: (filePath: string) => Promise<any>
                writeFile: (filePath: string, content: string) => Promise<any>
                watch: (projectPath: string) => Promise<any>
            }
            devserver: {
                start: (projectPath: string) => Promise<{ success: boolean; data?: any; error?: string }>
                stop: () => Promise<{ success: boolean; data?: any; error?: string }>
                getStatus: () => Promise<{ success: boolean; data?: any; error?: string }>
            }
            dialog: {
                openDirectory: () => Promise<{ success: boolean; data?: string; error?: string }>
            }
            app: {
                getVersion: () => string
                getPath: (name: string) => string
            }
            shell: {
                openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
            }
            codegen: {
                parseFile: (filePath: string) => Promise<{ success: boolean; code?: string; error?: string; ast?: any }>
                generateJSX: (nodes: any[]) => Promise<{ success: boolean; data?: string; error?: string }>
                createComponentFile: (componentName: string, content: string, directory?: string) => Promise<{ success: boolean; code?: string; error?: string }>
            }
            sync: {
                start: (projectPath: string) => Promise<{ success: boolean; error?: string }>
                stop: () => Promise<{ success: boolean; error?: string }>
                addComponent: (component: any, targetFile?: string) => Promise<{ success: boolean; error?: string }>
                updateComponent: (componentId: string, updates: any) => Promise<{ success: boolean; error?: string }>
                removeComponent: (componentId: string) => Promise<{ success: boolean; error?: string }>
                getComponents: () => Promise<{ success: boolean; data?: any[]; error?: string }>
                getProjectState: () => Promise<{ success: boolean; data?: any; error?: string }>
            }
            schema: {
                getSchema: (componentName: string) => Promise<{ success: boolean; data?: any; error?: string }>
                getAllSchemas: () => Promise<{ success: boolean; data?: any[]; error?: string }>
                getSchemasByCategory: (category: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
                validateProp: (propSchema: any, value: any) => Promise<{ success: boolean; data?: any; error?: string }>
                getDefaultProps: (componentName: string) => Promise<{ success: boolean; data?: any; error?: string }>
            }
            tailwind: {
                getAllClasses: () => Promise<{ success: boolean; data?: any[]; error?: string }>
                getClassesByCategory: (category: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
                getCategories: () => Promise<{ success: boolean; data?: string[]; error?: string }>
                searchClasses: (query: string, limit?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>
                validateClass: (className: string) => Promise<{ success: boolean; data?: any; error?: string }>
                validateClassString: (classString: string) => Promise<{ success: boolean; data?: any; error?: string }>
                getResponsiveVariants: (className: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
                getStateVariants: (className: string) => Promise<{ success: boolean; data?: string[]; error?: string }>
            }
        }
    }
}

export { }
