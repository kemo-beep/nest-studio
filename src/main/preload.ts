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
