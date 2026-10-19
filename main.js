const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { sortFolder, undoLastSort } = require('./sorter.js')

let rulesPath
let historyPath

function initDataFiles() {
    const userDataDir = app.getPath('userData')
    rulesPath = path.join(userDataDir, 'rules.json')
    historyPath = path.join(userDataDir, 'history.json')

    if (!fs.existsSync(rulesPath)) {
        const defaultRulesPath = path.join(__dirname, 'rules.json')
        fs.copyFileSync(defaultRulesPath, rulesPath)
    }
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 824,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('index.html')
}
ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (result.canceled) {
        return null
    }
    return result.filePaths[0]
})
ipcMain.handle('sorter:run', async (event, folderPath) => {
    try {
        const sort = sortFolder(folderPath, rulesPath, historyPath)
        return sort
    } catch (error) {
        return [`Error: ${error.message}`]
    }
})
ipcMain.handle('sorter:undo', async () => {
    try {
        const log = undoLastSort(historyPath)
        return log
    } catch (error) {
        return [`Error: ${error.message}`]
    }
})
ipcMain.handle('rules:get', async () => {
    try {
        const data = fs.readFileSync(rulesPath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return {}
    }
})
ipcMain.handle('rules:save', async (event, rules) => {
    try {
        fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 4))
        return true
    } catch (error) {
        return false
    }
})

app.whenReady().then(() => {
    initDataFiles()
    createWindow()
})
