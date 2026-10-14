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
    const sort = sortFolder(folderPath)
    return sort 
})
ipcMain.handle('sorter:undo', async() => {
    const log = undoLastSort()
    return log
})
ipcMain.handle('rules:get', async () => {
    const data = fs.readFileSync(rulesPath, 'utf-8')
    return JSON.parse(data)
})
ipcMain.handle('rules:save', async (event, rules) => {
    fs.writeFileSync(rulesPath, JSON.stringify(rules,null, 4))
    return true
})
app.whenReady().then(() => {
    createWindow()
})