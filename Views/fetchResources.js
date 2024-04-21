import express from 'express'

import Resources from '../Resources/resources.js'
import Apis from '../Resources/apis.js'

const resources = new Resources();
const apis = new Apis();

const modelsDb = resources.ModelsDb

const frontBack = express()

frontBack.get('/columns', (req,res) =>{
    res.status(200).send(resources.ColumnsName);
    return
})

frontBack.get('/filters/:filter', (req,res) =>{
    const selectedFilter = req.params.filter
    modelsDb.serialize(_ => {
        modelsDb.all(`SELECT ROWID, ${selectedFilter} FROM Models`, (err, rows) => {
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
            rows.map(json => {
                if (!filters.includes(`<option>${json[selectedFilter]}</option>`))
                    filters.push(`<option>${json[selectedFilter]}</option>`)
            })

            return res.status(200).send(filters)
        })
    })
})

export default frontBack;
