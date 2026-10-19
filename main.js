const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const { sortFolder, undoLastSort } = require('./sorter.js')
const rulesPath = path.join(__dirname, 'rules.json')
const fs = require('fs')
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
ipcMain.handle('dialog:openFolder', async() => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (result.canceled) {
        return null
    }
    return result.filePaths[0]
})
ipcMain.handle('sorter:run', async(event,folderPath) => {
    try{
        const sort = sortFolder(folderPath)
        return sort
    } catch (error) {
        return [`Error: ${error.message}`]
    }  
})
ipcMain.handle('sorter:undo', async() => {
    try{
        const log = undoLastSort()
        return log
    } catch(error) {
        return [`Error: ${error.message}`]
    }
})
ipcMain.handle('rules:get', async () => {
    try {
        const data = fs.readFileSync(rulesPath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        return{}
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
    createWindow()
})