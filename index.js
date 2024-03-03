require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const SQLite3 = require('sqlite3').verbose();
const path = require('path')
const fs = require('fs')

const crud = require('./Routes/CRUD')
const image = require('./Views/imageView')
const handleError = require('./Views/handleError.js')

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = process.env.SERVER_PORT
const url = `http://${SERVER_HOSTNAME}:${SERVER_PORT}`

const app = express();

app.use(helmet())
app.use(express.json());

let htmlDropDownPopulation = fs.readFileSync(__dirname + '/public/MainPage/Index.html', 'utf-8')

app.use('/CRUD', crud)
app.use('/Images', image)
app.use('/handleError', handleError)
let ModelliDB = new SQLite3.Database(path.join(__dirname + './Database/modelli.db'))

app.listen(SERVER_PORT, SERVER_HOSTNAME, _ => {
    console.log(`Server avviato su ${url}`)
})

app.get('', (req, res) => {
    ModelliDB.serialize(_ => {
        ModelliDB.all('SELECT ROWID, Nome FROM Modelli', (err, rows) => {
            if (err) {
                res.status(500).send('Errore popolazione dropdown')
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