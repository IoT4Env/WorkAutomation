const settings = document.querySelector('#settings'),
    returnBack = document.querySelector('.return-back'),
    saveConfig = document.querySelector('#save-config')


const origin = window.location.origin

let configuration
fetch(`${origin}/fetchResources/menuConfig`, { method: 'GET' }).then(res => {
    res.json().then(json => {
        configuration = json
        settings.checked = configuration.Settings
    })
})


settings.addEventListener('click', _ => {
    configuration.Settings = settings.checked
    console.log(configuration);
})

saveConfig.addEventListener('click', _ => {
    fetch(`${origin}/fetchResources/menuConfig`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(configuration)
        }).then(res =>{
            res.ok
        })
})
