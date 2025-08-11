import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';

import Resources from '../Resources/resources.js'
import DbInfo from '../Resources/dbQueries.js'
import Config from '../Resources/config.js'

const resources = new Resources();
const config = new Config();

const localhost = config.URL;

const htmlTemplates = resources.HtmlTemplates;
const get = htmlTemplates.Get;
const returnBackButton = resources.ReturnBackButton;

const modelsDb = DbInfo.ModelsDb;

const tables = await Promise.resolve(DbInfo.getTables())
let currentTable = tables[0].name
let columnsName = await Promise.resolve(DbInfo.getColumnNames(currentTable))

const crud = express()
crud.use(helmet())
crud.use(express.json())
crud.use(bodyParser.urlencoded({ extended: true }))
crud.use(express.static('./public/'))

// async function configureGetApis(){
//     tables.forEach(async table =>{
//         let columns = await Promise.resolve(DbInfo.getColumnNames(table.name))
//         columns.forEach(filter => {
//             crud.get(`/:table/${filter}=:Field`, (req, res) => filters(req, res, filter))
//         })
//     })
// }

// await configureGetApis()

async function tableChange(){
    if(DbInfo.CurrentTable !== currentTable){
        currentTable = DbInfo.CurrentTable
        columnsName = await Promise.resolve(DbInfo.getColumnNames(currentTable))
    }
}


crud.all('/*', async (req,res,next) =>{
    await tableChange()
    next()
})


//Handles get all and get by column name
crud.get(`/:table`, (req, res) => {
    currentTable = req.params.table
    
    //check if there are some query parameters
    if(Object.keys(req.query).length !== 0)
    {
        handleQuery(req,res, req.query)
        return;
    }
    
    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, * FROM ${currentTable}`, (err, rows) => {
            if (err) {
                const errorObj = {
                    Code: 1,
                    Body: err.message
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return
            }
            //crud.use(express.static('public/GETS'));
            let replacedRows = replaceRows(rows)
            let deleteId = replaceId(rows)
            let columns = replaceColumns()
            res.status(200).send(get.replace('{{%Content%}}', replacedRows)
                                    .replace('{{%COLUMNS%}}', columns + returnBackButton + deleteId)
                                    .replace('{{%TABLE%}}', currentTable))
            return
        })
    })
})

function handleQuery(req, res, query) {
    currentTable = req.params.table
    let field = Object.values(query)[0]
    let filter = Object.keys(query)[0]


    if (field.includes('_')) {
        res.status(400).send(`${filter} not specified ${returnBackButton}`)
        return
    }

    modelsDb.serialize(_ => {        
        modelsDb.all(`SELECT ROWID, * FROM ${currentTable} WHERE ${filter} = '${field}'`,(err, rows) => {
            if (err) {
                console.log(err.message);
                const errorObj = {
                    Code: 1,
                    Body: err.message
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return
            }

            let replacedRows = replaceRows(rows)
            let deleteId = replaceId(rows)
            let columns = replaceColumns()
            res.status(200).send(get.replace('{{%Content%}}', replacedRows)
                                    .replace('{{%COLUMNS%}}', columns + returnBackButton + deleteId))
            return
        })
    })
}

//Insert data in the specified table
crud.post('/:table', (req, res) => {
    currentTable = req.params.table
    crud.use(express.static('./public/POST'))
    const {Columns, Values} = jsonQueryInfo(req)

    modelsDb.serialize(_ => {
        let query = `INSERT INTO ${currentTable} (${Columns.join(',')}) VALUES (${Values.join(',')})`
        modelsDb.run(query,//dynamic insert query achived!
            (err) => {
                if (err) {
                    const errorObj = {
                        Code: 0,
                        Body: err.message
                    }
                    res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                    return
                }
                res.status(201).send(htmlTemplates.Post + returnBackButton)
            })
    })
})

//Get element to update by id and displays the content on a different html page
crud.get('/update/:table', (req, res) => {
    currentTable = req.params.table
    crud.use(express.static('../public'))
    let id = Object.values(req.query)[0]
    

    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, * FROM ${currentTable} WHERE ROWID = ${id}`, (err, rows) => {
            if (err) {
                const errorObj = {
                    Code: 1,
                    Body: err.message
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return
            }
            let updatedRows = updateRows(rows)
            let columns = replaceColumns()
            res.status(200).send(returnBackButton + htmlTemplates.Update
                .replace('{{%Content%}}', updatedRows)
                .replace('{{%COLUMNS%}}', columns)
                .replace(/{{%Id%}}/g, id)
                .replace('{{%TABLE%}}', currentTable))
            
            return
        })
    })
})

