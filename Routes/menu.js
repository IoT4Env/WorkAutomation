import express from 'express'
import helmet from 'helmet';

import Resources from '../Resources/resources.js'

const resources = new Resources()

const menu = express()
menu.use(helmet())

const returnBack = resources.ReturnBackButton


menu.get('/settings', (req,res) =>{
    menu.use(express.static('public/Menu'))
    res.status(200).send(returnBack + resources.HtmlTemplates.Menu.Settings) 
    return
})

export default menu