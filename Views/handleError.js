import express from 'express';
import helmet from 'helmet';

const handleError = express()
handleError.use(helmet())

handleError.get('/:err', (req, res) => {
    const {Code, Body} = JSON.parse(req.params.err)

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

export default handleError