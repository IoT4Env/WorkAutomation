import express from 'express';
import helmet from 'helmet';

import crud from './Routes/CRUD.js';
import image from './Views/imageView.js';
import handleError from './Views/handleError.js';
import fileUpload from './Routes/FileUpload.js';
import menu from './Routes/menu.js'
import fetchResources from './Views/fetchResources.js'
import queries from './Routes/initialDataQuery.js'

import Config from './Resources/config.js'
import Resources from './Resources/resources.js'
import PreparationQueries from './Resources/dbQueries.js'

const config = new Config();
const resources = new Resources();
const preparationQueries = new PreparationQueries()

const SERVER_PORT = config.SERVER_PORT
const SERVER_HOSTNAME = config.SERVER_HOSTNAME
const localhost = config.URL;

const modelsDb = resources.ModelsDb;
let currentFilter = resources.ColumnsName[0].toLowerCase()
let tables = preparationQueries.getTables()//get all tables inside database

const app = express();
app.use(helmet())
app.use(express.json());

app.use('/CRUD', crud)
app.use('/FileUpload', fileUpload)
app.use('/Images', image)
app.use('/handleError', handleError)
app.use('/menu', menu)
app.use('/fetchResources', fetchResources)
app.use('/queries', queries)


app.listen(SERVER_PORT, SERVER_HOSTNAME, _ => {
    console.log(`Server started on ${localhost}`)
})

//Gets main page
app.get('', (req, res) => {
    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, ${currentFilter} FROM Models`, async (err, rows) => {
            if (err) {
                const errorObj = {
                    "Code": 1,
                    "Body": err
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return;
            }

            let filters = []
            resources.ColumnsName.forEach(column =>{
                filters.push(`<option>${column}</option>`)
            })

            let uniqueFields = []
            //might be duplicates
            rows.map(json => {
                if (!uniqueFields.includes(`<option>${json[currentFilter]}</option>`))
                    uniqueFields.push(`<option>${json[currentFilter]}</option>`)
            })
            app.use(express.static('public/MainPage'));
            app.use(express.static('public/HamburgerMenu'));

            let tablesOption = []
            tables.forEach(table =>{
                tablesOption.push(`<option>${table.name}</option>`)
            })

            return res.status(200).send(
                resources.HtmlTemplates.Index
                    .replace('{{%FILTER%}}', filters)
                    .replace('{{%FIELD%}}', uniqueFields)
                    .replace('{{%TABLES%}}', tablesOption) + resources.HtmlTemplates.HamburgerMenu)
        })
    })
})
