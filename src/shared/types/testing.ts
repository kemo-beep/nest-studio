// Testing types for requirements validation

export interface TestSuite {
    id: string
    name: string
    description: string
    type: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility'
    requirements: string[]
    testCases: TestCase[]
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
    lastRun?: Date
    duration?: number
}

export interface TestCase {
    id: string
    name: string
    description: string
    type: 'unit' | 'integration' | 'e2e' | 'performance' | 'accessibility'
    requirementId: string
    steps: TestStep[]
    expectedResult: string
    actualResult?: string
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
    duration?: number
    error?: string
    lastRun?: Date
}

export interface TestStep {
    step: number
    action: string
    expected: string
    actual?: string
    status: 'pending' | 'passed' | 'failed' | 'skipped'
    screenshot?: string
    error?: string
}

// Playwright specific types
export interface PlaywrightTest {
    name: string
    test: (page: any, expect: any) => Promise<void>
    requirementId: string
    category: 'functional' | 'performance' | 'accessibility' | 'security'
}

export interface PlaywrightTestSuite {
    name: string
    tests: PlaywrightTest[]
    setup?: () => Promise<void>
    teardown?: () => Promise<void>
}

// Performance testing types
export interface PerformanceTest {
    name: string
    metric: string
    target: number
    unit: string
    measurement: () => Promise<number>
    requirementId: string
}

export interface PerformanceTestResult {
    testName: string
    metric: string
    target: number
    actual: number
    unit: string
    passed: boolean
    duration: number
    timestamp: Date
}

// Accessibility testing types
export interface AccessibilityTest {
    name: string
    wcagCriterion: string
    level: 'A' | 'AA' | 'AAA'
    test: (page: any) => Promise<AccessibilityTestResult>
    requirementId: string
}

export interface AccessibilityTestResult {
    testName: string
    wcagCriterion: string
    level: 'A' | 'AA' | 'AAA'
    passed: boolean
    violations: AccessibilityViolation[]
    duration: number
    timestamp: Date
}

export interface AccessibilityViolation {
    rule: string
    description: string
    severity: 'error' | 'warning'
    elements: string[]
    help: string
}

// Security testing types
export interface SecurityTest {
    name: string
    category: 'file-system' | 'code' | 'network'
    test: () => Promise<SecurityTestResult>
    requirementId: string
}

export interface SecurityTestResult {
    testName: string
    category: string
    passed: boolean
    vulnerabilities: SecurityVulnerability[]
    duration: number
    timestamp: Date
}

export interface SecurityVulnerability {
    type: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    description: string
    location: string
    recommendation: string
}

// Test execution types
export interface TestExecution {
    id: string
    suiteId: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    startTime: Date
    endTime?: Date
    duration?: number
    results: TestExecutionResult[]
    environment: TestEnvironment
}

export interface TestExecutionResult {
    testCaseId: string
    status: 'passed' | 'failed' | 'skipped'
    duration: number
    error?: string
    screenshots?: string[]
    logs?: string[]
}

export interface TestEnvironment {
    platform: string
    browser?: string
    version: string
    nodeVersion: string
    electronVersion: string
}

// Requirements validation testing
export interface RequirementsTestSuite {
    requirementId: string
    testSuites: TestSuite[]
    compliance: RequirementsCompliance
    lastValidated: Date
}

export interface RequirementsCompliance {
    totalRequirements: number
    passedRequirements: number
    failedRequirements: number
    warningRequirements: number
    notTestedRequirements: number
    compliancePercentage: number
    lastUpdated: Date
}

// Test reporting types
export interface TestReport {
    id: string
    name: string
    type: 'requirements' | 'performance' | 'accessibility' | 'security'
    status: 'success' | 'failure' | 'warning'
    summary: TestSummary
    details: TestDetail[]
    generatedAt: Date
    duration: number
}

export interface TestSummary {
    totalTests: number
    passed: number
    failed: number
    skipped: number
    warnings: number
    coverage: number
}

export interface TestDetail {
    testName: string
    requirementId: string
    status: 'passed' | 'failed' | 'skipped' | 'warning'
    duration: number
    error?: string
    screenshots?: string[]
}

// Test configuration
export interface TestConfig {
    baseUrl: string
    timeout: number
    retries: number
    parallel: boolean
    workers: number
    reporter: string[]
    outputDir: string
    screenshots: boolean
    videos: boolean
    traces: boolean
}

// Export all testing types
export type AllTestTypes =
    | TestSuite
    | TestCase
    | TestStep
    | PlaywrightTest
    | PerformanceTest
    | AccessibilityTest
    | SecurityTest
    | TestExecution
    | TestReport
