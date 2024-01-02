const nomiDDL = document.getElementById('Nomi');
const getLink = document.getElementById('GET-Link');

nomiDDL.addEventListener('change', _ => {
    let linkString = getLink.getAttribute('href')
    getLink.setAttribute('href', linkString.replace('%Nome%', nomiDDL.value))
})
