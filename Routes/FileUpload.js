import express from 'express'
import fs from 'fs'
import storage from '../Resources/storage.js'

import Resources from '../Resources/resources.js'


const resources = new Resources();

const htmlTemplates = resources.HtmlTemplates;
const returnBack = resources.ReturnBackButton

const modelsDb = resources.ModelsDb;

const fileUpload = express();

//Upload query sql from proper file
fileUpload.post('/sql', storage.single('uploaded-file'), (req, res) => {
    const filePath = req.file.path
    const query = fs.readFileSync(filePath, 'utf-8')
        .trim()

    fs.rmSync(filePath);
    modelsDb.serialize(_ => {
        modelsDb.run(query, (err) => {
            if (err) {
                const errorObj = {
                    "Code": 3,
                    "Body": err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return;
            }
            res.status(201).send(htmlTemplates.Post + returnBack)
            return;
        })
    })
})

export default fileUpload;