import dotEnv from 'dotenv'
import express from 'express';
import helmet from 'helmet';
import SQLite3 from 'sqlite3';
import path, { join } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

import crud from './Routes/CRUD.js';
import image from './Views/imageView.js';
import handleError from './Views/handleError.js';
import fileUpload from './Routes/FileUpload.js';

dotEnv.config()

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = process.env.SERVER_PORT
const url = `http://${SERVER_HOSTNAME}:${SERVER_PORT}`

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet())
app.use(express.json());

let htmlDropDownPopulation = readFileSync(__dirname + '/public/MainPage/Index.html', 'utf-8')

app.use('/CRUD', crud)
app.use('/FileUpload', fileUpload)
app.use('/Images', image)
app.use('/handleError', handleError)

const modelliDB = new SQLite3.Database(join(__dirname + '/Database/modelli.db'))

app.listen(SERVER_PORT, SERVER_HOSTNAME, _ => {
    console.log(`Server avviato su ${url}`)
})

app.get('', (req, res) => {
    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, Nome FROM Modelli', (err, rows) => {
            if (err) {
                const errorObj = {
                    Code: 1,
                    Body: err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return;
            }
            let jsonTemplate = JSON.parse(JSON.stringify(rows))
            let populatedNameDropDown = []
            jsonTemplate.map(json => {
                if (!populatedNameDropDown.includes(`<option>${json.Nome}</option>`))
                    populatedNameDropDown.push(`<option>${json.Nome}</option>`)
            })
            app.use(express.static('./public/MainPage'))
            res.status(200)
                .send(htmlDropDownPopulation.replace('{{%ListaNomi%}}', populatedNameDropDown.join(',')))
        })
    })
})