const { spawn } = require('child_process');
const path = require('path');

// Test project creation with a simple Next.js project
const testProjectCreation = () => {
    console.log('=== TESTING PROJECT CREATION ===');
    
    const testDir = path.join(__dirname, 'test-projects');
    const projectName = 'test-project-' + Date.now();
    const projectPath = path.join(testDir, projectName);
    
    console.log('Test project path:', projectPath);
    
    // Create test directory
    const fs = require('fs');
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Test create-next-app command
    const args = [
        'create-next-app@latest',
        projectPath,
        '--typescript',
        '--tailwind',
        '--eslint',
        '--app',
        '--src-dir',
        '--import-alias', '@/*'
    ];
    
    console.log('Running command:', 'npx', args.join(' '));
    
    const process = spawn('npx', args, {
        stdio: 'inherit',
        cwd: testDir
    });
    
    process.on('close', (code) => {
        console.log('Process closed with code:', code);
        if (code === 0) {
            console.log('✅ Project creation test successful!');
            // Clean up
            fs.rmSync(projectPath, { recursive: true, force: true });
        } else {
            console.log('❌ Project creation test failed with code:', code);
        }
    });
    
    process.on('error', (error) => {
        console.error('❌ Process error:', error);
    });
};

testProjectCreation();
