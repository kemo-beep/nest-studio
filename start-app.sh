#!/bin/bash

# Ensure main.js exists
if [ ! -f "dist/main.js" ]; then
    echo "Building main process..."
    npm run build:main
fi

# Start the app
echo "Starting Nest Studio..."
npm run electron
