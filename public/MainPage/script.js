const field = document.querySelector('#field'),
    filter = document.querySelector('#filter'),
    getsLink = document.querySelector('#gets-link'),
    getLink = document.querySelector('#get-link'),
    postLink = document.querySelector('#insert-form'),
    inputs = document.getElementsByTagName('input'),
    fileInputs = document.querySelectorAll('input[type=file]'),
    tableSelection = document.querySelector('#table-selection'),
    insertFields = document.querySelector('#insert-fields')

let columns = []
let fieldsArr;
let tableSelected = tableSelection.value//first value inside the ddl

//gather data from back end when needed
window.onload = async () => {
    await fetch(`${window.location.href}fetchResources/columns/${tableSelected}`).then(res => {
        res.text().then(text => {
            columns = JSON.parse(text);
            filter.value = columns[0]
        })
    })
}

//Get the /CRUD/ resource path (the one that must NOT change)
let getsString = getsLink.getAttribute('href')

//Based on placeholder values, there is no need to rememnber what values where inserted by some other code
//just replace the placeholders with new values and you are good to go
let linkString = getLink.getAttribute('href')

let postLinkString = postLink.getAttribute('action')

//Call once to define initial values fo the resource API
updateLinks()

function updateLinks() {
    //Initial values for the links
    getsLink.setAttribute('href', `${getsString}/${tableSelected}`)

    getLink.setAttribute('href', `${linkString}/${tableSelected}?${filter.value}=${field.value}`)

    postLink.setAttribute('action', `${postLinkString}/${tableSelected}`)
}


//#region Configure main page based on table selected
tableSelection.addEventListener('change', async _ => {
    tableSelected = tableSelection.value

    await fetch(`${window.location.href}fetchResources/update/${tableSelected}`)

    await fetch(`${window.location.href}fetchResources/columns/${tableSelected}`).then(res => {
        res.text().then(async text => {
            columns = JSON.parse(text);

            let updataedFilters = []
            columns.forEach(column => {
                updataedFilters.push(`<option>${column}</option>`)
            })
            filter.innerHTML = updataedFilters

            let updateFormFields = []
            columns.forEach(column => {
                updateFormFields.push(`<label>${column}
                        <input type="text" name="${column.toLowerCase()}" required>
                        </label>`)
            })
            insertFields.innerHTML = updateFormFields.join('')

            await updateFileds()
        })
    })
    //Update links on table change
    updateLinks()
})
//#endregion

//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region dynamic DDL

field.addEventListener('change', _ => {
    getLink.setAttribute('href', `${linkString}/${tableSelected}?${filter.value}=${field.value}`)
})

filter.addEventListener('change', async _ => {
    await updateFileds()
})
//#endregion

//#region Verbosed labels
let labelInputs = []

fileInputs.forEach(file => {
    labelInputs.push(document.querySelector(`label[for=${file.id}]`))
})

for (let i = 0; i < fileInputs.length; i++) {
    fileInputs[i].addEventListener('change', _ => {
        labelInputs[i].innerHTML = fileInputs[i].files[0].name
    })
}
//#endregion

async function updateFileds() {
    await fetch(`${window.location.href}fetchResources/filters/${filter.value.toString().toLowerCase()}/tables/${tableSelected}`)
        .then(res => res.text().then(fields => {
            fieldsArr = JSON.parse(fields);

            let uniqueFields = []
            fieldsArr.map(field => {
                if (!uniqueFields.includes(field))
                    uniqueFields.push(field)
            })

            field.innerHTML = uniqueFields.join(',')
            getLink.setAttribute('href', `${linkString}/${tableSelected}?${filter.value}=${field.value}`)
        }))
}