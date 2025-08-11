import express, { response } from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';

import Resources from '../Resources/resources.js'
import DbInfo from '../Resources/dbQueries.js'
import Config from '../Resources/config.js'

const resources = new Resources();
const dbInfo = new DbInfo()
const config = new Config();

const localhost = config.URL;

const htmlTemplates = resources.HtmlTemplates;
const get = htmlTemplates.Get;
const returnBackButton = resources.ReturnBackButton;

const columnsName = resources.ColumnsName;

const modelsDb = dbInfo.ModelsDb;

const crud = express()
crud.use(helmet())
crud.use(express.json())
crud.use(bodyParser.urlencoded({ extended: true }))
crud.use(express.static('./public/'))


//Gets all elements from the Models table
crud.get('/', (req, res) => {
    modelsDb.serialize(_ => {
        modelsDb.all('SELECT ROWID, * FROM Models', (err, rows) => {
            if (err) {
                const errorObj = {
                    Code: 1,
                    Body: err
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return
            }
            crud.use(express.static('public/GETS'));
            let replacedRows = replaceRows(rows)
            let deleteId = replaceId(rows)
            res.status(200).send(get.replace('{{%Content%}}', returnBackButton + replacedRows + deleteId))
            return
        })
    })
})

//Build get api foreach column
resources.ColumnsName.forEach(filter => {
    crud.get(`/${filter}=:Field`, (req, res) => filters(req, res, filter))
})

function filters(req, res, filter) {
    let field = req.params.Field

    if (field.includes('_')) {
        res.status(400).send(`${filter} not specified ${returnBackButton}`)
        return
    }

    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, * FROM Models WHERE ${filter} = $Field`,
            {
                $Field: field
            }
            , (err, rows) => {
                if (err) {
                    console.log(err);
                    const errorObj = {
                        Code: 1,
                        Body: err
                    }
                    res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                    return
                }

                let replacedRows = replaceRows(rows)
                let deleteId = replaceId(rows)
                res.status(200).send(get.replace('{{%Content%}}', returnBackButton + replacedRows + deleteId))
                return
            })
    })
}

//Insert data in the Models table
crud.post('/', (req, res) => {
    crud.use(express.static('./public/POST'))
    let jsonObject = {
        $Name: req.body.name || null,
        $Surname: req.body.surname || null,
        $Address: req.body.address || null,
        $Mail: req.body.mail || null,
    };

    modelsDb.serialize(_ => {
        modelsDb.run('INSERT INTO Models(name, surname, address, mail) VALUES ($Name, $Surname, $Address, $Mail)',
            jsonObject, (err) => {
                if (err) {
                    const errorObj = {
                        "Code": 0,
                        "Body": err
                    }
                    res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                    return
                }
                res.status(201).send(htmlTemplates.Post + returnBackButton)
            })
    })
})

//Get element to update by id and displays the content on a different html page
crud.get('/Id=:id', (req, res) => {
    crud.use(express.static('./public/UPDATE'))
    let id = req.params.id

    modelsDb.serialize(_ => {
        modelsDb.all('SELECT ROWID, * FROM Models WHERE ROWID = $Id', {
            $Id: id
        }, (err, row) => {
            if (err) {
                const errorObj = {
                    Code: 1,
                    Body: err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return
            }
            let replacedRow = rowsRefinment(replaceRows(row))
            let getElementsRow = replacedRow.split('\n')
            let content = [];

            //i = 3 is the offset from witch to start getting the elements interested on the update, the columns parameters
            for (let i = 3; i < columnsName.length + 3; i++) {
                content.push(`<th>
                    <input value="${getElementsRow[i]
                        .trim()
                        .substring(4, getElementsRow[i].trim().length - 5)}"
                    type="text"
                    required
                    name="${columnsName[i - 1]}">
                    </th>`)
            }
            res.status(200).send(returnBackButton + htmlTemplates.Update.
                replace('{{%Content%}}', content.join(''))
                .replace(/{{%Id%}}/g, id))
        })
    })
})

/*
Since we are working on localhost environment, we can accept the loss on security
If i wanted to use the post method, i would need to create a new resourse on the db
and then delete the old value, thus preserving some of the security
*/
//The updated data replaces the old data
crud.get('/update/Id=:id', (req, res) => {
    const fullUrl = req.url
    const urlParams = fullUrl.split('?')[1].split('&')
    let id = req.params.id
    let jsonObject = {
        $Id: id,
    };
    for (let i = 0; i < urlParams.length; i++) {
        jsonObject[`$${columnsName[i]}`] = urlParams[i].split('=')[1] || null
    }

    modelsDb.serialize(_ => {
        modelsDb.run(`UPDATE Models SET
        name = $Name,
        surname = $Surname,
        address = $Address,
        mail = $Mail
        WHERE ROWID = $Id`,
            jsonObject, async (err) => {
                if (err) {
                    const errorObj = {
                        Code: 2,
                        Body: err
                    }
                    res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                    return
                }
                let options = {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                await fetch(`${localhost}/CRUD/update/Id=${id}`, options)
                    .then(res.status(200).send(returnBackButton + resources.HtmlTemplates.UpdateRes))
            })
    })
})

//Delete specific element by id
crud.get('/delete/Id=:id', (req, res) => {
    let id = req.params.id
    modelsDb.serialize(_ => {
        modelsDb.run('DELETE FROM Models WHERE ROWID = $Id', {
            $Id: id
        }, (err) => {
            if (err) {
                const errorObj = {
                    Code: 3,
                    Body: err
                }
                res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                return;
            }
            let options = {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            fetch(`${localhost}/CRUD/delete/Id=${id}`, options)
                .then(res.status(200).send(htmlTemplates.Delete + returnBackButton))
        })
    })
})

//delete multiple elements
crud.get('/deleteMany/:ids', (req, res) => {
    const rawIds = req.params.ids;
    const ids = JSON.parse(rawIds)

    let rowidsSelect = []
    ids.forEach(id => rowidsSelect.push(`ROWID = ${id}`))

    modelsDb.serialize(_ => {
        modelsDb.run(`DELETE FROM Models WHERE ${rowidsSelect.join(' OR ')}`,
            (err) => {
                if (err) {
                    const errorObj = {
                        Code: 3,
                        Body: err
                    }
                    res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                    return;
                }
                let options = {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                return fetch(`${localhost}/CRUD/deleteMany/${ids}`, options)
                    .then(_ => {
                        res.status(200).send(htmlTemplates.Delete + returnBackButton)
                        return
                    })
            })
    })
})

/**
 * 
 * @param {Array} rows Returned rows from the sql query
 * @returns Content gathered from the db as table format in the html page
 */
function replaceRows(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let replacedRows = jsonTemplate.map(json => {
        let outputRow = htmlTemplates.Content
            .replace('{{%Name%}}', json.name)
            .replace('{{%Surname%}}', json.surname)
            .replace('{{%Address%}}', json.address)
            .replace('{{%Mail%}}', json.mail)
            .replace(/{{%Id%}}/g, json.rowid)

        return outputRow
    })
    return replacedRows.join('');
}

/**
 * 
 * @param {Array} replacedRows Raw replaced rows that need more work before displaying on html
 * @returns A refined version of raws
 */
function rowsRefinment(replacedRows) {
    let subString = replacedRows.split('</th>')
    //eliminate elements starting from columnsName.length + 1 to the end of array
    //columnsName.length + 1 is required for the additional '<tr>' present in the array
    subString.splice(columnsName.length + 1, subString.length - columnsName.length)
    return subString.join('</th>')
}

function replaceId(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let replacedRows = jsonTemplate.map(json => {
        let outputRow = htmlTemplates.ConfirmDeletion
            .replace(/{{%Id%}}/g, json.rowid)

        return outputRow
    })
    return replacedRows.join('');
}

export default crud;