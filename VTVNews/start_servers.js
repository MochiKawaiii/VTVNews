const { spawn } = require('child_process');
const path = require('path');

// Start the main VTVNews application
console.log('Starting main VTVNews application...');
const mainApp = spawn('bun', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname)
});

// Start the Flask application
console.log('Starting Flask NewsAPI application...');
const flaskApp = spawn('python', ['flask_app.py'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname)
});

// Handle process exit
process.on('SIGINT', () => {
    console.log('Shutting down all servers...');
    mainApp.kill();
    flaskApp.kill();
    process.exit(0);
});

// Handle child process exit
mainApp.on('close', (code) => {
    console.log(`Main VTVNews application exited with code ${code}`);
    if (flaskApp) flaskApp.kill();
    process.exit(code);
});

flaskApp.on('close', (code) => {
    console.log(`Flask NewsAPI application exited with code ${code}`);
    if (mainApp) mainApp.kill();
    process.exit(code);
});

// Log startup message
console.log('===========================================');
console.log('VTVNews with NewsAPI servers are starting...');
console.log('Main application will be available at: http://localhost:3000');
console.log('Flask NewsAPI will be available at: http://localhost:8080/news');
console.log('===========================================');
