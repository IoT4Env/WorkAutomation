import decompress from "decompress";
import path from 'path'
import fs from 'fs'

import Resources from './Resources/resources.js'

const resources = new Resources();

export default class InitialData {
    getInitialData = (odsFile) => decompress(odsFile, {
        filter: file => path.basename(file.path) === 'content.xml'
    }).then(files => {
        /**
         * file-like representation of the actual file
         */
        const xmlData = files[0].data.toString().split('><').join('>\n<').split('\n')
        const csvData = xmlToCsv(xmlData)
        const sqlQuery = csvToSql(csvData)

        fs.writeFileSync(path.join(resources.__dirname, '/SqlQueries/insertByJs.sql'), sqlQuery)

    }).catch(error => {
        throw error
    });
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
            if (!validChars(cellContent, ['&apos;', '&quot;', '`', '\\', '/'])) {//check only those chars to avoid weird api paths
                //if the cell has chars '", they are interpreted as "&apos;" and "&quot;"
                //backtich is fine as it is
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
        throw "Invalid chars inside one or more cells of the ODS"
    }

    return fullOdsContent
}

/**
 * 
 * @param {string} csv A semicolon separated value string
 * @returns An sql query to execute on the database
 */
function csvToSql(csv) {
    let sqlValues = []
    for (let i = 1; i < csv.length; i++) {
        sqlValues.push(`(${csv[i].replace(/;/g, ',')})`)
    }
    return `INSERT INTO Models (${csv[0]
        .replace(/;/g, ',')
        .replace(/"/g, '')}) VALUES \n${sqlValues.join(',\n')};`
}

function validChars(str, chars){
    for(let i = 0; i <= chars.length - 1; i++){
        if(str.includes(chars[i])){
            return false
        }
    }
    return true
}