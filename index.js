import express from 'express';
import helmet from 'helmet';

import crud from './Routes/CRUD.js';
import image from './Views/imageView.js';
import handleError from './Views/handleError.js';
import fileUpload from './Routes/FileUpload.js';
import fetchResources from './Views/fetchResources.js'

import Resources from './Resources/resources.js'
import Config from './Resources/config.js'

const resources = new Resources();
const config = new Config();

const SERVER_PORT = config.SERVER_PORT
const SERVER_HOSTNAME = config.SERVER_HOSTNAME
const localhost = config.URL;

const modelsDb = resources.ModelsDb;
let baseFilter = resources.ColumnsName[0].toLowerCase()

const app = express();
app.use(helmet())
app.use(express.json());

app.use('/CRUD', crud)
app.use('/FileUpload', fileUpload)
app.use('/Images', image)
app.use('/handleError', handleError)
app.use('/fetchResources', fetchResources)


app.listen(SERVER_PORT, SERVER_HOSTNAME, _ => {
    console.log(`Server started on ${localhost}`)
})

//Gets main page
app.get('', (req, res) => {
    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, ${baseFilter} FROM Models`, (err, rows) => {
            if (err) {
                console.log(err);
                const errorObj = {
                    "Code": 1,
                    "Body": err
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return;
            }
            let names = []
            rows.map(json => {
                if (!names.includes(`<option>${json[baseFilter]}</option>`))
                    names.push(`<option>${json[baseFilter]}</option>`)
            })
            let filters = []
            resources.ColumnsName.forEach(column => {
                filters.push(`<option>${column}</option>`)
            })
            app.use(express.static('public/MainPage'));
            return res.status(200).send(
                resources.HtmlTemplates.Index
                    .replace('{{%FIELDS%}}', names)
                    .replace('{{%FILTERS%}}', filters))
        })
    })
})
