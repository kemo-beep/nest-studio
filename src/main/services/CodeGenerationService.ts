import * as fs from 'fs/promises'
import * as path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'
import * as recast from 'recast'

export interface ComponentNode {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children?: ComponentNode[]
    position: {
        x: number
        y: number
        width: number
        height: number
    }
}

export interface CodeGenerationResult {
    success: boolean
    code?: string
    error?: string
    ast?: any
}

export class CodeGenerationService {
    private projectPath: string

    constructor(projectPath: string) {
        this.projectPath = projectPath
    }

    /**
     * Parse a JSX/TSX file and return its AST
     */
    async parseFile(filePath: string): Promise<CodeGenerationResult> {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            const ast = recast.parse(content, {
                parser: {
                    parse: (source: string) => parse(source, {
                        sourceType: 'module',
                        plugins: ['jsx', 'typescript'],
                        tokens: true,
                    }),
                },
            })

            let idCounter = 0
            traverse(ast, {
                JSXOpeningElement(path) {
                    const id = `${path.scope.uid}-${idCounter++}`
                    const hasId = path.node.attributes.some(
                        (attr) => t.isJSXAttribute(attr) && attr.name.name === 'data-element-id'
                    )

                    if (!hasId) {
                        path.node.attributes.push(
                            t.jsxAttribute(t.jsxIdentifier('data-element-id'), t.stringLiteral(id))
                        )
                    }
                },
            })

            const generatedCode = recast.print(ast).code

            return {
                success: true,
                code: generatedCode,
                ast
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown parsing error'
            }
        }
    }

    /**
     * Generate JSX code from component nodes
     */
    generateJSXFromNodes(nodes: ComponentNode[]): string {
        const jsxElements = nodes.map(node => this.generateJSXElement(node))

        // Wrap in a fragment if multiple elements
        if (jsxElements.length === 1) {
            return jsxElements[0]
        }

        return `<>\n${jsxElements.map(el => `  ${el}`).join('\n')}\n</>`
    }

    /**
     * Generate a single JSX element from a component node
     */
    private generateJSXElement(node: ComponentNode): string {
        const { type, props, children } = node

        // Generate props string
        const propsString = Object.entries(props)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `${key}="${value}"`
                } else if (typeof value === 'boolean') {
                    return value ? key : `{false}`
                } else {
                    return `${key}={${JSON.stringify(value)}}`
                }
            })
            .join(' ')

        // Generate children
        let childrenString = ''
        if (children && children.length > 0) {
            const childElements = children.map(child => this.generateJSXElement(child))
            childrenString = `\n    ${childElements.join('\n    ')}\n  `
        }

        // Generate the JSX element
        const propsPart = propsString ? ` ${propsString}` : ''
        const isSelfClosing = !children || children.length === 0

        if (isSelfClosing) {
            return `<${type}${propsPart} />`
        } else {
            return `<${type}${propsPart}>${childrenString}</${type}>`
        }
    }

    /**
     * Insert a component into an existing JSX file
     */
    async insertComponent(
        filePath: string,
        component: ComponentNode,
        targetPath?: string
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let targetNode: any = null

            // Find the target node to insert into
            if (targetPath) {
                targetNode = this.findNodeByPath(ast, targetPath)
            } else {
                // Find the default export or main component
                targetNode = this.findMainComponent(ast)
            }

            if (!targetNode) {
                return {
                    success: false,
                    error: 'Could not find target node for insertion'
                }
            }

            // Generate the new JSX element
            const newElement = this.createJSXElementFromNode(component)

            // Insert the element
            if (t.isJSXElement(targetNode) || t.isJSXFragment(targetNode)) {
                const children = targetNode.children || []
                children.push(newElement)
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during insertion'
            }
        }
    }

    /**
     * Update a component's props in an existing JSX file
     */
    async updateComponentProps(
        filePath: string,
        componentId: string,
        newProps: Record<string, any>
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let updated = false

            traverse(ast, {
                JSXElement: (path) => {
                    // Check if this is the component we want to update
                    if (this.isTargetComponent(path, componentId)) {
                        this.updateJSXElementProps(path, newProps)
                        updated = true
                    }
                }
            })

            if (!updated) {
                return {
                    success: false,
                    error: `Component with id ${componentId} not found`
                }
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during update'
            }
        }
    }

    /**
     * Remove a component from an existing JSX file
     */
    async removeComponent(
        filePath: string,
        componentId: string
    ): Promise<CodeGenerationResult> {
        try {
            const parseResult = await this.parseFile(filePath)
            if (!parseResult.success || !parseResult.ast) {
                return parseResult
            }

            const ast = parseResult.ast
            let removed = false

            traverse(ast, {
                JSXElement: (path) => {
                    if (this.isTargetComponent(path, componentId)) {
                        path.remove()
                        removed = true
                    }
                }
            })

            if (!removed) {
                return {
                    success: false,
                    error: `Component with id ${componentId} not found`
                }
            }

            // Generate the updated code
            const result = generate(ast, {
                retainLines: true,
                compact: false,
                comments: true
            })

            return {
                success: true,
                code: result.code
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during removal'
            }
        }
    }

    /**
     * Create a new React component file
     */
    async createComponentFile(
        componentName: string,
        content: string,
        directory: string = 'src/components'
    ): Promise<CodeGenerationResult> {
        try {
            const filePath = path.join(this.projectPath, directory, `${componentName}.tsx`)

            // Ensure directory exists
            await fs.mkdir(path.dirname(filePath), { recursive: true })

            // Write the file
            await fs.writeFile(filePath, content, 'utf-8')

            return {
                success: true,
                code: content
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error creating component file'
            }
        }
    }

    /**
     * Generate a complete React component file from component nodes
     */
    generateComponentFile(
        componentName: string,
        nodes: ComponentNode[],
        imports: string[] = []
    ): string {
        const jsxContent = this.generateJSXFromNodes(nodes)

        const importsSection = imports.length > 0
            ? imports.map(imp => `import ${imp}`).join('\n') + '\n\n'
            : ''

        return `${importsSection}export default function ${componentName}() {
  return (
    ${jsxContent}
  )
}
`
    }

    // Helper methods
    private findNodeByPath(_ast: any, _path: string): any {
        // Implementation to find a node by a specific path
        // This would depend on the specific path format
        return null
    }

    private findMainComponent(ast: any): any {
        let mainComponent: any = null

        traverse(ast, {
            ExportDefaultDeclaration(path) {
                if (t.isFunctionDeclaration(path.node.declaration) ||
                    t.isArrowFunctionExpression(path.node.declaration)) {
                    mainComponent = path.node.declaration
                }
            }
        })

        return mainComponent
    }

    private createJSXElementFromNode(node: ComponentNode): any {
        const element = t.jsxElement(
            t.jsxOpeningElement(
                t.jsxIdentifier(node.type),
                this.createJSXAttributes(node.props),
                true
            ),
            t.jsxClosingElement(t.jsxIdentifier(node.type)),
            node.children ? node.children.map(child => this.createJSXElementFromNode(child)) : []
        )

        return element
    }

    private createJSXAttributes(props: Record<string, any>): any[] {
        return Object.entries(props)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.stringLiteral(value)
                    )
                } else if (typeof value === 'boolean') {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.jsxExpressionContainer(t.booleanLiteral(value))
                    )
                } else {
                    return t.jsxAttribute(
                        t.jsxIdentifier(key),
                        t.jsxExpressionContainer(t.valueToNode(value))
                    )
                }
            })
    }

    private isTargetComponent(_path: any, _componentId: string): boolean {
        // Check if this JSX element has the target component ID
        // This would depend on how we store component IDs in the JSX
        return false
    }

    private updateJSXElementProps(path: any, newProps: Record<string, any>): void {
        // Update the props of a JSX element
        const openingElement = path.node.openingElement
        const existingAttributes = openingElement.attributes || []

        // Remove existing attributes that are being updated
        const filteredAttributes = existingAttributes.filter((attr: any) => {
            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                return !(attr.name.name in newProps)
            }
            return true
        })

        // Add new attributes
        const newAttributes = this.createJSXAttributes(newProps)
        openingElement.attributes = [...filteredAttributes, ...newAttributes]
    }

    async updateElement(filePath: string, elementId: string, updates: Partial<{ className: string, content: string, props: Record<string, any> }>): Promise<CodeGenerationResult> {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            const ast = recast.parse(content, {
                parser: {
                    parse: (source: string) => parse(source, {
                        sourceType: 'module',
                        plugins: ['jsx', 'typescript'],
                        tokens: true,
                    }),
                },
            })

            const elementNode = this.findElementById(ast, elementId)

            if (!elementNode) {
                return { success: false, error: 'Element not found with id ' + elementId }
            }

            if (updates.className !== undefined) {
                this.updateJSXAttribute(elementNode, 'className', t.stringLiteral(updates.className))
            }

            if (updates.content !== undefined) {
                elementNode.children = [t.jsxText(updates.content)]
            }

            if (updates.props) {
                for (const [key, value] of Object.entries(updates.props)) {
                    this.updateJSXAttribute(elementNode, key, t.stringLiteral(value as string))
                }
            }

            const output = recast.print(ast, { tabWidth: 2, quote: 'single' })
            await fs.writeFile(filePath, output.code, 'utf-8')

            return { success: true, code: output.code }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error during element update' }
        }
    }

    private findElementById(ast: any, elementId: string): any | null {
        let foundNode: any = null

        traverse(ast, {
            JSXElement(path) {
                const idAttribute = path.node.openingElement.attributes.find(
                    (attr) =>
                        t.isJSXAttribute(attr) &&
                        attr.name.name === 'data-element-id' &&
                        t.isStringLiteral(attr.value) &&
                        attr.value.value === elementId
                )
                if (idAttribute) {
                    foundNode = path.node
                    path.stop()
                }
            },
        })

        return foundNode
    }

    private updateJSXAttribute(element: any, attributeName: string, value: t.Expression) {
        const openingElement = element.openingElement;
        const existingAttr = openingElement.attributes.find(
            (attr: any) => t.isJSXAttribute(attr) && attr.name.name === attributeName
        );

        if (existingAttr) {
            existingAttr.value = t.isStringLiteral(value) ? value : t.jsxExpressionContainer(value);
        } else {
            openingElement.attributes.push(
                t.jsxAttribute(t.jsxIdentifier(attributeName), t.isStringLiteral(value) ? value : t.jsxExpressionContainer(value))
            );
        }
    }
}
