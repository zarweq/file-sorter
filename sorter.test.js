const test = require('node:test')
const assert = require('node:assert')
const { getExtension, getCategory, sortFolder, undoLastSort } = require('./sorter.js')

const fs = require('fs')
const path = require('path')

const testRules = {
    jpg: 'Images',
    pdf: 'Documents',
    mp3: 'Music'
}

function makeTestEnv(t, dirName) {
    const testDir = path.join(__dirname, dirName)
    const rulesPath = path.join(__dirname, `${dirName}-rules.json`)
    const historyPath = path.join(__dirname, `${dirName}-history.json`)

    fs.mkdirSync(testDir, { recursive: true })
    fs.writeFileSync(rulesPath, JSON.stringify(testRules))

    t.after(() => {
        fs.rmSync(testDir, { recursive: true, force: true })
        fs.rmSync(rulesPath, { force: true })
        fs.rmSync(historyPath, { force: true })
    })

    return { testDir, rulesPath, historyPath }
}

test('getExtension returns extension without dot', () => {
    assert.strictEqual(getExtension('photo.jpg'), 'jpg')
})

test('getExtension returns empty string when no extension', () => {
    assert.strictEqual(getExtension('README'), '')
})

test('getCategory returns category for known extension', () => {
    const rules = { jpg: 'Images', pdf: 'Documents' }
    assert.strictEqual(getCategory('jpg', rules), 'Images')
})

test('getCategory returns Other for unknown extension', () => {
    const rules = { jpg: 'Images' }
    assert.strictEqual(getCategory('xyz', rules), 'Other')
})

test('sortFolder moves files into category folders', (t) => {
    const { testDir, rulesPath, historyPath } = makeTestEnv(t, 'test-tmp')
    fs.writeFileSync(path.join(testDir, 'photo.jpg'), '')
    fs.writeFileSync(path.join(testDir, 'doc.pdf'), '')

    sortFolder(testDir, rulesPath, historyPath)

    assert.strictEqual(fs.existsSync(path.join(testDir, 'Images', 'photo.jpg')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Documents', 'doc.pdf')), true)
})

test('sortFolder skips hidden files', (t) => {
    const { testDir, rulesPath, historyPath } = makeTestEnv(t, 'test-tmp-hidden')
    fs.writeFileSync(path.join(testDir, '.DS_Store'), '')

    sortFolder(testDir, rulesPath, historyPath)

    assert.strictEqual(fs.existsSync(path.join(testDir, '.DS_Store')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Other')), false)
})

test('sortFolder does not overwrite history when nothing was moved', (t) => {
    const { testDir, rulesPath, historyPath } = makeTestEnv(t, 'test-tmp-keep-history')
    fs.writeFileSync(path.join(testDir, 'song.mp3'), '')

    sortFolder(testDir, rulesPath, historyPath)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Music', 'song.mp3')), true)

    sortFolder(testDir, rulesPath, historyPath)

    const historyAfterEmptySort = JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
    assert.strictEqual(historyAfterEmptySort.length, 1)
})

test('undoLastSort moves files back to original location', (t) => {
    const { testDir, rulesPath, historyPath } = makeTestEnv(t, 'test-tmp-undo')
    fs.writeFileSync(path.join(testDir, 'song.mp3'), '')

    sortFolder(testDir, rulesPath, historyPath)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Music', 'song.mp3')), true)

    undoLastSort(historyPath)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'song.mp3')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Music', 'song.mp3')), false)
})

test('undoLastSort continues past a missing file instead of aborting', (t) => {
    const { testDir, rulesPath, historyPath } = makeTestEnv(t, 'test-tmp-undo-missing')
    fs.writeFileSync(path.join(testDir, 'photo.jpg'), '')
    fs.writeFileSync(path.join(testDir, 'song.mp3'), '')

    sortFolder(testDir, rulesPath, historyPath)

    fs.rmSync(path.join(testDir, 'Images', 'photo.jpg'))

    const log = undoLastSort(historyPath)

    assert.strictEqual(fs.existsSync(path.join(testDir, 'song.mp3')), true)
    assert.ok(log.some((line) => line.startsWith('Error:')))
})
