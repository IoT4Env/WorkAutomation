import decompress from "decompress";
import path from 'path'


decompress('contentFile.ods', {
    filter: file => path.basename(file.path) === 'content.xml'
}).then(files => {
    // convert file read into a file-like format
    const xmlData = files[0].data.toString().split('><').join('>\n<').split('\n')

    let fullOdsContent = []
    let odsRow = []

    // The end of a row in the ods file needs 2 tags to be closed (cell and row)
    // AND 2 tags to be opened (cell and row)
    // if this variable exeeds the sum of 2 + 2, a new row is read
    let customRowDelimitator = 0
    xmlData.forEach(data => {
        customRowDelimitator++;

        // the idea is to find all those tags than contains content
        // eg: <tag_name>some text</tag_name>
        if (data.indexOf('>') != data.length - 1) {
            let cellContent = ''
            let index = data.indexOf('>')
            while (data[++index] != '<') {
                cellContent += data[index]
            }
            odsRow.push(cellContent)
            customRowDelimitator = 0;
        }

        if (customRowDelimitator > 3 && odsRow.length > 0) {
            //new row
            fullOdsContent.push(odsRow)
            odsRow = []
            customRowDelimitator = 0;
        }
    })

    console.log(fullOdsContent)
    // console.log(xmlData);
});
