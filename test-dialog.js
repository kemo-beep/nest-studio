#!/usr/bin/env node

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        }
    });

    // Test dialog functionality
    ipcMain.handle('test-dialog', async () => {
        console.log('Testing dialog...');
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: 'Select Project Directory'
            });
            console.log('Dialog result:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('Dialog error:', error);
            return { success: false, error: error.message };
        }
    });

    mainWindow.loadFile('dist/index.html');

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page loaded, testing dialog...');
        mainWindow.webContents.executeJavaScript(`
            console.log('Testing dialog from renderer...');
            // Simulate clicking browse button
            setTimeout(() => {
                const browseButton = document.querySelector('button[onclick*="handleDirectorySelect"]') || 
                                   document.querySelector('button:contains("Browse")') ||
                                   document.querySelector('[data-testid="browse-directory"]');
                if (browseButton) {
                    console.log('Found browse button, clicking...');
                    browseButton.click();
                } else {
                    console.log('Browse button not found');
                    // Try to find any button with "Browse" text
                    const buttons = document.querySelectorAll('button');
                    buttons.forEach(btn => {
                        if (btn.textContent.includes('Browse')) {
                            console.log('Found browse button by text:', btn);
                            btn.click();
                        }
                    });
                }
            }, 2000);
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
