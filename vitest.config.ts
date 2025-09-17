import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/main': path.resolve(__dirname, './src/main'),
            '@/renderer': path.resolve(__dirname, './src/renderer'),
            '@/shared': path.resolve(__dirname, './src/shared'),
        },
    },
})
