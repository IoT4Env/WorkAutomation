import express from 'express'
import fs from 'fs'

import storage from '../Resources/storage.js'
import InitialData from '../initialData.js'
import Resources from '../Resources/resources.js'

const initialData = new InitialData();
const resources = new Resources();

const htmlTemplates = resources.HtmlTemplates;
const returnBack = resources.ReturnBackButton

const modelsDb = resources.ModelsDb;

const fileUpload = express();

//Upload query sql from proper file
fileUpload.post('/sql', storage.single('uploaded-sql-query'), (req, res) => {
    const sqlPath = req.file.path
    const query = fs.readFileSync(sqlPath, 'utf-8')
        .trim()

    fs.rmSync(sqlPath);
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

fileUpload.post('/ods', storage.single('uploaded-ods'), (req,res) =>{
    const odsPath = req.file.path
    initialData.initialData(odsPath)
    fs.rmSync(odsPath);
    res.status(201).send('Sql query is ready to be executed' + returnBack)
})

export default fileUpload;