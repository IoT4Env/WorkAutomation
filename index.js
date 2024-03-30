import express from 'express';
import helmet from 'helmet';

import crud from './Routes/CRUD.js';
import image from './Views/imageView.js';
import handleError from './Views/handleError.js';
import fileUpload from './Routes/FileUpload.js';

import Resources from './Resources/resources.js'
import Config from './Resources/config.js'

const resources = new Resources();
const config = new Config();

const ddl = resources.HtmlTemplates.DDL;

const SERVER_PORT = config.SERVER_PORT
const SERVER_HOSTNAME = config.SERVER_HOSTNAME
const localhost = config.URL;

const modelsDb = resources.ModelsDb;

const app = express();
app.use(helmet())
app.use(express.json());

app.use('/CRUD', crud)
app.use('/FileUpload', fileUpload)
app.use('/Images', image)
app.use('/handleError', handleError)


app.listen(SERVER_PORT, SERVER_HOSTNAME, _ => {
    console.log(`Server started on ${localhost}`)
})

//Gets main page
app.get('', (req, res) => {
    modelsDb
    .serialize(_ => {
        modelsDb
        .all('SELECT ROWID, name FROM Models', (err, rows) => {
            if (err) {
                const errorObj = {
                    "Code": 1,
                    "Body": err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return;
            }
            let jsonTemplate = JSON.parse(JSON.stringify(rows))
            let populatedNames = []
            jsonTemplate.map(json => {
                if (!populatedNames.includes(`<option>${json.name}</option>`))
                    populatedNames.push(`<option>${json.name}</option>`)
            })
            app.use(express.static('./public/MainPage'))
            res.status(200)
                .send(ddl.replace('{{%Names%}}', populatedNames.join(',')))
        })
    })
})
