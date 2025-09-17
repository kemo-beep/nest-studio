import { contextBridge, ipcRenderer } from 'electron'

// Define the API that will be exposed to the renderer process
const electronAPI = {
    // Project Management
    project: {
        create: (options: any) => ipcRenderer.invoke('project:create', options),
        import: (projectPath: string) => ipcRenderer.invoke('project:import', projectPath),
        detect: (projectPath: string) => ipcRenderer.invoke('project:detect', projectPath),
    },

    // File System
    fs: {
        readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
        writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
        watch: (projectPath: string) => ipcRenderer.invoke('fs:watch', projectPath),
    },

    // Dev Server
    devserver: {
        start: (projectPath: string) => ipcRenderer.invoke('devserver:start', projectPath),
        stop: () => ipcRenderer.invoke('devserver:stop'),
        getStatus: () => ipcRenderer.invoke('devserver:getStatus'),
    },

    // Dialogs
    dialog: {
        openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
    },

    // App Info
    app: {
        getVersion: () => ipcRenderer.invoke('app:getVersion'),
        getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    },

    // Shell
    shell: {
        openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    },

    // Code Generation
    codegen: {
        parseFile: (filePath: string) => ipcRenderer.invoke('codegen:parseFile', filePath),
        generateJSX: (nodes: any[]) => ipcRenderer.invoke('codegen:generateJSX', nodes),
        createComponentFile: (componentName: string, content: string, directory?: string) =>
            ipcRenderer.invoke('codegen:createComponentFile', componentName, content, directory),
    },

    // Sync Service
    sync: {
        start: (projectPath: string) => ipcRenderer.invoke('sync:start', projectPath),
        stop: () => ipcRenderer.invoke('sync:stop'),
        addComponent: (component: any, targetFile?: string) => ipcRenderer.invoke('sync:addComponent', component, targetFile),
        updateComponent: (componentId: string, updates: any) => ipcRenderer.invoke('sync:updateComponent', componentId, updates),
        removeComponent: (componentId: string) => ipcRenderer.invoke('sync:removeComponent', componentId),
        getComponents: () => ipcRenderer.invoke('sync:getComponents'),
        getProjectState: () => ipcRenderer.invoke('sync:getProjectState'),
    },

    // Component Schema
    schema: {
        getSchema: (componentName: string) => ipcRenderer.invoke('schema:getSchema', componentName),
        getAllSchemas: () => ipcRenderer.invoke('schema:getAllSchemas'),
        getSchemasByCategory: (category: string) => ipcRenderer.invoke('schema:getSchemasByCategory', category),
        validateProp: (propSchema: any, value: any) => ipcRenderer.invoke('schema:validateProp', propSchema, value),
        getDefaultProps: (componentName: string) => ipcRenderer.invoke('schema:getDefaultProps', componentName),
    },

    // Tailwind Classes
    tailwind: {
        getAllClasses: () => ipcRenderer.invoke('tailwind:getAllClasses'),
        getClassesByCategory: (category: string) => ipcRenderer.invoke('tailwind:getClassesByCategory', category),
        getCategories: () => ipcRenderer.invoke('tailwind:getCategories'),
        searchClasses: (query: string, limit?: number) => ipcRenderer.invoke('tailwind:searchClasses', query, limit),
        validateClass: (className: string) => ipcRenderer.invoke('tailwind:validateClass', className),
        validateClassString: (classString: string) => ipcRenderer.invoke('tailwind:validateClassString', classString),
        getResponsiveVariants: (className: string) => ipcRenderer.invoke('tailwind:getResponsiveVariants', className),
        getStateVariants: (className: string) => ipcRenderer.invoke('tailwind:getStateVariants', className),
    },

    // Event Listeners
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = [
            'file-changed',
            'project-updated',
            'devserver-status',
            'error'
        ]

        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_, ...args) => callback(...args))
        }
    },

    off: (channel: string, callback: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, callback as any)
    }
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type definitions for the exposed API
declare global {
    interface Window {
        electronAPI: typeof electronAPI
    }
}
