import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { ProjectService } from './services/ProjectService'
import { FileSystemService } from './services/FileSystemService'
import { DevServerService } from './services/DevServerService'

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

class NestStudioApp {
    private projectService: ProjectService
    private fileSystemService: FileSystemService
    private devServerService: DevServerService

    constructor() {
        this.projectService = new ProjectService()
        this.fileSystemService = new FileSystemService()
        this.devServerService = new DevServerService()

        this.setupApp()
        this.setupIPC()
    }

    private setupApp() {
        // This method will be called when Electron has finished initialization
        app.whenReady().then(() => {
            this.createWindow()
            this.setupAppEvents()
        })

        // Quit when all windows are closed
        app.on('window-all-closed', () => {
            // On macOS it is common for applications to stay active until explicitly quit
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        app.on('activate', () => {
            // On macOS it's common to re-create a window when the dock icon is clicked
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow()
            }
        })
    }

    private createWindow() {
        // Create the browser window
        mainWindow = new BrowserWindow({
            width: 1400,
            height: 900,
            minWidth: 1200,
            minHeight: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, 'preload.js'),
                webSecurity: true,
            },
            titleBarStyle: 'default',
            show: false, // Don't show until ready
        })

        // Load the app
        if (isDev) {
            console.log('Loading development URL: http://localhost:3000')
            mainWindow.loadURL('http://localhost:3000')
            // Open DevTools in development
            mainWindow.webContents.openDevTools()
        } else {
            const htmlPath = path.join(__dirname, 'index.html')
            console.log('Loading production file:', htmlPath)
            mainWindow.loadFile(htmlPath)
        }

        // Handle page load events
        mainWindow.webContents.on('did-finish-load', () => {
            console.log('Page finished loading')
        })

        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            console.error('Page failed to load:', errorCode, errorDescription)
        })

        // Show window when ready to prevent visual flash
        mainWindow.once('ready-to-show', () => {
            console.log('Window ready to show')
            mainWindow?.show()
        })

        // Handle window closed
        mainWindow.on('closed', () => {
            mainWindow = null
        })

        // Handle external links
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url)
            return { action: 'deny' }
        })
    }

    private setupAppEvents() {
        // Prevent navigation to external URLs
        mainWindow?.webContents.on('will-navigate', (event, navigationUrl) => {
            const parsedUrl = new URL(navigationUrl)

            if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
                event.preventDefault()
            }
        })

        // Prevent new window creation
        mainWindow?.webContents.setWindowOpenHandler(({ url }) => {
            shell.openExternal(url)
            return { action: 'deny' }
        })
    }

    private setupIPC() {
        // Project Management IPC
        ipcMain.handle('project:create', async (_, options) => {
            try {
                const result = await this.projectService.createProject(options)
                return { success: true, data: result }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('project:import', async (_, projectPath) => {
            try {
                const result = await this.projectService.importProject(projectPath)
                return { success: true, data: result }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('project:detect', async (_, projectPath) => {
            try {
                const result = await this.projectService.detectProject(projectPath)
                return { success: true, data: result }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        // File System IPC
        ipcMain.handle('fs:readFile', async (_, filePath) => {
            try {
                const content = await this.fileSystemService.readFile(filePath)
                return { success: true, data: content }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('fs:writeFile', async (_, filePath, content) => {
            try {
                await this.fileSystemService.writeFile(filePath, content)
                return { success: true }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('fs:watch', async (_, projectPath) => {
            try {
                const watcher = await this.fileSystemService.watchProject(projectPath)
                return { success: true, data: watcher }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        // Dev Server IPC
        ipcMain.handle('devserver:start', async (_, projectPath) => {
            try {
                const result = await this.devServerService.start(projectPath)
                return { success: true, data: result }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('devserver:stop', async () => {
            try {
                await this.devServerService.stop()
                return { success: true }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        ipcMain.handle('devserver:getStatus', async () => {
            try {
                const status = await this.devServerService.getStatus()
                return { success: true, data: status }
            } catch (error) {
                return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
            }
        })

        // Dialog IPC
        ipcMain.handle('dialog:openDirectory', async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
                properties: ['openDirectory'],
                title: 'Select Project Directory'
            })

            if (!result.canceled && result.filePaths.length > 0) {
                return { success: true, data: result.filePaths[0] }
            }

            return { success: false, error: 'No directory selected' }
        })

        // App Info IPC
        ipcMain.handle('app:getVersion', () => {
            return app.getVersion()
        })

        ipcMain.handle('app:getPath', (_, name) => {
            return app.getPath(name as any)
        })
    }
}

// Create the application instance
new NestStudioApp()
