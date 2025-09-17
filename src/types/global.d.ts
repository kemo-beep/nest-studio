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
        }
    }
}

export {}
