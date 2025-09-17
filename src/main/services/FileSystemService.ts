import * as fs from 'fs/promises'
import { Stats } from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'
import { EventEmitter } from 'events'

export class FileSystemService extends EventEmitter {
    private watchers: Map<string, chokidar.FSWatcher> = new Map()

    async readFile(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            return content
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath)
            await fs.mkdir(dir, { recursive: true })

            await fs.writeFile(filePath, content, 'utf-8')

            // Emit file change event
            this.emit('file-changed', filePath, 'write')
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async watchProject(projectPath: string): Promise<string> {
        // Stop existing watcher for this project
        if (this.watchers.has(projectPath)) {
            await this.unwatchProject(projectPath)
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
        })

        watcher.on('change', (filePath) => {
            this.emit('file-changed', filePath, 'change')
        })

        watcher.on('add', (filePath) => {
            this.emit('file-changed', filePath, 'add')
        })

        watcher.on('unlink', (filePath) => {
            this.emit('file-changed', filePath, 'unlink')
        })

        watcher.on('error', (error) => {
            this.emit('error', error)
        })

        this.watchers.set(projectPath, watcher)
        return projectPath
    }

    async unwatchProject(projectPath: string): Promise<void> {
        const watcher = this.watchers.get(projectPath)
        if (watcher) {
            await watcher.close()
            this.watchers.delete(projectPath)
        }
    }

    async stopAllWatchers(): Promise<void> {
        const promises = Array.from(this.watchers.values()).map(watcher => watcher.close())
        await Promise.all(promises)
        this.watchers.clear()
    }

    async getFileStats(filePath: string): Promise<Stats> {
        try {
            return await fs.stat(filePath)
        } catch (error) {
            throw new Error(`Failed to get file stats for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async readDirectory(dirPath: string): Promise<string[]> {
        try {
            return await fs.readdir(dirPath)
        } catch (error) {
            throw new Error(`Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async createDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true })
        } catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await fs.unlink(filePath)
            this.emit('file-changed', filePath, 'unlink')
        } catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async deleteDirectory(dirPath: string): Promise<void> {
        try {
            await fs.rmdir(dirPath, { recursive: true })
            this.emit('file-changed', dirPath, 'unlink')
        } catch (error) {
            throw new Error(`Failed to delete directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async copyFile(srcPath: string, destPath: string): Promise<void> {
        try {
            await fs.copyFile(srcPath, destPath)
            this.emit('file-changed', destPath, 'add')
        } catch (error) {
            throw new Error(`Failed to copy file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async moveFile(srcPath: string, destPath: string): Promise<void> {
        try {
            await fs.rename(srcPath, destPath)
            this.emit('file-changed', srcPath, 'unlink')
            this.emit('file-changed', destPath, 'add')
        } catch (error) {
            throw new Error(`Failed to move file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath)
            return true
        } catch {
            return false
        }
    }

    async directoryExists(dirPath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(dirPath)
            return stats.isDirectory()
        } catch {
            return false
        }
    }

    async getProjectFiles(projectPath: string): Promise<string[]> {
        const files: string[] = []

        const scanDirectory = async (dirPath: string) => {
            const entries = await fs.readdir(dirPath, { withFileTypes: true })

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name)

                if (entry.isDirectory()) {
                    // Skip certain directories
                    if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) {
                        await scanDirectory(fullPath)
                    }
                } else {
                    // Only include relevant file types
                    const ext = path.extname(entry.name)
                    if (['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md'].includes(ext)) {
                        files.push(fullPath)
                    }
                }
            }
        }

        await scanDirectory(projectPath)
        return files
    }
}
