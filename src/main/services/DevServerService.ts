import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { createServer } from 'net'

export interface DevServerStatus {
    isRunning: boolean
    port?: number
    url?: string
    pid?: number
    error?: string
}

export class DevServerService extends EventEmitter {
    private process: ChildProcess | null = null
    private status: DevServerStatus = { isRunning: false }

    async start(projectPath: string): Promise<DevServerStatus> {
        if (this.status.isRunning) {
            return this.status
        }

        try {
            // Check if project path exists and has package.json
            const fs = require('fs')
            const path = require('path')

            if (!fs.existsSync(projectPath)) {
                throw new Error(`Project path does not exist: ${projectPath}`)
            }

            const packageJsonPath = path.join(projectPath, 'package.json')
            if (!fs.existsSync(packageJsonPath)) {
                throw new Error(`No package.json found in project path: ${projectPath}`)
            }

            // Find available port
            const port = await this.findAvailablePort()
            console.log(`Starting dev server on port ${port} for project: ${projectPath}`)

            return new Promise((resolve, reject) => {
                // Start Next.js dev server with specific port
                this.process = spawn('npx', ['next', 'dev', '--port', port.toString()], {
                    cwd: projectPath,
                    stdio: ['pipe', 'pipe', 'pipe']
                })

                this.process.on('error', (error) => {
                    this.status = { isRunning: false, error: error.message }
                    this.emit('error', error)
                    reject(error)
                })

                this.process.on('exit', (code) => {
                    this.status = { isRunning: false }
                    this.emit('stopped', code)
                })

                // Wait for server to start
                let serverStarted = false
                const timeout = setTimeout(() => {
                    if (!serverStarted) {
                        this.stop()
                        reject(new Error('Dev server startup timeout'))
                    }
                }, 30000) // 30 second timeout

                this.process.stdout?.on('data', (data) => {
                    const output = data.toString()
                    console.log('Dev server output:', output)

                    // Check for server ready message
                    if (output.includes('Ready in') || output.includes('Local:')) {
                        if (!serverStarted) {
                            serverStarted = true
                            clearTimeout(timeout)

                            this.status = {
                                isRunning: true,
                                port,
                                url: `http://localhost:${port}`,
                                pid: this.process?.pid
                            }

                            this.emit('started', this.status)
                            resolve(this.status)
                        }
                    }
                })

                this.process.stderr?.on('data', (data) => {
                    const error = data.toString()
                    console.error('Dev server error:', error)
                    this.emit('error', new Error(error))
                })
            })
        } catch (error) {
            console.error('Failed to start dev server:', error)
            this.status = { isRunning: false, error: error instanceof Error ? error.message : String(error) }
            throw error
        }
    }

    async stop(): Promise<void> {
        if (this.process && this.status.isRunning) {
            return new Promise((resolve) => {
                this.process!.on('exit', () => {
                    this.status = { isRunning: false }
                    this.process = null
                    this.emit('stopped')
                    resolve()
                })

                this.process!.kill('SIGTERM')

                // Force kill after 5 seconds
                setTimeout(() => {
                    if (this.process && this.status.isRunning) {
                        this.process.kill('SIGKILL')
                    }
                }, 5000)
            })
        }
    }

    getStatus(): DevServerStatus {
        return { ...this.status }
    }

    private async findAvailablePort(): Promise<number> {
        // Start from port 3000 to avoid conflict with Nest Studio (port 5000)
        const startPort = 3000
        const maxPort = 3010

        for (let port = startPort; port <= maxPort; port++) {
            if (await this.isPortAvailable(port)) {
                return port
            }
        }

        throw new Error('No available ports found')
    }

    private async isPortAvailable(port: number): Promise<boolean> {
        return new Promise((resolve) => {
            const server = createServer()

            server.listen(port, () => {
                server.close(() => {
                    resolve(true)
                })
            })

            server.on('error', () => {
                resolve(false)
            })
        })
    }

    async restart(projectPath: string): Promise<DevServerStatus> {
        await this.stop()
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
        return this.start(projectPath)
    }

    isRunning(): boolean {
        return this.status.isRunning
    }

    getUrl(): string | undefined {
        return this.status.url
    }

    getPort(): number | undefined {
        return this.status.port
    }
}
