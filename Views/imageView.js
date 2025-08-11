import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import path from 'path';

let image = express()
image.use(helmet())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

image.get('/delete.png', (req, res) => {
    res.sendFile(__dirname + '/Images/recycleBin.png')
    return
})

export default image;