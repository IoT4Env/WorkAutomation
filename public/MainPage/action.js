const names = document.querySelector('#names'),
    filter = document.querySelector('#filter'),
    getLink = document.querySelector('#get-link'),
    inputs = document.getElementsByTagName('input')

let columns;

fetch(`${window.location.href}fetchData`).then(res => {
    res.text().then(text => {
        columns = JSON.parse(text);
    })
})

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


//Per ottenere i nomi delle colonne dell'ods, dobbiamo fare una fetch ad una risorsa esposta dal server
//E una api che ritorna l'array columns del file risorse.js
filter.addEventListener('change', _ => {

})
//#endregion
