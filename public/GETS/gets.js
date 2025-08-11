const deletes = document.querySelectorAll('.delete-many'),
    deletesLink = document.querySelector('#delete-many-link'),
    deleteSelected = document.querySelector('#delete-selected'),
    deleteImgs = document.querySelectorAll('.delete-image'),
    dialogBoxes = document.querySelectorAll('.confirm-delete-box'),
    cancelButton = document.querySelectorAll('.cancel')


//#region Confirm deletion

for (let i = 0; i < deleteImgs.length; i++) {
    deleteImgs[i].addEventListener('click', _ => {
        dialogBoxes[i].style.visibility = 'visible'
        dialogBoxes[i].children.item(0).style.visibility = 'visible'
        //item(0) because it refers to the div containing the confirm content
    })
    cancelButton[i].addEventListener('click', _ => {
        dialogBoxes[i].style.visibility = 'hidden'
        dialogBoxes[i].children.item(0).style.visibility = 'hidden'
        //item(0) because it refers to the div containing the confirm content
    })
}
//#endregion

const linkString = deletesLink.getAttribute('href');
let checkedArray = []

//#region Delete many logic
//deleteSelected button disabled by default
deleteSelected.disabled = true

deletes.forEach(del => {
    del.checked = false
    del.addEventListener('click', _ => {
        checkDelete(del)
    })
})

function checkDelete(del) {
    let delId = del.getAttribute('id')
    if (checkedArray.includes(delId))
        checkedArray.splice(checkedArray.indexOf(delId), 1)
    else {
        checkedArray.push(delId)
    }

    if (checkedArray.length > 0) {
        deleteSelected.disabled = false
    } else {
        deleteSelected.disabled = true
    }
}

//#endregion

deleteSelected.addEventListener('click', _ => {

    deletes.forEach(del => {
        if (del.checked)
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
