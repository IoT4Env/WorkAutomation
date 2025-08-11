const deletes = document.querySelectorAll('.delete-many'),
    deletesLink = document.querySelector('#delete-many-link'),
    deleteSelected = document.querySelector('#delete-selected')


const linkString = deletesLink.getAttribute('href');

deleteSelected.addEventListener('click', _=>{
    let checkedArray = []
    deletes.forEach(del =>{
        if(del.checked)
            checkedArray.push(del.getAttribute('id'))
    })
    const checkedJson = JSON.stringify(checkedArray)

    deletesLink.setAttribute('href', linkString.replace('{{%IDS%}}', checkedJson))

    //operations required for url Filter=Field
    const currentWindow = window.location.href
    //returns http://<HOST_NAME>:<PORT>/CRUD
    const splitResources = currentWindow.split('/').splice(0, 4);
    const assembledUrl = splitResources.join('/')
    fetch(`${assembledUrl}/deleteMany/${checkedJson}`)
})