//The updated data replaces the old data
crud.post('/update/:table', (req, res) => {
    currentTable = req.params.table
    let id = Object.values(req.query)[0]
    const {Columns, Values} = jsonQueryInfo(req)

    let keyValue = []
    for(let i = 0; i < columnsName.length; i++)
        keyValue.push(`${Columns[i]} = ${Values[i]}`)

    modelsDb.serialize(_ => {
        let query = `UPDATE ${currentTable} 
        SET ${keyValue.join(',')} 
        WHERE ROWID = ${id}` 

        modelsDb.run(query,
        async (err) => {
                if (err) {
                    const errorObj = {
                        Code: 2,
                        Body: err.message
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
                await fetch(`${localhost}/CRUD/update/${currentTable}?Id=${id}`, options)
                    .then(res.status(200).send(returnBackButton + resources.HtmlTemplates.UpdateRes))
            })
    })
})

//Delete specific element by id
crud.get('/delete/:table', (req, res) => {
    currentTable = req.params.table
    let id = Object.values(req.query)[0]

    modelsDb.serialize(_ => {
        modelsDb.run(`DELETE FROM ${currentTable} WHERE ROWID = $Id`, {
            $Id: id
        }, (err) => {
            if (err) {
                const errorObj = {
                    Code: 3,
                    Body: err.message
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
crud.get('/deleteMany/:table/:ids', (req, res) => {
    currentTable = req.params.table
    const rawIds = req.params.ids;
    const ids = JSON.parse(rawIds)

    let rowidsSelect = []
    ids.forEach(id => rowidsSelect.push(`ROWID = ${id}`))

    modelsDb.serialize(_ => {
        modelsDb.run(`DELETE FROM ${currentTable} WHERE ${rowidsSelect.join(' OR ')}`,
            (err) => {
                if (err) {
                    const errorObj = {
                        Code: 3,
                        Body: err.message
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
                return fetch(`${localhost}/CRUD/deleteMany/${currentTable}/${ids}`, options)
                    .then(_ => {
                        res.status(200).send(htmlTemplates.Delete + returnBackButton)
                        return
                    })
            })
    })
})

/**
 * 
 * @param {Object} req The request body of a post request to extract data from
 * @returns A new json containing column names and values as array properties
 */
function jsonQueryInfo(req){
    let jsonObject = {};

    //construct the json object with column names and associated value
    columnsName.forEach(column => jsonObject[column] = req.body[column.toLowerCase()])

    let queryInfo = {}

    //extracts columns from json
    const columns = Object.keys(jsonObject).map(column => column.toLowerCase())

    //extracts values from json
    const values = Object.values(jsonObject).map(value => `"${value}"`)

    queryInfo["Columns"] = columns
    queryInfo["Values"] = values

    return queryInfo
}

/**
 * 
 * @returns Column names of the current table formatted to be rendered in the html page
 */
function replaceColumns(){
    let replacedColumns = []
    columnsName.forEach(column =>{
        replacedColumns.push(`<th class="column-name">${column}</th>`)
    })
    return replacedColumns
}

/**
 * 
 * @param {Array} rows Returned rows from the sql query
 * @returns Content gathered from the db as table format in the html page
 */
function replaceRows(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let values = Object.values(jsonTemplate)
    let replacedRows = []

    for(let i = 0; i < values.length; i++){
        let row = ""
        for(let j = 0; j < columnsName.length; j++){
            let columnName = `${columnsName[j].toLowerCase()}`
            row += `<th>${values[i][columnName]}</th>`
        }
        replacedRows.push(htmlTemplates.Content
            .replace('{{%ROW%}}', row)
            .replace(/{{%Id%}}/g, values[i]['rowid'])
            .replace('{{%TABLE%}}', currentTable))
        
    }

    return replacedRows.join(' ');
}

/**
 * 
 * @param {Array} replacedRows Raw replaced rows that need more work before displaying on html
 * @returns A refined version of raws
 */
function updateRows(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let values = Object.values(jsonTemplate)

    let updatedRows = []
    for(let i = 0; i < values.length; i++){
        let row = ""
        for(let j = 0; j < columnsName.length; j++){
            let columnName = `${columnsName[j].toLowerCase()}`
            row += `<th>
                <input value="${values[i][columnName]}"
                type="text"
                required
                name="${columnName}">
                </th>`
        }
        updatedRows.push(row)
    }
    return updatedRows.join(' ')
}

function replaceId(rows) {
    let jsonTemplate = JSON.parse(JSON.stringify(rows))
    let replacedRows = jsonTemplate.map(json => {
        let outputRow = htmlTemplates.ConfirmDeletion
            .replace(/{{%Id%}}/g, json.rowid)
            .replace(/{{%TABLE%}}/g, currentTable)

        return outputRow
    })
    return replacedRows.join(' ');
}

export default crud;