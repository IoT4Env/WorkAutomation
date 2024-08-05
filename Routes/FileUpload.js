import express from 'express'
import helmet from 'helmet';
import fs from 'fs'

import storage from '../Resources/storage.js'
import InitialData from '../initialData.js'
import Resources from '../Resources/resources.js'
import DbInfo from '../Resources/dbQueries.js'


const initialData = new InitialData();
const resources = new Resources();

const htmlTemplates = resources.HtmlTemplates;
const returnBack = resources.ReturnBackButton

const modelsDb = DbInfo.ModelsDb;

const fileUpload = express();
fileUpload.use(helmet())


//Migrate ods file uploaded by the user
fileUpload.post('/ods', storage.single('uploaded-ods'), (req, res) => {
    const odsPath = req.file.path
    initialData.getInitialData(odsPath).then(_ =>{
        res.status(201).send('Sql query is ready to be executed' + returnBack)
        return
    }).catch(err => {
        return res.status(400).redirect(`/handleError/invalidCells/${err}`)
    }).finally(_ =>{
        fs.rmSync(odsPath);
    })
})

export default fileUpload;