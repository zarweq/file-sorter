const { contextBridge,  ipcRenderer } = require('electron')



contextBridge.exposeInMainWorld('api', {
    chooseFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    runSort: (folderPath) => ipcRenderer.invoke('sorter:run', folderPath),
    undoSort: () => ipcRenderer.invoke('sorter:undo'),
    getRules: () => ipcRenderer.invoke('rules:get'),
    saveRules: (rules) => ipcRenderer.invoke('rules:save', rules)

})


