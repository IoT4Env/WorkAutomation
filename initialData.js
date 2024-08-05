import decompress from "decompress";
import path from 'path'
import fs from 'fs'

import Config from './Resources/config.js'
import Resources from './Resources/resources.js'


const config = new Config()
const resources = new Resources();
let fileName

export default class InitialData{
    getInitialData = (odsFile) => decompress(odsFile, {
        filter: file => path.basename(file.path) === 'content.xml'
    }).then(async files => {
        fileName = getOdsFileName(odsFile)
        /**
         * file-like representation of the actual file
         */
        const xmlData = files[0].data.toString().split('><').join('>\n<').split('\n')
        const csvData = xmlToCsv(xmlData)
        const sqlInsertSql = csvToInsertSql(csvData)
        const csvCreateTableSql = csvToCreateTableSql(csvData)

        //write to the same file the necessary queries
        fs.writeFileSync(path.join(resources.__dirname, `/SqlQueries/${fileName}.sql`), csvCreateTableSql, 'utf-8')
        await fetch(`${config.URL}/queries/createTable/${fileName}`,{
            method: 'POST'
        })
        
        fs.writeFileSync(path.join(resources.__dirname, `/SqlQueries/${fileName}.sql`), sqlInsertSql, 'utf-8')
        await fetch(`${config.URL}/queries/insert/${fileName}`,{
            method: 'POST'
        })
    }).catch(err => {
        throw err
    }).finally(_=>{
        //delete file at the end of the n operations
        fs.rmSync(path.join(resources.__dirname, `/SqlQueries/${fileName}.sql`))
    })
}

function getOdsFileName(odsFileName){
    const splittedPath = odsFileName.split('/')
    return splittedPath[splittedPath.length - 1].split('.')[0]//fileName
}

/**
 * 
 * @param {string} xml A string representing the xml to extract the content from
 * @returns An sql insert string
 */
function xmlToCsv(xml) {
    let fullOdsContent = []
    let odsRow = []

    // The end of a row in the ods file needs corresponds to 2 xml tags to be closed (cell and row)
    // AND 2 xml tags to be opened (cell and row)
    let rowDelimitator = 0
    xml.forEach(data => {
        let index = data.indexOf('>')

        rowDelimitator++;

        // the idea is to find all those tags than contains content
        // eg: <tag_name>some text</tag_name>
        if (index != data.length - 1) {
            let cellContent = ''
            while (data[++index] != '<') {
                cellContent += data[index]
            }
            if (/[^0-9]/.test(cellContent)) {
                cellContent = `"${cellContent}"`
            }
            odsRow.push(cellContent.toLowerCase())
            rowDelimitator = 0;
        }

        // if this variable exeeds the sum of 2 + 2, a new row is read
        if (rowDelimitator > 3 && odsRow.length > 0) {
            fullOdsContent.push(odsRow.join(';'))
            odsRow = []
            rowDelimitator = 0;
        }
    })
    return fullOdsContent
}

function csvToCreateTableSql(csv){
    let columnNames = csv[0].replace(/"/g, '').split(';')
    let createTableSql = []
    for(let i = 0; i < columnNames.length; i++){
        //for the sake of simplicity, we treat all columns as strings
        createTableSql.push(`${columnNames[i]} VARCHAR(50) NOT NULL`)
    }
    return `CREATE TABLE IF NOT EXISTS ${fileName} (${createTableSql.join(',')});`
}

/**
 * 
 * @param {string} csv A semicolon separated value string
 * @returns An sql query to execute on the database
 */
function csvToInsertSql(csv) {
    let sqlValues = []
    for (let i = 1; i < csv.length; i++) {
        sqlValues.push(`(${csv[i].replace(/;/g, ',')})`)
    }

    //the OS guarantees no special chars inside the file name
    return `INSERT INTO ${fileName} (${csv[0]
        .replace(/;/g, ',')
        .replace(/"/g, '')}) VALUES \n${sqlValues.join(',\n')};`
}