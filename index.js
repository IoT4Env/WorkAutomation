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

const index = resources.HtmlTemplates.Index;
let lastFilter = ''

const SERVER_PORT = config.SERVER_PORT
const SERVER_HOSTNAME = config.SERVER_HOSTNAME
const localhost = config.URL;

const modelsDb = resources.ModelsDb;

const app = express();
app.use(helmet())
app.use(express.json());
app.use(express.static('public'));

app.set('views', resources.HtmlPaths.Index);
app.set('view engine', 'ejs');

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
    lastFilter = Object.keys(req.query).length === 0 ? 'name' : req.query['filter'];
    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, ${lastFilter} FROM Models`, (err, rows) => {
            if (err) {
                console.log(err);
                const errorObj = {
                    "Code": 1,
                    "Body": err
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return;
            }
            //let jsonTemplate = JSON.parse(JSON.stringify(rows))
            let names = []
            //console.log(jsonTemplate);
            rows.map(json => {
                if (!names.includes(`<option>${json[lastFilter]}</option>`))
                    names.push(`<option>${json[lastFilter]}</option>`)
            })
            let filters = []
            resources.ColumnsName.forEach(column => {
                filters.push(`<option>${column}</option>`)
            })
            app.use(express.static(resources.HtmlPaths.Index));
            return res.status(200).send(
                resources.HtmlTemplates.Index
                    .replace('{{%FIELDS%}}', names)
                    .replace('{{%FILTERS%}}', filters))
        })
    })
})
