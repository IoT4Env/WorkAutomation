import express from 'express'
import storage from '../Resources/storage.js'
import fs from 'fs'

const fileUpload = express();


fileUpload.post('/sql', storage.single('uploaded-file'), (req,res) =>{
    const filePath = req.file.path
    const query = fs.readFileSync(filePath, 'utf-8')
    console.log(query);

    fs.rmSync(filePath);
    res.status(201).send('Data inserted successfully')
    return;
})

export default fileUpload;