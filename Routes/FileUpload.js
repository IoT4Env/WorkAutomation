import express from 'express'
import SQLite3 from 'sqlite3';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'

import storage from '../Resources/storage.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let htmlPostResponseTemplate = fs.readFileSync(join(__dirname.replace('Routes', '')) + '/public/POST/POST.html', 'utf-8')

let returnBackButton = `<button><a href="/">BACK</a></button>`;

const fileUpload = express();

const modelliDB = new SQLite3.Database(join(__dirname.replace('/Routes', '/') + 'Database/modelli.db'))

fileUpload.post('/sql', storage.single('uploaded-file'), (req, res) => {
    const filePath = req.file.path
    const query = fs.readFileSync(filePath, 'utf-8')
        .trim()

    console.log(query);

    fs.rmSync(filePath);
    modelliDB.serialize(_ => {
        modelliDB.run(query, (err) => {
            if (err) {
                const errorObj = {
                    "Code": 3,
                    "Body": err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return;
            }
            res.status(201).send(htmlPostResponseTemplate + returnBackButton)
            return;
        })
    })
})

export default fileUpload;