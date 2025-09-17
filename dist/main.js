"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));

// src/main/services/ProjectService.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs/promises"));
var path = __toESM(require("path"));
var ProjectService = class {
  async createProject(options) {
    console.log("Creating project with options:", options);
    const {
      name,
      directory,
      nextjsVersion = "15",
      typescript = true,
      appRouter = true,
      tailwind = true,
      shadcn = true,
      eslint = true,
      prettier = true
    } = options;
    const projectPath = path.join(directory, name);
    console.log("Project path:", projectPath);
    try {
      await fs.mkdir(projectPath, { recursive: true });
      console.log("Created project directory");
      console.log("Running create-next-app...");
      await this.runCreateNextApp(projectPath, {
        nextjsVersion,
        typescript,
        appRouter,
        tailwind,
        eslint,
        prettier
      });
      console.log("create-next-app completed");
      if (shadcn) {
        console.log("Setting up shadcn/ui...");
        await this.setupShadcnUI(projectPath);
        console.log("shadcn/ui setup completed");
      }
      console.log("Creating project structure...");
      await this.createProjectStructure(projectPath, { typescript, appRouter });
      console.log("Project structure created");
      console.log("Generating project info...");
      const projectInfo = await this.generateProjectInfo(projectPath);
      console.log("Project created successfully:", projectInfo);
      return projectInfo;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }
  async importProject(projectPath) {
    if (!await this.isValidNextJSProject(projectPath)) {
      throw new Error("Invalid Next.js project directory");
    }
    const projectInfo = await this.detectProject(projectPath);
    return projectInfo;
  }
  async detectProject(projectPath) {
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!await this.fileExists(packageJsonPath)) {
      throw new Error("package.json not found");
    }
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    const nextVersion = this.extractNextJSVersion(packageJson.dependencies);
    const typescript = this.hasTypeScript(packageJson);
    const appRouter = await this.hasAppRouter(projectPath);
    const tailwind = this.hasTailwindCSS(packageJson);
    const shadcn = await this.hasShadcnUI(projectPath);
    const eslint = this.hasESLint(packageJson);
    const prettier = this.hasPrettier(packageJson);
    return {
      name: packageJson.name || path.basename(projectPath),
      path: projectPath,
      nextjsVersion: nextVersion,
      typescript,
      appRouter,
      tailwind,
      shadcn,
      eslint,
      prettier,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      scripts: packageJson.scripts || {}
    };
  }
  async runCreateNextApp(projectPath, options) {
    return new Promise((resolve, reject) => {
      const args = [
        "create-next-app@latest",
        projectPath,
        "--typescript",
        "--tailwind",
        "--eslint",
        "--app",
        "--src-dir",
        "--import-alias",
        "@/*"
      ];
      if (!options.typescript) {
        args.splice(args.indexOf("--typescript"), 1);
      }
      if (!options.tailwind) {
        args.splice(args.indexOf("--tailwind"), 1);
      }
      if (!options.eslint) {
        args.splice(args.indexOf("--eslint"), 1);
      }
      if (!options.appRouter) {
        args.splice(args.indexOf("--app"), 1);
      }
      const process2 = (0, import_child_process.spawn)("npx", args, {
        stdio: "inherit",
        cwd: path.dirname(projectPath)
      });
      process2.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`create-next-app failed with code ${code}`));
        }
      });
      process2.on("error", (error) => {
        reject(error);
      });
    });
  }
  async setupShadcnUI(projectPath) {
    return new Promise((resolve, reject) => {
      const process2 = (0, import_child_process.spawn)("npx", ["shadcn@latest", "init", "-y"], {
        stdio: "inherit",
        cwd: projectPath
      });
      process2.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`shadcn init failed with code ${code}`));
        }
      });
      process2.on("error", (error) => {
        reject(error);
      });
    });
  }
  async createProjectStructure(projectPath, options) {
    const { typescript } = options;
    const dirs = [
      "src/components/ui",
      "src/components/custom",
      "src/lib",
      "src/types",
      "src/hooks",
      "src/utils"
    ];
    for (const dir of dirs) {
      await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }
    if (typescript) {
      await this.createUtilityFiles(projectPath);
    }
  }
  async createUtilityFiles(projectPath) {
    const utilsContent = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;
    await fs.writeFile(path.join(projectPath, "src/lib/utils.ts"), utilsContent);
    const typesContent = `// Global type definitions
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ProjectConfig {
  name: string
  path: string
  nextjsVersion: string
  typescript: boolean
  appRouter: boolean
  tailwind: boolean
  shadcn: boolean
}
`;
    await fs.writeFile(path.join(projectPath, "src/types/index.ts"), typesContent);
  }
  async generateProjectInfo(projectPath) {
    return this.detectProject(projectPath);
  }
  async isValidNextJSProject(projectPath) {
    const packageJsonPath = path.join(projectPath, "package.json");
    if (!await this.fileExists(packageJsonPath)) {
      return false;
    }
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    return !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);
  }
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  extractNextJSVersion(dependencies) {
    const nextVersion = dependencies?.next || dependencies?.["next.js"];
    if (!nextVersion) return "unknown";
    const match = nextVersion.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : nextVersion;
  }
  hasTypeScript(packageJson) {
    return !!(packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript);
  }
  async hasAppRouter(projectPath) {
    const appDir = path.join(projectPath, "src/app");
    const pagesDir = path.join(projectPath, "src/pages");
    const appExists = await this.fileExists(appDir);
    const pagesExists = await this.fileExists(pagesDir);
    return appExists && !pagesExists;
  }
  hasTailwindCSS(packageJson) {
    return !!(packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss);
  }
  async hasShadcnUI(projectPath) {
    const componentsJsonPath = path.join(projectPath, "components.json");
    const uiDir = path.join(projectPath, "src/components/ui");
    const hasConfig = await this.fileExists(componentsJsonPath);
    const hasUIDir = await this.fileExists(uiDir);
    return hasConfig && hasUIDir;
  }
  hasESLint(packageJson) {
    return !!(packageJson.dependencies?.eslint || packageJson.devDependencies?.eslint);
  }
  hasPrettier(packageJson) {
    return !!(packageJson.dependencies?.prettier || packageJson.devDependencies?.prettier);
  }
};

