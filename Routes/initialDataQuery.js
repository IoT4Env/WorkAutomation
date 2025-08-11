import express from 'express'
import path from 'path'
import fs from 'fs'

import Resources from '../Resources/resources.js'
import DbInfo from '../Resources/dbQueries.js'


const resources = new Resources()
const dbInfo = new DbInfo()

const modelsDb = dbInfo.ModelsDb;

const queries = express()

queries.post('/createTable/:tableName', (req, res) => {
    const tableName = req.params.tableName
    const createTableQuery = fs.readFileSync(path.join(resources.__dirname, `/SqlQueries/${tableName}.sql`), 'utf-8')
    modelsDb.serialize(_=>{
        modelsDb.run(createTableQuery, (err) =>{
            if(err){
                //handle error
                console.log(err)
                return
            }
            res.status(200).end()
            return
        })
    })
})

queries.post('/insert/:tableName', (req, res) => {
    const tableName = req.params.tableName
    const insertQuery = fs.readFileSync(path.join(resources.__dirname, `/SqlQueries/${tableName}.sql`), 'utf-8')
    modelsDb.serialize(_=>{
        modelsDb.run(insertQuery, (err) =>{
            if(err){
                //handle error
                console.log(err)
                return
            }
            res.status(200).end()
            return
        })
    })
})

export default queries