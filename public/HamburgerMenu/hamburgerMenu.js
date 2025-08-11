const menuButton = document.querySelector('#menu-button')
const menuCtt = document.querySelector('#menu-ctt')


menuButton.addEventListener('click', _ => {
    for (let i = 0; i < menuButton.children.length; i++) {
        menuButton.children.item(i).classList.toggle('decoration-visibility')
    }

    toggleVisibility()
})

function toggleVisibility(){
    menuCtt.style.visibility = menuCtt.style.visibility == 'visible'
        ? 'hidden'
        : 'visible'
}
