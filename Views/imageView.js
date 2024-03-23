import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

let image = express()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

image.get('/delete.png', (req, res) => {
    res.sendFile(__dirname + '/Images/delete.png')
})

export default image;