#!/bin/bash

# Nest Studio - Run Script
# This script kills any running Electron processes, builds the project, and runs Electron

set -e  # Exit on any error

echo "🚀 Starting Nest Studio..."

# Function to kill Electron processes
kill_electron() {
    echo "🔍 Checking for running Electron processes..."
    
    # Kill Electron processes on macOS/Linux
    if command -v pkill >/dev/null 2>&1; then
        if pgrep -f "electron" >/dev/null; then
            echo "⚠️  Found running Electron processes, killing them..."
            pkill -f "electron" || true
            sleep 2
        else
            echo "✅ No running Electron processes found"
        fi
    else
        # Fallback for systems without pkill
        if ps aux | grep -i electron | grep -v grep >/dev/null; then
            echo "⚠️  Found running Electron processes, killing them..."
            ps aux | grep -i electron | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            echo "✅ No running Electron processes found"
        fi
    fi
}

# Function to build the project
build_project() {
    echo "🔨 Building the project..."
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Run the build command
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build completed successfully"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to run Electron
run_electron() {
    echo "⚡ Starting Electron..."
    npm run electron
}

# Main execution
main() {
    echo "=========================================="
    echo "🎯 Nest Studio - Visual Builder for Next.js"
    echo "=========================================="
    
    # Step 1: Kill any running Electron processes
    kill_electron
    
    # Step 2: Build the project
    build_project
    
    # Step 3: Run Electron
    run_electron
}

# Run the main function
main "$@"
