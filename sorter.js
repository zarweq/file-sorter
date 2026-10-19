const path = require('path')
const fs = require('fs')

function getExtension(filename) {
    return path.extname(filename).slice(1)
}

function loadRules(rulesPath) {
    const data = fs.readFileSync(rulesPath, 'utf-8')
    return JSON.parse(data)
}

function loadHistory(historyPath) {
    if (!fs.existsSync(historyPath)) {
        return []
    }
    const data = fs.readFileSync(historyPath, 'utf-8')
    return JSON.parse(data)
}

function saveHistory(historyPath, moves) {
    fs.writeFileSync(historyPath, JSON.stringify(moves, null, 4))
}

function getCategory(extension, rules) {
    return rules[extension] || 'Other'
}

function ensureFolder(folderPath) {
    fs.mkdirSync(folderPath, { recursive: true })
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

function sortFolder(folderPath, rulesPath, historyPath) {
    const log = []
    const moves = []
    const rules = loadRules(rulesPath)
    const files = fs.readdirSync(folderPath)
    for (const filename of files) {
        try {
            const fullPath = path.join(folderPath, filename)
            if (!fs.statSync(fullPath).isFile() || filename.startsWith('.')) {
                continue
            }
            const extension = getExtension(filename)
            const category = getCategory(extension, rules)
            const destFolder = path.join(folderPath, category)
            ensureFolder(destFolder)
            const move = moveFile(fullPath, destFolder)
            moves.push({ from: move.from, to: move.to })
            log.push(move.message)
        } catch (error) {
            log.push(`Error: ${filename} - ${error.message}`)
        }
    }
    if (moves.length > 0) {
        saveHistory(historyPath, moves)
    }
    return log
}

function undoLastSort(historyPath) {
    const log = []
    const moves = loadHistory(historyPath)
    for (let i = moves.length - 1; i >= 0; i--) {
        const move = moves[i]
        try {
            fs.renameSync(move.to, move.from)
            log.push(`Undo: ${move.to} -> ${move.from}`)
        } catch (error) {
            log.push(`Error: ${move.to} - ${error.message}`)
        }
    }
    saveHistory(historyPath, [])
    return log
}

module.exports = { sortFolder, undoLastSort, getExtension, getCategory }
