
const test = require('node:test')
const assert = require('node:assert')
const { getExtension, getCategory, sortFolder } = require('./sorter.js')

const fs = require('fs')
const path = require('path')

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


test('sortFolder moves files into category folders', () => {
    const testDir = path.join(__dirname, 'test-tmp')
    fs.mkdirSync(testDir, { recursive: true })
    fs.writeFileSync(path.join(testDir, 'photo.jpg'), '')
    fs.writeFileSync(path.join(testDir, 'doc.pdf'), '')

    sortFolder(testDir)

    assert.strictEqual(fs.existsSync(path.join(testDir, 'Images', 'photo.jpg')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Documents', 'doc.pdf')), true)

    fs.rmSync(testDir, { recursive: true, force: true })
})

test('sortFolder skips hidden files', () => {
    const testDir = path.join(__dirname, 'test-tmp-hidden')
    fs.mkdirSync(testDir, { recursive: true })
    fs.writeFileSync(path.join(testDir, '.DS_Store'), '')

    sortFolder(testDir)

    assert.strictEqual(fs.existsSync(path.join(testDir, '.DS_Store')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Other')), false)

    fs.rmSync(testDir, { recursive: true, force: true })
})

test('undoLastSort moves files back to original location', () => {
    const { undoLastSort } = require('./sorter.js')
    const testDir = path.join(__dirname, 'test-tmp-undo')
    fs.mkdirSync(testDir, { recursive: true })
    fs.writeFileSync(path.join(testDir, 'song.mp3'), '')

    sortFolder(testDir)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Music', 'song.mp3')), true)

    undoLastSort()
    assert.strictEqual(fs.existsSync(path.join(testDir, 'song.mp3')), true)
    assert.strictEqual(fs.existsSync(path.join(testDir, 'Music', 'song.mp3')), false)

    fs.rmSync(testDir, { recursive: true, force: true })
})
