const express = require('express')

let image = express()

image.get('/delete.png', (req, res) => {
    res.sendFile(__dirname + '/Images/delete.png')
})

module.exports = image;