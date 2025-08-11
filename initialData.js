import decompress from "decompress";
import path from 'path'
import fs from 'fs'

import Resources from './Resources/resources.js'

const resources = new Resources();

decompress('contentFile.ods', {
    filter: file => path.basename(file.path) === 'content.xml'
}).then(files => {
    /**
     * file-like representation of the actual file
     */
    const xmlData = files[0].data.toString().split('><').join('>\n<').split('\n')
    console.time('xml to csv')
    const csvData = xmlToCsv(xmlData)
    console.timeEnd('xml to csv')
    console.time('csv to sql')
    const sqlQuery = csvToSql(csvData)
    console.timeEnd('csv to sql')
    console.log(csvData);

    //fs.writeFileSync(path.join(resources.__dirname, '/SqlQueries/insert.sql'), sqlQuery)
});

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
    // if this variable exeeds the sum of 2 + 2, a new row is read
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
            if(/[^0-9]/.test(cellContent)){
                cellContent = `"${cellContent}"`
            }
            odsRow.push(cellContent)
            rowDelimitator = 0;
        }

        if (rowDelimitator > 3 && odsRow.length > 0) {
            //new row
            fullOdsContent.push(odsRow.join(';'))
            odsRow = []
            rowDelimitator = 0;
        }
    })
    return fullOdsContent
}

function csvToSql(csv) {
    let sqlQuery = `INSERT INTO Models (${csv[0]
        .replace(/;/g, ',')
        .replace(/"/g, '')}
        ) VALUES %VALUES%;`
    let sqlValues = []
    for (let i = 1; i < csv.length; i++) {
        sqlValues.push(`(${csv[i].replace(/;/g, ',')})`)
    }
    return sqlQuery.replace('%VALUES%', sqlValues.join(',\n'))
}