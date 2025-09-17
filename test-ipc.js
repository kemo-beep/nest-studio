// Test IPC communication
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

    // Load a simple HTML page
    mainWindow.loadFile('index.html');

    // Test IPC handler
    ipcMain.handle('test:ping', () => {
        console.log('✅ IPC test ping received!');
        return { success: true, message: 'pong' };
    });

    // Test project creation handler
    ipcMain.handle('project:create', async (_, options) => {
        console.log('=== TEST IPC: project:create called ===');
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

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page loaded, testing IPC...');
        
        // Test the IPC communication
        mainWindow.webContents.executeJavaScript(`
            console.log('Testing IPC communication...');
            console.log('window.electronAPI:', window.electronAPI);
            
            if (window.electronAPI) {
                // Test ping
                window.electronAPI.project.create({
                    name: 'test-project',
                    directory: '/tmp',
                    nextjsVersion: '15',
                    typescript: true,
                    appRouter: true,
                    tailwind: true,
                    shadcn: true,
                    eslint: true,
                    prettier: true
                }).then(result => {
                    console.log('✅ Project creation test result:', result);
                }).catch(error => {
                    console.error('❌ Project creation test error:', error);
                });
            } else {
                console.error('❌ electronAPI not available');
            }
        `);
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
