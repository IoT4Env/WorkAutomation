import decompress from "decompress";
import path from 'path'
import fs from 'fs'

import Config from './Resources/config.js'
import Resources from './Resources/resources.js'


const config = new Config()
const resources = new Resources();
let fileName

export default class InitialData {
    getInitialData = (odsFile) => decompress(odsFile, {
        filter: file => path.basename(file.path) === 'content.xml'
    }).then(async files => {
        fileName = getOdsFileName(odsFile)
        /**
         * file-like representation of the actual file
         */
        const logFolder = path.join(resources.__dirname, '../DefenceLog/')
        if (!fs.existsSync(logFolder))
            fs.mkdirSync(logFolder)

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
    let exceptions = []
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

            //verify that the cell does not contain special chars for potential sql injections
            if (!validChars(cellContent, ['&apos;', '&quot;', '`', '\\', '/', '\u2018'])) {//check only those chars to avoid weird api paths
                //if the cell has chars '", they are interpreted as "&apos;" and "&quot;"
                //backtich is fine as it is
                //single quote surrounded by spaces is interpreted as the uni code U+2018 (NOT a single quote).
                exceptions.push(cellContent)//wrong cellContents should go in a log file...
                return;
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

    if (exceptions.length !== 0) {
        //write cells inside a log file
        const date = new Date()
        let logAttackInfo = `registered attack(s) at ${date.toLocaleDateString()} ${date.toLocaleTimeString()}:\n${exceptions.join('\n')}\n`
        fs.appendFileSync(path.join(resources.__dirname, '../DefenceLog/defendedAttack.log'), logAttackInfo)
        throw "Invalid chars inside one or more cells of the ODS"
    }

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

function validChars(str, chars) {
    for (let i = 0; i <= chars.length - 1; i++) {
        if (str.includes(chars[i])) {
            return false
        }
    }
    return true
}