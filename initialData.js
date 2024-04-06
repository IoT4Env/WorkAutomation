import decompress from "decompress";
import path from 'path'
import fs from 'fs'


decompress('contentFile.ods', {
    filter: file => path.basename(file.path) === 'content.xml'
}).then(files => {
    // convert file read into a file-like format
    const xmlData = files[0].data.toString().split('><').join('>\n<').split('\n')
    xmlToCsv(xmlData)
});

function xmlToCsv(xml){
    let fullOdsContent = []
    let odsRow = []

    // The end of a row in the ods file needs 2 tags to be closed (cell and row)
    // AND 2 tags to be opened (cell and row)
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

function csvToSql(csv){

}