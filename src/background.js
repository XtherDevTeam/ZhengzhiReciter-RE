'use strict'

import {app, protocol, BrowserWindow, ipcMain} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import * as fs from "fs";
import * as path from "path";
import backend from "./backend";
import * as electron from "electron";
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

if (!fs.existsSync(path.join(process.cwd(), 'data.json'))) {
    fs.writeFile(path.join(process.cwd(), "data.json"), JSON.stringify({
        goal_per_day: 0,
        review_per_day: 0,
        today: {
            task_is_finished: false,
            recited: 0,
            reviewed: 0, day: "0000-00-00"
        },
        held_days: 0,
        all_recited: 0,
        knowledge_count: 0,
        use_book: ""
    }), "utf-8", () => {
    });
}

ipcMain.on('command.read_data', function (event, args) {
    fs.readFile(path.join(process.cwd(), "data.json"), "utf-8", (err, data) => {
        if (err) {
            console.log('command.read_data received an error.')
            event.sender.send('command.read_data.callback', {'status': false, data: {}})
        } else {
            try {
                let result = JSON.parse(data);
                if (result.today.day !== backend.methods.get_today_date()) {
                    result.today.day = backend.methods.get_today_date();
                    result.today.task_is_finished = false;
                    result.today.recited = 0;
                    result.today.reviewed = 0;
                }
                event.sender.send('command.read_data.callback', {'status': true, data: result})
            } catch (E) {
                event.sender.send('command.read_data.callback', {'status': false, data: E.toString()})
            }
        }
    })
})

ipcMain.on('command.sync_data', function (event, args) {
    try {
        fs.readFile(path.join(process.cwd(), "data.json"), "utf-8", (err, data) => {
            if (err) {
                event.sender.send('command.sync_data.callback', {'status': false, data: {}})
            } else {
                let parsed_data = JSON.parse(data);
                /*  提纲重置，重新设置存档 */
                if (args.use_book !== parsed_data.use_book) {
                    args.today = {task_is_finished: false, recited: 0, reviewed: 0, day: "0000-00-00"};
                    args.all_recited = 0;
                }
                backend.methods.load_library(args.use_book, (a, b) => {
                    args.knowledge_count = b.length;
                    fs.writeFile(path.join(process.cwd(), "data.json"), JSON.stringify(args), "utf-8", () => {
                        event.sender.send('command.sync_data.callback', {'status': true, data: {}})
                    })
                });
            }
        });
    } catch (E) {
        event.sender.send('command.sync_data.callback', {'status': false, data: {}})
    }
})

ipcMain.on('command.get_library', function (event, args) {
    backend.methods.load_library(args, (is_success, result) => {
        if (is_success) {
            event.sender.send('command.get_library.callback', {'status': true, data: result});
        } else {
            event.sender.send('command.get_library.callback', {'status': false, data: {result}})
        }
    })
})


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1024,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    const Menu = electron.Menu;
    Menu.setApplicationMenu(null);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            // await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}
