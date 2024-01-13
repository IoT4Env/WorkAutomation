require('dotenv').config()
const express = require('express')
const SQLite3 = require('sqlite3').verbose();
const helmet = require('helmet')
const bodyParser = require('body-parser')
const { join } = require('path');

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME;
const SERVER_PORT = process.env.SERVER_PORT
const localhost = `http://${SERVER_HOSTNAME}:${SERVER_PORT}`

const fs = require('fs');

let modifiedRoute = __dirname.replace('\Routes', '/')

let htmlContentTemplate = fs.readFileSync(modifiedRoute + 'public/ContentBody.html', 'utf-8')
let htmlGetResponseTemplate = fs.readFileSync(modifiedRoute + 'public/GETS/GETS.html', 'utf-8')
let htmlPostResponseTemplate = fs.readFileSync(modifiedRoute + 'public/POST/POST.html', 'utf-8')
let htmlUpdateResponseTemplate = fs.readFileSync(modifiedRoute + 'public/UPDATE/UPDATE.html', 'utf-8')
let htmlDeleteResponseTemplate = fs.readFileSync(modifiedRoute + 'public/DELETE/DELETE.html', 'utf-8')

let returnBackButton = `<button><a href="/">BACK</a></button>`;

let columnsName = [
    "Nome",
    "Cognome",
    "Indirizzo",
    "Posta"
]

const crud = express()
crud.use(helmet())
crud.use(bodyParser.json())
crud.use(bodyParser.urlencoded({ extended: true }))
crud.use(express.static('./public/'))

const modelliDB = new SQLite3.Database(join(modifiedRoute + './Database/modelli.db'))

crud.get('/', (req, res) => {
    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, * FROM Modelli', (err, rows) => {
            if (err) {
                console.log(err)
                res.status(500).send('Errore ottenimento dati')
            }
            replacedRows = ReplaceRowsFunction(rows)
            res.status(200).send(htmlGetResponseTemplate.replace('{{%Content%}}', returnBackButton + replacedRows))
        })
    })
})

crud.get('/Nome=:Nome', (req, res) => {
    let nome = req.params.Nome

    if (nome.includes('_')) {
        res.status(400).send(`Name not specified ${returnBackButton}`)
        return
    }

    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, * FROM Modelli WHERE Nome = $Nome',
            {
                $Nome: nome
            }
            , (err, rows) => {
                if (err) {
                    console.log(err)
                    res.statusCode = 500
                    res.send('Errore ottenimento dati')
                }

                replacedRows = ReplaceRowsFunction(rows)
                res.status(200).send(htmlGetResponseTemplate.replace('{{%Content%}}', returnBackButton + replacedRows))
            })
    })
})

crud.get('/Id=:id', (req, res) => {
    let id = req.params.id

    modelliDB.serialize(_ => {
        modelliDB.all('SELECT ROWID, * FROM Modelli WHERE ROWID = $Id', {
            $Id: id
        }, (err, row) => {
            if (err) {
                res.sendStatus(500).send('Error on getting the row')
            }
            replacedRow = ReplaceRowsFunction(row)
            let getElementsRow = replacedRow.split('\n')
            let content = [];
            //Need to insert name = the name that will be saved in the req.body object!!!
            for (let i = 1; i < getElementsRow.length - 1; i++) {
                content.push(`<th>
                    <input value="${getElementsRow[i]
                        .trim()
                        .substring(4, getElementsRow[i].trim().length - 5)}"
                    type="text"
                    name="${columnsName[i - 1]}">
                    </th>`)
            }
            res.status(200).send(returnBackButton + htmlUpdateResponseTemplate.
                replace('{{%Content%}}', content.join(''))
                .replace(/{{%Id%}}/g, id))
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
        return
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

/*
Since we are working on localhost environment, we can accept the loss on security
If i wanted to use the post method, i would need to create a new resourse on the db
and then delete the old value, thus preserving some of the security
*/
crud.get('/update/Id=:id', (req, res) => {
    const fullUrl = req.url
    const urlParams = fullUrl.split('?')[1].split('&')
    //TODO
    //Avoid the user insert chars like ?:&<>\/=
    // console.log(urlParams);
    let id = req.params.id
    let jsonObject = {
        $Id: id,
    };
    for (let i = 0; i < urlParams.length; i++) {
        jsonObject[`$${columnsName[i]}`] = urlParams[i].split('=')[1] || null
    }

    modelliDB.serialize(_ => {
        modelliDB.run(`UPDATE Modelli SET
        Nome = $Nome,
        Cognome = $Cognome,
        Indirizzo = $Indirizzo,
        Posta = $Posta
        WHERE ROWID = $Id`,
            jsonObject, async (err) => {
                //TODO
                //function that handles error in the same way
                if (err) {
                    console.error(err)
                    return
                }
                let options = {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                await fetch(`${localhost}/CRUD/update/Id=${id}`, options)
                    .then(res.status(200).send(jsonObject))
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
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            fetch(`${localhost}/CRUD/delete/Id=${id}`, options)
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
            .replace(/{{%Id%}}/g, json.rowid)

        return outputRow
    })
    if (rows.length === 1) {
        let subString = replacedRows[0].split('</th>')
        subString.splice(subString.length - 2, 1)
        return subString.join('</th>')
    }
    return replacedRows.join('');
}

module.exports = crud;