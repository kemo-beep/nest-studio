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
// Keep a global reference of the window object
let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development';
class NestStudioApp {
    constructor() {
        this.projectService = new ProjectService_1.ProjectService();
        this.fileSystemService = new FileSystemService_1.FileSystemService();
        this.devServerService = new DevServerService_1.DevServerService();
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
            // Try port 3000 first, then 3001 if 3000 is busy
            const tryLoadDev = async () => {
                try {
                    console.log('Trying to load development URL: http://localhost:3000');
                    await mainWindow.loadURL('http://localhost:3000');
                    console.log('Successfully loaded from port 3000');
                }
                catch (error) {
                    try {
                        console.log('Port 3000 failed, trying port 3001...');
                        await mainWindow.loadURL('http://localhost:3001');
                        console.log('Successfully loaded from port 3001');
                    }
                    catch (error2) {
                        console.error('Failed to load from both ports:', error2);
                        // Fallback to production build
                        const htmlPath = path_1.default.join(__dirname, 'index.html');
                        console.log('Falling back to production file:', htmlPath);
                        mainWindow.loadFile(htmlPath);
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
                const result = await this.projectService.detectProject(projectPath);
                return { success: true, data: result };
            }
            catch (error) {
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
        electron_1.ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
            try {
                await this.fileSystemService.writeFile(filePath, content);
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
    }
}
// Create the application instance
new NestStudioApp();
