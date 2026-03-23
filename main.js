import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let pythonProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // Hide the default menu bar for a cleaner app look
        autoHideMenuBar: true
    });

    // We run `npm run build` before starting electron, so load the built file directly
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

function startPythonBackend() {
    // Spawn the python process running server.py
    // In production, we assume python is in the system PATH
    pythonProcess = spawn('python', ['server.py'], {
        cwd: __dirname,
        detached: false
    });

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python Backend: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Backend Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startPythonBackend();
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    // Always kill the python process when the app closes
    if (pythonProcess) {
        pythonProcess.kill();
    }
    if (process.platform !== 'darwin') app.quit();
});
