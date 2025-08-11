const field = document.querySelector('#field'),
    filter = document.querySelector('#filter'),
    getLink = document.querySelector('#get-link'),
    inputs = document.getElementsByTagName('input')

let columns = []
let filedsArr;

//gather data from back end when needed
window.onload = async () => {
    await fetch(`${window.location.href}fetchResources/columns`).then(res => {
        res.text().then(text => {
            columns = JSON.parse(text);
            filter.value = columns[0]
        })
    })
}

let linkString = getLink.getAttribute('href')

getLink.setAttribute('href', linkString.replace('Field', field.value).replace('Filter', filter.value))

//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region dynamic DDL

field.addEventListener('change', _ => {
    getLink.setAttribute('href', linkString
        .replace('Filter', filter.value)
        .replace('Field', field.value))
})

filter.addEventListener('change', _ => {
    fetch(`${window.location.href}fetchResources/filters/${filter.value.toString().toLowerCase()}`)
        .then(res => {
            res.text().then(filedsRes => {
                filedsArr = JSON.parse(filedsRes);
                field.innerHTML = filedsArr.join(',')
                getLink.setAttribute('href', linkString
                    .replace('Filter', filter.value)
                    .replace('Field', field.value))
            })
        })
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
