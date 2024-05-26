import express from 'express'
import helmet from 'helmet';

const menu = express()
menu.use(helmet())

menu.get('/settings', (req,res) =>{
    res.send('settings page')
    return
})

export default menu