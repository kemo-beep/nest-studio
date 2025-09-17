// Requirements validation types based on requirements.md

export interface FunctionalRequirement {
    id: string
    title: string
    description: string
    priority: 'High' | 'Medium' | 'Low'
    complexity: 'High' | 'Medium' | 'Low'
    acceptanceCriteria: AcceptanceCriterion[]
    userStories: UserStory[]
    testCases: TestCase[]
}

export interface AcceptanceCriterion {
    id: string
    description: string
    testable: boolean
    automated: boolean
}

export interface UserStory {
    id: string
    description: string
    acceptanceCriteria: string[]
}

export interface TestCase {
    id: string
    name: string
    description: string
    steps: TestStep[]
    expectedResult: string
    automated: boolean
}

export interface TestStep {
    step: number
    action: string
    expected: string
}

// Specific requirement interfaces
export interface ProjectManagementRequirements {
    createNewProject: FunctionalRequirement
    importExistingProject: FunctionalRequirement
}

export interface VisualEditorRequirements {
    componentLibraryBrowser: FunctionalRequirement
    dragAndDropInterface: FunctionalRequirement
    canvasRendering: FunctionalRequirement
}

export interface PropertiesPanelRequirements {
    propsEditor: FunctionalRequirement
    tailwindClassesEditor: FunctionalRequirement
    layoutProperties: FunctionalRequirement
}

export interface CodeSyncRequirements {
    astBasedCodeGeneration: FunctionalRequirement
    bidirectionalSync: FunctionalRequirement
    fileWatching: FunctionalRequirement
}

export interface PreviewSystemRequirements {
    nextjsDevServerIntegration: FunctionalRequirement
    previewWindow: FunctionalRequirement
}

export interface ComponentManagementRequirements {
    componentCreation: FunctionalRequirement
    componentLibraryOrganization: FunctionalRequirement
}

export interface AdvancedFeaturesRequirements {
    themeSystem: FunctionalRequirement
    gitIntegration: FunctionalRequirement
    pluginSystem: FunctionalRequirement
}

// Non-functional requirements
export interface NonFunctionalRequirement {
    id: string
    category: 'Performance' | 'Reliability' | 'Usability' | 'Scalability'
    title: string
    description: string
    metrics: RequirementMetric[]
}

export interface RequirementMetric {
    name: string
    target: string
    measurement: string
    unit: string
}

// Technical requirements
export interface TechnicalRequirement {
    id: string
    category: 'Platform' | 'Dependencies' | 'FileSystem'
    title: string
    description: string
    specifications: TechnicalSpecification[]
}

export interface TechnicalSpecification {
    name: string
    value: string
    required: boolean
}

// Performance requirements
export interface PerformanceRequirement {
    id: string
    category: 'Startup' | 'Runtime' | 'Build'
    title: string
    description: string
    metrics: PerformanceMetric[]
}

export interface PerformanceMetric {
    name: string
    target: number
    unit: string
    measurement: string
}

// Security requirements
export interface SecurityRequirement {
    id: string
    category: 'FileSystem' | 'Code' | 'Network'
    title: string
    description: string
    controls: SecurityControl[]
}

export interface SecurityControl {
    name: string
    description: string
    implementation: string
}

// Accessibility requirements
export interface AccessibilityRequirement {
    id: string
    category: 'Keyboard' | 'Visual' | 'Motor'
    title: string
    description: string
    wcagLevel: 'A' | 'AA' | 'AAA'
    criteria: AccessibilityCriterion[]
}

export interface AccessibilityCriterion {
    name: string
    description: string
    testable: boolean
}

// Requirements validation
export interface RequirementsValidation {
    requirementId: string
    status: 'pass' | 'fail' | 'warning' | 'not-tested'
    message: string
    testResults: TestResult[]
    lastValidated: Date
}

export interface TestResult {
    testName: string
    status: 'pass' | 'fail' | 'skip'
    duration: number
    error?: string
    timestamp: Date
}

// Requirements compliance
export interface RequirementsCompliance {
    totalRequirements: number
    passedRequirements: number
    failedRequirements: number
    warningRequirements: number
    notTestedRequirements: number
    compliancePercentage: number
    lastUpdated: Date
}

// Export all requirement types
export type AllRequirements =
    | FunctionalRequirement
    | NonFunctionalRequirement
    | TechnicalRequirement
    | PerformanceRequirement
    | SecurityRequirement
    | AccessibilityRequirement
