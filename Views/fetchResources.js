import express from 'express'

import Resources from '../Resources/resources.js'


const resources = new Resources();

const frontBack = express()

frontBack.get('/columns', (req,res) =>{
    res.status(200).send(resources.ColumnsName);
    return
})

export default frontBack;
