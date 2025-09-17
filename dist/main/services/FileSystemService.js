"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemService = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const chokidar = __importStar(require("chokidar"));
const events_1 = require("events");
class FileSystemService extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.watchers = new Map();
    }
    async readFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return content;
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async writeFile(filePath, content) {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, content, 'utf-8');
            // Emit file change event
            this.emit('file-changed', filePath, 'write');
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async watchProject(projectPath) {
        // Stop existing watcher for this project
        if (this.watchers.has(projectPath)) {
            await this.unwatchProject(projectPath);
        }
        const watcher = chokidar.watch(projectPath, {
            ignored: [
                /node_modules/,
                /\.git/,
                /\.next/,
                /dist/,
                /build/,
                /coverage/,
                /\.DS_Store/,
                /Thumbs\.db/
            ],
            persistent: true,
            ignoreInitial: true
        });
        watcher.on('change', (filePath) => {
            this.emit('file-changed', filePath, 'change');
        });
        watcher.on('add', (filePath) => {
            this.emit('file-changed', filePath, 'add');
        });
        watcher.on('unlink', (filePath) => {
            this.emit('file-changed', filePath, 'unlink');
        });
        watcher.on('error', (error) => {
            this.emit('error', error);
        });
        this.watchers.set(projectPath, watcher);
        return projectPath;
    }
    async unwatchProject(projectPath) {
        const watcher = this.watchers.get(projectPath);
        if (watcher) {
            await watcher.close();
            this.watchers.delete(projectPath);
        }
    }
    async stopWatching() {
        const unwatchPromises = Array.from(this.watchers.keys()).map(path => this.unwatchProject(path));
        await Promise.all(unwatchPromises);
    }
    async stopAllWatchers() {
        const promises = Array.from(this.watchers.values()).map(watcher => watcher.close());
        await Promise.all(promises);
        this.watchers.clear();
    }
    async getFileStats(filePath) {
        try {
            return await fs.stat(filePath);
        }
        catch (error) {
            throw new Error(`Failed to get file stats for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async readDirectory(dirPath) {
        try {
            return await fs.readdir(dirPath);
        }
        catch (error) {
            throw new Error(`Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            this.emit('file-changed', filePath, 'unlink');
        }
        catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteDirectory(dirPath) {
        try {
            await fs.rmdir(dirPath, { recursive: true });
            this.emit('file-changed', dirPath, 'unlink');
        }
        catch (error) {
            throw new Error(`Failed to delete directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async copyFile(srcPath, destPath) {
        try {
            await fs.copyFile(srcPath, destPath);
            this.emit('file-changed', destPath, 'add');
        }
        catch (error) {
            throw new Error(`Failed to copy file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async moveFile(srcPath, destPath) {
        try {
            await fs.rename(srcPath, destPath);
            this.emit('file-changed', srcPath, 'unlink');
            this.emit('file-changed', destPath, 'add');
        }
        catch (error) {
            throw new Error(`Failed to move file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async directoryExists(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    async getProjectFiles(projectPath) {
        const files = [];
        const scanDirectory = async (dirPath) => {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    // Skip certain directories
                    if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) {
                        await scanDirectory(fullPath);
                    }
                }
                else {
                    // Only include relevant file types
                    const ext = path.extname(entry.name);
                    if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md'].includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        };
        await scanDirectory(projectPath);
        return files;
    }
}
exports.FileSystemService = FileSystemService;
