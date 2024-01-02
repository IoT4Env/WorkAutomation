require('dotenv').config()
const express = require('express')
const SQLite3 = require('sqlite3').verbose();
const helmet = require('helmet')
const bodyParser = require('body-parser')
const { join } = require('path');

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = process.env.SERVER_PORT
const url = `http://${SERVER_HOSTNAME}:${SERVER_PORT}`

const fs = require('fs');

let modifiedRoute = __dirname.replace('\Routes', '/')

let htmlContentTemplate = fs.readFileSync(modifiedRoute + 'public/GETS/ContentBody.html', 'utf-8')
let htmlGetResponseTemplate = fs.readFileSync(modifiedRoute + 'public/GETS/GETS.html', 'utf-8')
let htmlPostResponseTemplate = fs.readFileSync(modifiedRoute + 'public/POST/POST.html', 'utf-8')
let htmlDeleteResponseTemplate = fs.readFileSync(modifiedRoute + 'public/DELETE/DELETE.html', 'utf-8')

let returnBackButton = `<button><a href="/">BACK</a></button>`;

const crud = express()
crud.use(helmet())
crud.use(bodyParser.json())
crud.use(bodyParser.urlencoded({ extended: true }))

const modelliDB = new SQLite3.Database(join(modifiedRoute + './Database/modelli.db'))

crud.get('/', (req, res) => {
    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, * FROM Modelli', (err, rows) => {
            if (err) {
                console.log(err)
                res.status(500).send('Errore ottenimento dati')
            }
            crud.use(express.static('./public/GETS'))
            replacedRows = ReplaceRowsFunction(rows)
            res.status(200).send(htmlGetResponseTemplate.replace('{{%Content%}}', returnBackButton + replacedRows))
        })
    })
})

crud.get('/Nome=:Nome', (req, res) => {
    let nome = req.params.Nome

    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, * FROM Modelli WHERE Nome = $Nome',
            {
                $Nome: nome
            }
            , (err, rows) => {
                if (err) {
                    console.log(err)
                    console.log('Ciao');
                    res.statusCode = 500
                    res.send('Errore ottenimento dati')
                }
                crud.use(express.static('./public/GETS'))
                replacedRows = ReplaceRowsFunction(rows)
                res.status(200).send(htmlGetResponseTemplate.replace('{{%Content%}}', returnBackButton + replacedRows))
            })
    })
})

crud.post('/', (req, res) => {
    crud.use(express.static('./public/POST'))
    let jsonObject = {
        $Nome: req.body.nome || null,
        $Cognome: req.body.cognome || null,
        $Indirizzo: req.body.indirizzo || null,
        $Posta: req.body.posta || null,
    };
    if (Object.values(jsonObject).includes(null)) {
        res.status(500).send('<p>Non tutti i campi compilati</p><br>' + returnBackButton)
        return;
    }

    modelliDB.serialize(_ => {
        modelliDB.run('INSERT INTO Modelli(Nome, Cognome, Indirizzo, Posta) VALUES ($Nome, $Cognome, $Indirizzo, $Posta)',
            jsonObject, (err) => {
                if (err) {
                    res.status(500).send('Errore inserimento dati')
                }
                res.status(201).send(htmlPostResponseTemplate + returnBackButton)
            })
    })
})

crud.get('/delete/Id=:id', (req, res) => {
    let id = req.params.id
    modelliDB.serialize(_ => {
        modelliDB.run('DELETE FROM Modelli WHERE ROWID = $Id', {
            $Id: id
        }, (err) => {
            if (err) {
                res.status(500).send('Errore eliminazione dato')
            }
            let options = {
                method: "DELETE"
            }
            fetch(`${url}/CRUD/delete/Id=${id}`, options)
                .then(res.status(200).send(htmlDeleteResponseTemplate + returnBackButton))
        })
    })
})

function ReplaceRowsFunction(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let replacedRows = jsonTemplate.map(json => {
        let outputRow = htmlContentTemplate
            .replace('{{%Nome%}}', json.Nome)
            .replace('{{%Cognome%}}', json.Cognome)
            .replace('{{%Indirizzo%}}', json.Indirizzo)
            .replace('{{%Posta%}}', json.Posta)
            .replace('{{%Id%}}', json.rowid)

        return outputRow
    })
    return replacedRows.join('');
}

module.exports = crud;