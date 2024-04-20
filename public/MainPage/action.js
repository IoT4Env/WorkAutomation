const fields = document.querySelector('#fields'),
    filter = document.querySelector('#filter'),
    getLink = document.querySelector('#get-link'),
    inputs = document.getElementsByTagName('input')

let columns;

//gather data from back end when needed
fetch(`${window.location.href}fetchResources/columns`).then(res => {
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

fields.addEventListener('change', _ => {
    if (fields.value !== 'OPTIONS') {
        if (!linkString.includes('_Name_')) {
            getLink.setAttribute('href', linkString.replace(previusName, fields.value))
        }
        getLink.setAttribute('href', linkString.replace('_Name_', fields.value))

    } else {
        getLink.setAttribute('href', linkString.replace(previusName, '_Name_'))
    }
    previusName = fields.value
})

filter.addEventListener('change', _ => {
    //on change, an api is called
    //the api does the query by field chosen on the front end
    //the result should update the values inside html of main page
})
//#endregion
