//redeclaration of variable error when declaring with const, ler or var
//not sure why though...
deleteImgs = document.querySelectorAll('.delete-image')
dialogBoxes = document.querySelectorAll('.confirm-delete-box')


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
