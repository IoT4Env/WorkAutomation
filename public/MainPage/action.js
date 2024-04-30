const fields = document.querySelector('#fields'),
    filters = document.querySelector('#filters'),
    getLink = document.querySelector('#get-link'),
    inputs = document.getElementsByTagName('input')

let columns = []
let filedsArr;

//gather data from back end when needed
window.onload = async()=>{
    await fetch(`${window.location.href}fetchResources/columns`).then(res => {
        res.text().then(text => {
            columns = JSON.parse(text);
            filters.value = columns[0]
        })
    })
}

let linkString = getLink.getAttribute('href')

getLink.setAttribute('href', linkString.replace('Field', fields.value))

//#region Chars restriction
for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(/[^a-z0-9]/gi, "")
    })
}
//#endregion

//#region dynamic DDL

fields.addEventListener('change', _ => {
    getLink.setAttribute('href', linkString.replace('Field', fields.value))
})

filters.addEventListener('change', _ => {
    fetch(`${window.location.href}fetchResources/filters/${filters.value.toString().toLowerCase()}`)
        .then(res => {
            res.text().then(filedsRes => {
                filedsArr = JSON.parse(filedsRes);
                fields.innerHTML = filedsArr.join(',')
                getLink.setAttribute('href', linkString
                    .replace('Filter', filters.value)
                    .replace('Field', fields.value))
            })
        })
})
//#endregion
