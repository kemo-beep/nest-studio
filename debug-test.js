const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'dist/main/preload.js')
        }
    });

    mainWindow.loadFile('test-debug.html');
    mainWindow.webContents.openDevTools();

    // Test IPC handler
    ipcMain.handle('project:create', async (_, options) => {
        console.log('=== DEBUG TEST: project:create called ===');
        console.log('Options received:', options);
        
        // Simulate project creation
        return {
            success: true,
            data: {
                name: options.name,
                path: path.join(options.directory, options.name),
                nextjsVersion: options.nextjsVersion || '15',
                typescript: options.typescript || true,
                appRouter: options.appRouter || true,
                tailwind: options.tailwind || true,
                shadcn: options.shadcn || true,
                eslint: options.eslint || true,
                prettier: options.prettier || true
            }
        };
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
