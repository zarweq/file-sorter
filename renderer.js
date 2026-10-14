const chooseFolderBtn = document.getElementById('choose-folder-btn')
const selectedPath = document.getElementById('selected-path')
const sortBtn = document.getElementById('sort-btn')
const logList = document.getElementById('log')
const undoBtn = document.getElementById('undo-btn')
const rulesContainer = document.getElementById('rules-container')
const addRuleBtn = document.getElementById('add-rule-btn')
const saveRulesBtn = document.getElementById('save-rules-btn')
chooseFolderBtn.addEventListener('click', async() => {
    const folder = await window.api.chooseFolder()
    if (folder) {
        selectedPath.textContent = folder
    }

})
sortBtn.addEventListener('click', async() => {
    const folder = selectedPath.textContent
    if (folder === 'Папка не выбрана') {
        return
    }
    const result = await window.api.runSort(folder)
    for (const message of result) {
            const li = document.createElement('li')
            li.textContent = message
            logList.appendChild(li)
    }
})
function createRuleRow(extension, category){
    const row = document.createElement('div')
    const extInput = document.createElement('input')
    extInput.value = extension
    extInput.className = 'rule-ext'
    const catInput = document.createElement('input')
    catInput.value = category
    catInput.className = 'rule-cat'
    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'Удалить'
    removeBtn.addEventListener('click', () => {
        row.remove()
    })
    row.appendChild(extInput)
    row.appendChild(catInput)
    row.appendChild(removeBtn)
    return row
}
async function loadRules() {
    const rules = await window.api.getRules()
    rulesContainer.innerHTML = ''
    for (const [extension, category] of Object.entries(rules)) {
        const row = createRuleRow(extension, category)
        rulesContainer.appendChild(row)
    }
}
undoBtn.addEventListener('click', async() => {
    const result = await window.api.undoSort()
    for (const message of result) {
        const li = document.createElement('li')
        li.textContent = message
        logList.appendChild(li)
    }

})

loadRules()
addRuleBtn.addEventListener('click', () => {
    const row = createRuleRow('', '')
    rulesContainer.appendChild(row)
})

saveRulesBtn.addEventListener('click', async () => {
    const newRules = {}
    for (const row of rulesContainer.children) {
        const extInput = row.querySelector('.rule-ext')
        const catInput = row.querySelector('.rule-cat')
        const extension = extInput.value.trim()
        const category = catInput.value.trim()
        if (extension && category) {
            newRules[extension] = category
        }
    }
    await window.api.saveRules(newRules)
    alert('Правила сохранены')
})
