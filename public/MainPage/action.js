const nomiDDL = document.getElementById('Nomi');
const getLink = document.getElementById('GET-Link');

let linkString = getLink.getAttribute('href')
let previusName

nomiDDL.addEventListener('change', _ => {
    if (nomiDDL.value !== 'OPTIONS') {
        if (!linkString.includes('_Nome_')) {
            getLink.setAttribute('href', linkString.replace(previusName, nomiDDL.value))
        }
        getLink.setAttribute('href', linkString.replace('_Nome_', nomiDDL.value))

    } else {
        getLink.setAttribute('href', linkString.replace(previusName, '_Nome_'))
    }
    previusName = nomiDDL.value
})
