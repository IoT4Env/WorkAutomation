const express = require('express')

const handleError = express()

handleError.get('/:err', (req, res) => {
    console.log(req.params.err);
    const {Code, Body} = JSON.parse(req.params.err)

    console.error(Body)
    switch (Code) {
        case 0:
            res.status(500).send('Error on INSERT query')
            break;
        case 1:
            res.status(500).send('Error on SELECT query')
            break;
        case 2:
            res.status(500).send('Error on UPDATE query')
            break;
        case 3:
            res.status(500).send('Error on DELETE query')
            break;
        default:
            res.status(500).send('Unhandled error')
            break;
    }
    return;
})

module.exports = handleError