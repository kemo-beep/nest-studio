"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Define the API that will be exposed to the renderer process
const electronAPI = {
    // Project Management
    project: {
        create: (options) => electron_1.ipcRenderer.invoke('project:create', options),
        import: (projectPath) => electron_1.ipcRenderer.invoke('project:import', projectPath),
        detect: (projectPath) => electron_1.ipcRenderer.invoke('project:detect', projectPath),
    },
    // File System
    fs: {
        readFile: (filePath) => electron_1.ipcRenderer.invoke('fs:readFile', filePath),
        writeFile: (filePath, content) => electron_1.ipcRenderer.invoke('fs:writeFile', filePath, content),
        watch: (projectPath) => electron_1.ipcRenderer.invoke('fs:watch', projectPath),
    },
    // Dev Server
    devserver: {
        start: (projectPath) => electron_1.ipcRenderer.invoke('devserver:start', projectPath),
        stop: () => electron_1.ipcRenderer.invoke('devserver:stop'),
        getStatus: () => electron_1.ipcRenderer.invoke('devserver:getStatus'),
    },
    // Dialogs
    dialog: {
        openDirectory: () => electron_1.ipcRenderer.invoke('dialog:openDirectory'),
    },
    // App Info
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
        getPath: (name) => electron_1.ipcRenderer.invoke('app:getPath', name),
    },
    // Event Listeners
    on: (channel, callback) => {
        const validChannels = [
            'file-changed',
            'project-updated',
            'devserver-status',
            'error'
        ];
        if (validChannels.includes(channel)) {
            electron_1.ipcRenderer.on(channel, (_, ...args) => callback(...args));
        }
    },
    off: (channel, callback) => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    }
};
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
