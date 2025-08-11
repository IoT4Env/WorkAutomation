import express from 'express'
import helmet from 'helmet';

import Resources from '../Resources/resources.js'
import DbInfo from '../Resources/dbQueries.js'


const resources = new Resources();

const modelsDb = DbInfo.ModelsDb
let lastFilter

const frontBack = express()
frontBack.use(helmet())

frontBack.get('/update/:tableName', (req,res) =>{
    res.status(200).send(DbInfo.updateTable(req.params.tableName))
    return
})

frontBack.get('/columns/:tableName', async (req, res) => {
    res.status(200).send(await Promise.resolve(DbInfo.getColumnNames(req.params.tableName)));
    return
})

frontBack.get('/filters/:filter/tables/:table', (req, res) => {
    const selectedFilter = req.params.filter
    const table = req.params.table
    modelsDb.serialize(_ => {
        modelsDb.all(resources.SqlQueries.GetByField(selectedFilter, table), (err, rows) => {
            if (err) {
                console.log(err);
                const errorObj = {
                    "Code": 1,
                    "Body": err
                }
                res.redirect(`/handleError/${JSON.stringify(errorObj)}`)
                return;
            }
            let filters = []
            rows.forEach(json => {
                filters.push(`<option>${json[selectedFilter]}</option>`)
            })
            lastFilter = selectedFilter;

            return res.status(200).send(filters)
        })
    })
})

frontBack.get('/menuConfig', (req, res) => {
    res.status(200).send(resources.MenuConfigCtt)
    return
})

frontBack.post('/menuConfig', (req,res) =>{
    resources.UpdateMenuConfig(req.body)
    res.status(200).end()
    return
})

frontBack.get('/lastFilter', (req, res) => {
    return res.status(200).send(lastFilter)
})

export default frontBack;
