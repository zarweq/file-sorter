const path = require('path')
const fs = require('fs')
let lastMoves = []
const rulesPath = path.join(__dirname, 'rules.json')
function getExtension(filename) {
    return path.extname(filename).slice(1)
}
function loadRules() {
    const data = fs.readFileSync(rulesPath, 'utf-8')
    return JSON.parse(data)
}


function getCategory(extension) {
    const categories = loadRules()
    return categories[extension] || 'Other'
}


function ensureFolder(folderPath) {
    fs.mkdirSync(folderPath, {recursive: true })
}


function getAvailablePath(destFolder, filename) {
    const parsed = path.parse(filename)
    let newPath = path.join(destFolder, filename)
    let counter = 1
    while (fs.existsSync(newPath)) {
        const newFilename = `${parsed.name}_${counter}${parsed.ext}`
        newPath = path.join(destFolder, newFilename)
        counter++
    }
    return newPath
}


function moveFile(srcPath, destFolder) {
    const filename = path.basename(srcPath)
    const newPath = getAvailablePath(destFolder, filename)
    fs.renameSync(srcPath, newPath)
    return { from: srcPath, to: newPath, message: `Moved ${filename} -> ${destFolder}` }
}



function sortFolder(folderPath) {
    const log = []
    lastMoves = []
    const files = fs.readdirSync(folderPath)
    for (const filename of files) {
        const fullPath = path.join(folderPath, filename)
        if (!fs.statSync(fullPath).isFile()) {
            continue
        }
        const extension = getExtension(filename)
        const category = getCategory(extension)
        const destFolder = path.join(folderPath, category)
        ensureFolder(destFolder)
        const move = moveFile(fullPath, destFolder)
        lastMoves.push({ from: move.from, to: move.to })
        log.push(move.message)
    }
    return log
}




function undoLastSort() {
    const log = []
    for (let i = lastMoves.length - 1; i >= 0; i--) {
        const move = lastMoves[i]
        fs.renameSync(move.to, move.from)
        log.push(`Undo: ${move.to} -> ${move.from}`)
    }
    lastMoves = []
    return log
}


module.exports = { sortFolder, undoLastSort }