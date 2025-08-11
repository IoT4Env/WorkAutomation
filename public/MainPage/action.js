const names = document.getElementById('names'),
    getLink = document.getElementById('GET-Link'),
    inputs = document.getElementsByTagName('input')


//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region dynamic DDL
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
