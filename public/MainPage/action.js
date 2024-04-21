const fields = document.querySelector('#fields'),
    filter = document.querySelector('#filter'),
    getLink = document.querySelector('#get-link'),
    inputs = document.getElementsByTagName('input')

let columns, filedsArr;

//gather data from back end when needed
fetch(`${window.location.href}fetchResources/columns`).then(res => {
    res.text().then(text => {
        columns = JSON.parse(text);
    })
})

let linkString = getLink.getAttribute('href')

getLink.setAttribute('href', linkString.replace('_Name_', fields.value))

//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region dynamic DDL

fields.addEventListener('change', _ => {
    getLink.setAttribute('href', linkString.replace('_Name_', fields.value))
})

filter.addEventListener('change', _ => {
    fetch(`${window.location.href}fetchResources/filters/${filter.value.toString().toLowerCase()}`)
        .then(res => {
            res.text().then(filedsRes => {
                filedsArr = JSON.parse(filedsRes);
                fields.innerHTML = filedsArr.join(',')
                getLink.setAttribute('href', linkString.replace('_Name_', fields.value))
            })
        })
})
//#endregion
