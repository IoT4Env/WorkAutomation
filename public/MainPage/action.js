const names = document.getElementById('names'),
    getLink = document.getElementById('GET-Link'),
    inputs = document.getElementsByTagName('input'),
    fileInputs = document.querySelectorAll('input[type=file]')


//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region Dynamic DDL
let previusName,
    linkString = getLink.getAttribute('href')

names.addEventListener('change', _ => {
    if (names.value !== 'OPTIONS') {
        if (!linkString.includes('_Name_')) {
            getLink.setAttribute('href', linkString.replace(previusName, names.value))
        }
        getLink.setAttribute('href', linkString.replace('_Name_', names.value))

    } else {
        getLink.setAttribute('href', linkString.replace(previusName, '_Name_'))
    }
    console.log(names.value);
    previusName = names.value
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
