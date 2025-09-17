// Project Management Types
export interface ProjectOptions {
    name: string
    directory: string
    nextjsVersion?: string
    typescript?: boolean
    appRouter?: boolean
    tailwind?: boolean
    shadcn?: boolean
    eslint?: boolean
    prettier?: boolean
}

export interface ProjectInfo {
    name: string
    path: string
    nextjsVersion: string
    typescript: boolean
    appRouter: boolean
    tailwind: boolean
    shadcn: boolean
    eslint: boolean
    prettier: boolean
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    scripts: Record<string, string>
}

// Component Types
export interface ComponentInfo {
    id: string
    name: string
    type: 'shadcn' | 'custom'
    category: string
    props: ComponentProp[]
    variants?: ComponentVariant[]
    description?: string
    documentation?: string
}

export interface ComponentProp {
    name: string
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum'
    required: boolean
    defaultValue?: any
    options?: string[]
    description?: string
}

export interface ComponentVariant {
    name: string
    props: Record<string, any>
    description?: string
}

// Visual Editor Types
export interface CanvasElement {
    id: string
    type: 'component' | 'container' | 'text'
    componentId?: string
    props: Record<string, any>
    styles: Record<string, any>
    position: { x: number; y: number }
    size: { width: number; height: number }
    children: CanvasElement[]
    parentId?: string
}

export interface CanvasState {
    elements: CanvasElement[]
    selectedElementId?: string
    hoveredElementId?: string
    viewport: ViewportState
    history: CanvasHistory[]
    historyIndex: number
}

export interface ViewportState {
    width: number
    height: number
    zoom: number
    panX: number
    panY: number
    device: 'mobile' | 'tablet' | 'desktop'
}

export interface CanvasHistory {
    elements: CanvasElement[]
    timestamp: number
    action: string
}

// Properties Panel Types
export interface PropertiesPanelState {
    selectedElementId?: string
    activeTab: 'props' | 'styles' | 'layout' | 'responsive'
    props: Record<string, any>
    styles: Record<string, any>
    layout: LayoutProperties
    responsive: ResponsiveProperties
}

export interface LayoutProperties {
    display: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    gap?: number
    gridTemplateColumns?: string
    gridTemplateRows?: string
    gridGap?: number
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: number
    right?: number
    bottom?: number
    left?: number
    zIndex?: number
}

export interface ResponsiveProperties {
    mobile: BreakpointProperties
    tablet: BreakpointProperties
    desktop: BreakpointProperties
}

export interface BreakpointProperties {
    width?: number
    height?: number
    margin?: { top: number; right: number; bottom: number; left: number }
    padding?: { top: number; right: number; bottom: number; left: number }
    display?: string
    flexDirection?: string
    justifyContent?: string
    alignItems?: string
}

// Code Sync Types
export interface CodeSyncState {
    isSyncing: boolean
    lastSyncTime?: number
    pendingChanges: PendingChange[]
    conflicts: Conflict[]
}

export interface PendingChange {
    id: string
    filePath: string
    type: 'create' | 'update' | 'delete'
    content?: string
    timestamp: number
}

export interface Conflict {
    id: string
    filePath: string
    localContent: string
    remoteContent: string
    timestamp: number
}

// File System Types
export interface FileInfo {
    path: string
    name: string
    type: 'file' | 'directory'
    size?: number
    modified: Date
    content?: string
}

export interface ProjectStructure {
    name: string
    type: 'directory'
    children: (ProjectStructure | FileInfo)[]
}

// Theme Types
export interface Theme {
    name: string
    colors: ColorPalette
    typography: TypographyScale
    spacing: SpacingScale
    borderRadius: BorderRadiusScale
    shadows: ShadowScale
}

export interface ColorPalette {
    primary: ColorScale
    secondary: ColorScale
    accent: ColorScale
    neutral: ColorScale
    success: ColorScale
    warning: ColorScale
    error: ColorScale
    background: string
    foreground: string
}

export interface ColorScale {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
}

export interface TypographyScale {
    fontFamily: {
        sans: string[]
        serif: string[]
        mono: string[]
    }
    fontSize: {
        xs: string
        sm: string
        base: string
        lg: string
        xl: string
        '2xl': string
        '3xl': string
        '4xl': string
        '5xl': string
        '6xl': string
    }
    fontWeight: {
        thin: number
        light: number
        normal: number
        medium: number
        semibold: number
        bold: number
        extrabold: number
        black: number
    }
    lineHeight: {
        none: number
        tight: number
        snug: number
        normal: number
        relaxed: number
        loose: number
    }
}

export interface SpacingScale {
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    8: string
    10: string
    12: string
    16: string
    20: string
    24: string
    32: string
    40: string
    48: string
    56: string
    64: string
}

export interface BorderRadiusScale {
    none: string
    sm: string
    base: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
}

export interface ShadowScale {
    sm: string
    base: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
    none: string
}

// Application State Types
export interface AppState {
    currentProject?: ProjectInfo
    projects: ProjectInfo[]
    ui: UIState
    canvas: CanvasState
    properties: PropertiesPanelState
    codeSync: CodeSyncState
    devServer: DevServerState
}

export interface UIState {
    sidebar: {
        isOpen: boolean
        activeTab: 'components' | 'files' | 'layers'
        width: number
    }
    propertiesPanel: {
        isOpen: boolean
        width: number
    }
    preview: {
        isOpen: boolean
        url?: string
        device: 'mobile' | 'tablet' | 'desktop'
    }
    theme: 'light' | 'dark'
    zoom: number
}

export interface DevServerState {
    isRunning: boolean
    port?: number
    url?: string
    status: 'idle' | 'starting' | 'running' | 'error'
    error?: string
}

// Event Types
export interface AppEvent {
    type: string
    payload: any
    timestamp: number
}

export interface FileChangeEvent extends AppEvent {
    type: 'file-changed'
    payload: {
        filePath: string
        changeType: 'add' | 'change' | 'unlink'
        content?: string
    }
}

export interface ProjectUpdateEvent extends AppEvent {
    type: 'project-updated'
    payload: {
        project: ProjectInfo
        changes: string[]
    }
}

export interface DevServerEvent extends AppEvent {
    type: 'devserver-status'
    payload: DevServerState
}

// API Response Types
export interface APIResponse<T = any> {
    success: boolean
    data?: T
    error?: string
}

// Validation Types
export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
}

export interface ValidationError {
    field: string
    message: string
    code: string
}

export interface ValidationWarning {
    field: string
    message: string
    code: string
}

// Requirements Validation Types
export interface RequirementValidation {
    requirementId: string
    status: 'pass' | 'fail' | 'warning' | 'not-tested'
    message: string
    testResults?: TestResult[]
}

export interface TestResult {
    testName: string
    status: 'pass' | 'fail' | 'skip'
    duration: number
    error?: string
}

// Export all types
export * from './requirements'

// Export testing types with specific names to avoid conflicts
export type {
    TestSuite,
    TestCase as TestCaseType,
    TestStep as TestStepType,
    PlaywrightTest,
    PlaywrightTestSuite,
    PerformanceTest,
    PerformanceTestResult,
    AccessibilityTest,
    AccessibilityTestResult,
    AccessibilityViolation,
    SecurityTest,
    SecurityTestResult,
    SecurityVulnerability,
    TestExecution,
    TestExecutionResult,
    TestEnvironment,
    RequirementsTestSuite,
    RequirementsCompliance as RequirementsComplianceType,
    TestReport,
    TestSummary,
    TestDetail,
    TestConfig
} from './testing'