// src/main/services/FileSystemService.ts
var fs2 = __toESM(require("fs/promises"));
var path2 = __toESM(require("path"));
var chokidar = __toESM(require("chokidar"));
var import_events = require("events");
var FileSystemService = class extends import_events.EventEmitter {
  watchers = /* @__PURE__ */ new Map();
  async readFile(filePath) {
    try {
      const content = await fs2.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async writeFile(filePath, content) {
    try {
      const dir = path2.dirname(filePath);
      await fs2.mkdir(dir, { recursive: true });
      await fs2.writeFile(filePath, content, "utf-8");
      this.emit("file-changed", filePath, "write");
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async watchProject(projectPath) {
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
    watcher.on("change", (filePath) => {
      this.emit("file-changed", filePath, "change");
    });
    watcher.on("add", (filePath) => {
      this.emit("file-changed", filePath, "add");
    });
    watcher.on("unlink", (filePath) => {
      this.emit("file-changed", filePath, "unlink");
    });
    watcher.on("error", (error) => {
      this.emit("error", error);
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
  async stopAllWatchers() {
    const promises = Array.from(this.watchers.values()).map((watcher) => watcher.close());
    await Promise.all(promises);
    this.watchers.clear();
  }
  async getFileStats(filePath) {
    try {
      return await fs2.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to get file stats for ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async readDirectory(dirPath) {
    try {
      return await fs2.readdir(dirPath);
    } catch (error) {
      throw new Error(`Failed to read directory ${dirPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async createDirectory(dirPath) {
    try {
      await fs2.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async deleteFile(filePath) {
    try {
      await fs2.unlink(filePath);
      this.emit("file-changed", filePath, "unlink");
    } catch (error) {
      throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async deleteDirectory(dirPath) {
    try {
      await fs2.rmdir(dirPath, { recursive: true });
      this.emit("file-changed", dirPath, "unlink");
    } catch (error) {
      throw new Error(`Failed to delete directory ${dirPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async copyFile(srcPath, destPath) {
    try {
      await fs2.copyFile(srcPath, destPath);
      this.emit("file-changed", destPath, "add");
    } catch (error) {
      throw new Error(`Failed to copy file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async moveFile(srcPath, destPath) {
    try {
      await fs2.rename(srcPath, destPath);
      this.emit("file-changed", srcPath, "unlink");
      this.emit("file-changed", destPath, "add");
    } catch (error) {
      throw new Error(`Failed to move file from ${srcPath} to ${destPath}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async fileExists(filePath) {
    try {
      await fs2.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  async directoryExists(dirPath) {
    try {
      const stats = await fs2.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
  async getProjectFiles(projectPath) {
    const files = [];
    const scanDirectory = async (dirPath) => {
      const entries = await fs2.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path2.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!["node_modules", ".git", ".next", "dist", "build", "coverage"].includes(entry.name)) {
            await scanDirectory(fullPath);
          }
        } else {
          const ext = path2.extname(entry.name);
          if ([".ts", ".tsx", ".js", ".jsx", ".json", ".css", ".md"].includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };
    await scanDirectory(projectPath);
    return files;
  }
};

// src/main/services/DevServerService.ts
var import_child_process2 = require("child_process");
var import_events2 = require("events");
var DevServerService = class extends import_events2.EventEmitter {
  process = null;
  status = { isRunning: false };
  async start(projectPath) {
    if (this.status.isRunning) {
      return this.status;
    }
    return new Promise((resolve, reject) => {
      try {
        const port = this.findAvailablePort();
        this.process = (0, import_child_process2.spawn)("npm", ["run", "dev"], {
          cwd: projectPath,
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            PORT: port.toString()
          }
        });
        this.process.on("error", (error) => {
          this.status = { isRunning: false, error: error.message };
          this.emit("error", error);
          reject(error);
        });
        this.process.on("exit", (code) => {
          this.status = { isRunning: false };
          this.emit("stopped", code);
        });
        let serverStarted = false;
        const timeout = setTimeout(() => {
          if (!serverStarted) {
            this.stop();
            reject(new Error("Dev server startup timeout"));
          }
        }, 3e4);
        this.process.stdout?.on("data", (data) => {
          const output = data.toString();
          console.log("Dev server output:", output);
          if (output.includes("Ready in") || output.includes("Local:")) {
            if (!serverStarted) {
              serverStarted = true;
              clearTimeout(timeout);
              this.status = {
                isRunning: true,
                port,
                url: `http://localhost:${port}`,
                pid: this.process?.pid
              };
              this.emit("started", this.status);
              resolve(this.status);
            }
          }
        });
        this.process.stderr?.on("data", (data) => {
          const error = data.toString();
          console.error("Dev server error:", error);
          this.emit("error", new Error(error));
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  async stop() {
    if (this.process && this.status.isRunning) {
      return new Promise((resolve) => {
        this.process.on("exit", () => {
          this.status = { isRunning: false };
          this.process = null;
          this.emit("stopped");
          resolve();
        });
        this.process.kill("SIGTERM");
        setTimeout(() => {
          if (this.process && this.status.isRunning) {
            this.process.kill("SIGKILL");
          }
        }, 5e3);
      });
    }
  }
  getStatus() {
    return { ...this.status };
  }
  findAvailablePort() {
    let port = 3e3;
    const maxPort = 3100;
    while (port <= maxPort) {
      try {
        return port;
      } catch {
        port++;
      }
    }
    throw new Error("No available ports found");
  }
  async restart(projectPath) {
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    return this.start(projectPath);
  }
  isRunning() {
    return this.status.isRunning;
  }
  getUrl() {
    return this.status.url;
  }
  getPort() {
    return this.status.port;
  }
};

// src/main/main.ts
var mainWindow = null;
var isDev = process.env.NODE_ENV === "development";
var NestStudioApp = class {
  projectService;
  fileSystemService;
  devServerService;
  constructor() {
    this.projectService = new ProjectService();
    this.fileSystemService = new FileSystemService();
    this.devServerService = new DevServerService();
    this.setupApp();
    this.setupIPC();
  }
  setupApp() {
    import_electron.app.whenReady().then(() => {
      this.createWindow();
      this.setupAppEvents();
    });
    import_electron.app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        import_electron.app.quit();
      }
    });
    import_electron.app.on("activate", () => {
      if (import_electron.BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }
  createWindow() {
    mainWindow = new import_electron.BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: import_path.default.join(__dirname, "preload.js"),
        webSecurity: true
      },
      titleBarStyle: "default",
      show: false
      // Don't show until ready
    });
    if (isDev) {
      console.log("Loading development URL: http://localhost:3000");
      mainWindow.loadURL("http://localhost:3000");
      mainWindow.webContents.openDevTools();
    } else {
      const htmlPath = import_path.default.join(__dirname, "index.html");
      console.log("Loading production file:", htmlPath);
      mainWindow.loadFile(htmlPath);
    }
    mainWindow.webContents.on("did-finish-load", () => {
      console.log("Page finished loading");
    });
    mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
      console.error("Page failed to load:", errorCode, errorDescription);
    });
    mainWindow.once("ready-to-show", () => {
      console.log("Window ready to show");
      mainWindow?.show();
    });
    mainWindow.on("closed", () => {
      mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      import_electron.shell.openExternal(url);
      return { action: "deny" };
    });
  }
  setupAppEvents() {
    mainWindow?.webContents.on("will-navigate", (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== "http://localhost:3000" && !isDev) {
        event.preventDefault();
      }
    });
    mainWindow?.webContents.setWindowOpenHandler(({ url }) => {
      import_electron.shell.openExternal(url);
      return { action: "deny" };
    });
  }
  setupIPC() {
    import_electron.ipcMain.handle("project:create", async (_, options) => {
      try {
        const result = await this.projectService.createProject(options);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("project:import", async (_, projectPath) => {
      try {
        const result = await this.projectService.importProject(projectPath);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("project:detect", async (_, projectPath) => {
      try {
        const result = await this.projectService.detectProject(projectPath);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("fs:readFile", async (_, filePath) => {
      try {
        const content = await this.fileSystemService.readFile(filePath);
        return { success: true, data: content };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("fs:writeFile", async (_, filePath, content) => {
      try {
        await this.fileSystemService.writeFile(filePath, content);
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("fs:watch", async (_, projectPath) => {
      try {
        const watcher = await this.fileSystemService.watchProject(projectPath);
        return { success: true, data: watcher };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("devserver:start", async (_, projectPath) => {
      try {
        const result = await this.devServerService.start(projectPath);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("devserver:stop", async () => {
      try {
        await this.devServerService.stop();
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("devserver:getStatus", async () => {
      try {
        const status = await this.devServerService.getStatus();
        return { success: true, data: status };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
      }
    });
    import_electron.ipcMain.handle("dialog:openDirectory", async () => {
      const result = await import_electron.dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        title: "Select Project Directory"
      });
      if (!result.canceled && result.filePaths.length > 0) {
        return { success: true, data: result.filePaths[0] };
      }
      return { success: false, error: "No directory selected" };
    });
    import_electron.ipcMain.handle("app:getVersion", () => {
      return import_electron.app.getVersion();
    });
    import_electron.ipcMain.handle("app:getPath", (_, name) => {
      return import_electron.app.getPath(name);
    });
  }
};
new NestStudioApp();
