const deletes = document.querySelectorAll('.delete-many'),
    deletesLink = document.querySelector('#delete-many-link'),
    deleteSelected = document.querySelector('#delete-selected'),
    cancelButton = document.querySelectorAll('.cancel'),
    deleteImgs = document.querySelectorAll('.delete-image'),
    dialogBoxes = document.querySelectorAll('.confirm-delete-box'),
    deleteId = document.querySelectorAll('.delete-id'),
    deleteImageLink = document.querySelectorAll('#delete-image-link')


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

//#region ConfirmDeletion
const origin = window.location.origin
let configuration

//add delete link on image if settings are configured to do so
(async () => {
    configuration = await getMenuConfig();
})().then(_ => {//on completed fetch
    if (!configuration.Settings) {
        for (let i = 0; i < deleteImgs.length; i++) {
            deleteImgs[i].removeEventListener('click', eventDeleteImgs)
            deleteImageLink[i].setAttribute('href', deleteId[i].getAttribute('href'))
        }
    } else {
        for (let i = 0; i < deleteImgs.length; i++) {
            deleteImgs[i].addEventListener('click', _ => eventDeleteImgs(dialogBoxes[i]))

            cancelButton[i].addEventListener('click', _ => {
                dialogBoxes[i].style.visibility = 'hidden'
                dialogBoxes[i].children.item(0).style.visibility = 'hidden'
                //item(0) because it refers to the div containing the confirm content
            })
        }
    }
})

async function getMenuConfig() {
    let response = await fetch(`${origin}/fetchResources/menuConfig`, { method: 'GET' })
    return await response.json()
}

let eventDeleteImgs = (dialog) => {
    dialog.style.visibility = 'visible'
    dialog.children.item(0).style.visibility = 'visible'
    //item(0) because it refers to the div containing the confirm content
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
