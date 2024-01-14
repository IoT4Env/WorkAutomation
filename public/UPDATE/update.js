const inputs = document.getElementsByTagName('input');
const regex = /[^a-z0-9]/gi

for (let i = 0; i < inputs.length - 1; i++) {
    inputs[i].addEventListener('keyup', _ => {
        inputs[i].value = inputs[i].value.replace(regex, "")
    })
}