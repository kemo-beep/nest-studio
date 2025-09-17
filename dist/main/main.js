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
                preload: path_1.default.join(__dirname, 'preload.js'),
                webSecurity: true,
            },
            titleBarStyle: 'default',
            show: false, // Don't show until ready
        });
        // Load the app
        if (isDev) {
            console.log('Loading development URL: http://localhost:3000');
            mainWindow.loadURL('http://localhost:3000');
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
        });
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
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
            if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
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
            try {
                const result = await this.projectService.createProject(options);
                return { success: true, data: result };
            }
            catch (error) {
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
            const result = await electron_1.dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: 'Select Project Directory'
            });
            if (!result.canceled && result.filePaths.length > 0) {
                return { success: true, data: result.filePaths[0] };
            }
            return { success: false, error: 'No directory selected' };
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
