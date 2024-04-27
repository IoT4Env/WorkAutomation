import express from 'express'

import Resources from '../Resources/resources.js'

const resources = new Resources();

const modelsDb = resources.ModelsDb
let lastFilter

const frontBack = express()

frontBack.get('/columns', (req,res) =>{
    res.status(200).send(resources.ColumnsName);
    return
})

frontBack.get('/filters/:filter', (req,res) =>{
    const selectedFilter = req.params.filter
    modelsDb.serialize(_ => {
        modelsDb.all(resources.SqlQueries.GetByField(selectedFilter), (err, rows) => {
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
            console.trace(lastFilter);

            return res.status(200).send(filters)
        })
    })
})

frontBack.get('/lastFilter', (req,res) =>{
    return res.status(200).send(lastFilter)
})

export default frontBack;
