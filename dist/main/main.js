"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const ProjectService_1 = require("./services/ProjectService");
const FileSystemService_1 = require("./services/FileSystemService");
const DevServerService_1 = require("./services/DevServerService");
const CodeGenerationService_1 = require("./services/CodeGenerationService");
const SyncService_1 = require("./services/SyncService");
const ComponentSchemaService_1 = require("./services/ComponentSchemaService");
const TailwindService_1 = require("./services/TailwindService");
// Keep a global reference of the window object
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';
class NestStudioApp {
    constructor() {
        this.codeGenerationService = null;
        this.syncService = null;
        this.projectService = new ProjectService_1.ProjectService();
        this.fileSystemService = new FileSystemService_1.FileSystemService();
        this.devServerService = new DevServerService_1.DevServerService();
        this.componentSchemaService = new ComponentSchemaService_1.ComponentSchemaService();
        this.tailwindService = new TailwindService_1.TailwindService();
        this.setupApp();
        this.setupIPC();
    }
    setupApp() {
        // This method will be called when Electron has finished initialization
        electron_1.app.whenReady().then(() => {
            this.createWindow();
            this.setupAppEvents();
        });
        // Quit when all windows are closed
        electron_1.app.on('window-all-closed', () => {
            // On macOS it is common for applications to stay active until explicitly quit
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', () => {
            // On macOS it's common to re-create a window when the dock icon is clicked
            if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                this.createWindow();
            }
        });
    }
    createWindow() {
        // Create the browser window
        mainWindow = new electron_1.BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1200,
            minHeight: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path_1.default.join(__dirname, 'main/preload.js'),
                webSecurity: true,
            },
            titleBarStyle: 'default',
            show: false, // Don't show until ready
        });
        // Load the app
        if (isDev) {
            // Try port 5000 first, then 5001 if 5000 is busy
            const tryLoadDev = async () => {
                try {
                    console.log('Trying to load development URL: http://localhost:5000');
                    await mainWindow.loadURL('http://localhost:5000');
                    console.log('Successfully loaded from port 5000');
                    mainWindow.show(); // Show the window after loading
                }
                catch (error) {
                    try {
                        console.log('Port 5000 failed, trying port 5001...');
                        await mainWindow.loadURL('http://localhost:5001');
                        console.log('Successfully loaded from port 5001');
                        mainWindow.show(); // Show the window after loading
                    }
                    catch (error2) {
                        console.error('Failed to load from both ports:', error2);
                        // Fallback to production build
                        const htmlPath = path_1.default.join(__dirname, 'index.html');
                        console.log('Falling back to production file:', htmlPath);
                        mainWindow.loadFile(htmlPath);
                        mainWindow.show(); // Show the window after loading
                    }
                }
            };
            tryLoadDev();
            // Open DevTools in development
            mainWindow.webContents.openDevTools();
        }
        else {
            const htmlPath = path_1.default.join(__dirname, 'index.html');
            console.log('Loading production file:', htmlPath);
            mainWindow.loadFile(htmlPath);
            mainWindow.show(); // Show the window after loading
        }
        // Handle page load events
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('Page finished loading');
            // Test if preload script is working
            mainWindow?.webContents.executeJavaScript(`
                console.log('Testing preload script...')
                console.log('window.electronAPI:', window.electronAPI)
                console.log('dialog available:', !!window.electronAPI?.dialog?.openDirectory)
            `);
        });
        mainWindow.webContents.on('did-fail-load', (_, errorCode, errorDescription) => {
            console.error('Page failed to load:', errorCode, errorDescription);
        });
        // Show window when ready to prevent visual flash
        mainWindow.once('ready-to-show', () => {
            console.log('Window ready to show');
            mainWindow?.show();
        });
        // Handle window closed
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        // Handle external links
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        });
    }
    setupAppEvents() {
        // Prevent navigation to external URLs
        mainWindow?.webContents.on('will-navigate', (event, navigationUrl) => {
            const parsedUrl = new URL(navigationUrl);
            // Allow localhost ports 3000 and 3001 in development
            const allowedOrigins = isDev
                ? ['http://localhost:3000', 'http://localhost:3001']
                : ['http://localhost:3000'];
            if (!allowedOrigins.includes(parsedUrl.origin)) {
                event.preventDefault();
            }
        });
        // Prevent new window creation
        mainWindow?.webContents.setWindowOpenHandler(({ url }) => {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        });
    }
    setupIPC() {
        // Project Management IPC
        electron_1.ipcMain.handle('project:create', async (_, options) => {
            console.log('=== MAIN PROCESS: project:create called ===');
            console.log('Options received:', options);
            try {
                console.log('Calling projectService.createProject...');
                const result = await this.projectService.createProject(options);
                console.log('Project created successfully:', result);
                return { success: true, data: result };
            }
            catch (error) {
                console.error('Error creating project:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('project:import', async (_, projectPath) => {
            try {
                const result = await this.projectService.importProject(projectPath);
                return { success: true, data: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('project:detect', async (_, projectPath) => {
            try {
                console.log('Main process: project:detect called with path:', projectPath);
                const result = await this.projectService.detectProject(projectPath);
                console.log('Main process: project detection result:', result);
                return { success: true, data: result };
            }
            catch (error) {
                console.log('Main process: project detection error:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // File System IPC
        electron_1.ipcMain.handle('fs:readFile', async (_, filePath) => {
            try {
                const content = await this.fileSystemService.readFile(filePath);
                return { success: true, data: content };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('fs:readDirectory', async (_, dirPath) => {
            try {
                console.log('Main process: fs:readDirectory called with path:', dirPath);
                const items = await this.fileSystemService.readDirectory(dirPath);
                console.log('Main process: readDirectory result:', items);
                return { success: true, data: items };
            }
            catch (error) {
                console.log('Main process: readDirectory error:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
            try {
                await this.fileSystemService.writeFile(filePath, content);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('fs:getFileStats', async (_, filePath) => {
            try {
                console.log('Main process: fs:getFileStats called with path:', filePath);
                const stats = await this.fileSystemService.getFileStats(filePath);
                console.log('Main process: getFileStats result:', stats);
                return { success: true, data: stats };
            }
            catch (error) {
                console.log('Main process: getFileStats error:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('fs:createDirectory', async (_, dirPath) => {
            try {
                await this.fileSystemService.createDirectory(dirPath);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('fs:watch', async (_, projectPath) => {
            try {
                const watcher = await this.fileSystemService.watchProject(projectPath);
                return { success: true, data: watcher };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Dev Server IPC
        electron_1.ipcMain.handle('devserver:start', async (_, projectPath) => {
            try {
                const result = await this.devServerService.start(projectPath);
                return { success: true, data: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('devserver:stop', async () => {
            try {
                await this.devServerService.stop();
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('devserver:getStatus', async () => {
            try {
                const status = await this.devServerService.getStatus();
                return { success: true, data: status };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Dialog IPC
        electron_1.ipcMain.handle('dialog:openDirectory', async () => {
            console.log('=== MAIN PROCESS: dialog:openDirectory called ===');
            try {
                console.log('Main window exists:', !!mainWindow);
                console.log('Calling dialog.showOpenDialog...');
                const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                    properties: ['openDirectory'],
                    title: 'Select Project Directory'
                });
                console.log('Dialog result:', result);
                if (!result.canceled && result.filePaths.length > 0) {
                    console.log('Directory selected:', result.filePaths[0]);
                    return { success: true, data: result.filePaths[0] };
                }
                console.log('No directory selected');
                return { success: false, error: 'No directory selected' };
            }
            catch (error) {
                console.error('Dialog error:', error);
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // App Info IPC
        electron_1.ipcMain.handle('app:getVersion', () => {
            return electron_1.app.getVersion();
        });
        electron_1.ipcMain.handle('app:getPath', (_, name) => {
            return electron_1.app.getPath(name);
        });
        // Code Generation IPC handlers
        electron_1.ipcMain.handle('codegen:parseFile', async (_, filePath) => {
            try {
                if (!this.codeGenerationService) {
                    return { success: false, error: 'Code generation service not initialized' };
                }
                const result = await this.codeGenerationService.parseFile(filePath);
                return result;
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('codegen:generateJSX', async (_, nodes) => {
            try {
                if (!this.codeGenerationService) {
                    return { success: false, error: 'Code generation service not initialized' };
                }
                const jsx = this.codeGenerationService.generateJSXFromNodes(nodes);
                return { success: true, data: jsx };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('codegen:createComponentFile', async (_, componentName, content, directory) => {
            try {
                if (!this.codeGenerationService) {
                    return { success: false, error: 'Code generation service not initialized' };
                }
                const result = await this.codeGenerationService.createComponentFile(componentName, content, directory);
                return result;
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Sync Service IPC handlers
        electron_1.ipcMain.handle('sync:start', async (_, projectPath) => {
            try {
                this.syncService = new SyncService_1.SyncService(projectPath);
                this.codeGenerationService = new CodeGenerationService_1.CodeGenerationService(projectPath);
                await this.syncService.startWatching();
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:stop', async () => {
            try {
                if (this.syncService) {
                    await this.syncService.stopWatching();
                }
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:addComponent', async (_, component, targetFile) => {
            try {
                if (!this.syncService) {
                    return { success: false, error: 'Sync service not initialized' };
                }
                const result = await this.syncService.addComponent(component, targetFile);
                return { success: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:updateComponent', async (_, componentId, updates) => {
            try {
                if (!this.syncService) {
                    return { success: false, error: 'Sync service not initialized' };
                }
                const result = await this.syncService.updateComponent(componentId, updates);
                return { success: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:removeComponent', async (_, componentId) => {
            try {
                if (!this.syncService) {
                    return { success: false, error: 'Sync service not initialized' };
                }
                const result = await this.syncService.removeComponent(componentId);
                return { success: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:getComponents', async () => {
            try {
                if (!this.syncService) {
                    return { success: false, error: 'Sync service not initialized' };
                }
                const components = this.syncService.getComponents();
                return { success: true, data: components };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('sync:getProjectState', async () => {
            try {
                if (!this.syncService) {
                    return { success: false, error: 'Sync service not initialized' };
                }
                const state = this.syncService.getProjectState();
                return { success: true, data: state };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Component Schema IPC handlers
        electron_1.ipcMain.handle('schema:getSchema', async (_, componentName) => {
            try {
                const schema = this.componentSchemaService.getSchema(componentName);
                return { success: true, data: schema };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('schema:getAllSchemas', async () => {
            try {
                const schemas = this.componentSchemaService.getAllSchemas();
                return { success: true, data: schemas };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('schema:getSchemasByCategory', async (_, category) => {
            try {
                const schemas = this.componentSchemaService.getSchemasByCategory(category);
                return { success: true, data: schemas };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('schema:validateProp', async (_, propSchema, value) => {
            try {
                const result = this.componentSchemaService.validateProp(propSchema, value);
                return { success: true, data: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('schema:getDefaultProps', async (_, componentName) => {
            try {
                const defaultProps = this.componentSchemaService.getDefaultProps(componentName);
                return { success: true, data: defaultProps };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Tailwind Service IPC handlers
        electron_1.ipcMain.handle('tailwind:getAllClasses', async () => {
            try {
                const classes = this.tailwindService.getAllClasses();
                return { success: true, data: classes };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:getClassesByCategory', async (_, category) => {
            try {
                const classes = this.tailwindService.getClassesByCategory(category);
                return { success: true, data: classes };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:getCategories', async () => {
            try {
                const categories = this.tailwindService.getCategories();
                return { success: true, data: categories };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:searchClasses', async (_, query, limit) => {
            try {
                const suggestions = this.tailwindService.searchClasses(query, limit);
                return { success: true, data: suggestions };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:validateClass', async (_, className) => {
            try {
                const result = this.tailwindService.validateClass(className);
                return { success: true, data: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:validateClassString', async (_, classString) => {
            try {
                const result = this.tailwindService.validateClassString(classString);
                return { success: true, data: result };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:getResponsiveVariants', async (_, className) => {
            try {
                const variants = this.tailwindService.getResponsiveVariants(className);
                return { success: true, data: variants };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        electron_1.ipcMain.handle('tailwind:getStateVariants', async (_, className) => {
            try {
                const variants = this.tailwindService.getStateVariants(className);
                return { success: true, data: variants };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
        // Shell IPC handlers
        electron_1.ipcMain.handle('shell:openExternal', async (_, url) => {
            try {
                await electron_1.shell.openExternal(url);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
            }
        });
    }
}
// Create the application instance
new NestStudioApp();
