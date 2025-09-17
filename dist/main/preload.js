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
    // Shell
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url),
    },
    // Code Generation
    codegen: {
        parseFile: (filePath) => electron_1.ipcRenderer.invoke('codegen:parseFile', filePath),
        generateJSX: (nodes) => electron_1.ipcRenderer.invoke('codegen:generateJSX', nodes),
        createComponentFile: (componentName, content, directory) => electron_1.ipcRenderer.invoke('codegen:createComponentFile', componentName, content, directory),
    },
    // Sync Service
    sync: {
        start: (projectPath) => electron_1.ipcRenderer.invoke('sync:start', projectPath),
        stop: () => electron_1.ipcRenderer.invoke('sync:stop'),
        addComponent: (component, targetFile) => electron_1.ipcRenderer.invoke('sync:addComponent', component, targetFile),
        updateComponent: (componentId, updates) => electron_1.ipcRenderer.invoke('sync:updateComponent', componentId, updates),
        removeComponent: (componentId) => electron_1.ipcRenderer.invoke('sync:removeComponent', componentId),
        getComponents: () => electron_1.ipcRenderer.invoke('sync:getComponents'),
        getProjectState: () => electron_1.ipcRenderer.invoke('sync:getProjectState'),
    },
    // Component Schema
    schema: {
        getSchema: (componentName) => electron_1.ipcRenderer.invoke('schema:getSchema', componentName),
        getAllSchemas: () => electron_1.ipcRenderer.invoke('schema:getAllSchemas'),
        getSchemasByCategory: (category) => electron_1.ipcRenderer.invoke('schema:getSchemasByCategory', category),
        validateProp: (propSchema, value) => electron_1.ipcRenderer.invoke('schema:validateProp', propSchema, value),
        getDefaultProps: (componentName) => electron_1.ipcRenderer.invoke('schema:getDefaultProps', componentName),
    },
    // Tailwind Classes
    tailwind: {
        getAllClasses: () => electron_1.ipcRenderer.invoke('tailwind:getAllClasses'),
        getClassesByCategory: (category) => electron_1.ipcRenderer.invoke('tailwind:getClassesByCategory', category),
        getCategories: () => electron_1.ipcRenderer.invoke('tailwind:getCategories'),
        searchClasses: (query, limit) => electron_1.ipcRenderer.invoke('tailwind:searchClasses', query, limit),
        validateClass: (className) => electron_1.ipcRenderer.invoke('tailwind:validateClass', className),
        validateClassString: (classString) => electron_1.ipcRenderer.invoke('tailwind:validateClassString', classString),
        getResponsiveVariants: (className) => electron_1.ipcRenderer.invoke('tailwind:getResponsiveVariants', className),
        getStateVariants: (className) => electron_1.ipcRenderer.invoke('tailwind:getStateVariants', className),
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
