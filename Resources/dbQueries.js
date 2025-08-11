import SQLite3 from 'sqlite3';
import path, { join } from 'path'
import { fileURLToPath } from 'url';


export default class DbInfo {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(this.__filename);

    ModelsDb = new SQLite3.Database(join(this.__dirname, '../Databases/models.db'));

    PreviusTable

    getTables = async _ => {
        return new Promise(resolve => {
            this.ModelsDb.serialize(_ => {
                const query = `SELECT name FROM sqlite_master WHERE type='table'`
                this.ModelsDb.all(query, (err, tables) => {
                    if (err) {
                        console.log(err)
                        return
                    }

                    let tablesContainer = []
                    tables.forEach(table =>
                        tablesContainer.push(table))
                    resolve(tablesContainer)
                })
            })
        })
    }

    getColumnNames = async (tableName) => {
        return new Promise(resolve => {
            this.ModelsDb.serialize(_ => {
                const query = `PRAGMA table_info(${tableName})`
                this.ModelsDb.all(query, (err, columns) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    let columnNames = []

                    this.PreviusTable = tableName
                    columns.forEach(column => {
                        columnNames.push(column.name[0].toUpperCase() + column.name.slice(1))
                    })
                    
                    resolve(columnNames)
                })
            })

        })
    }

    //ColumnNames = this.getColumnNames(this.PreviusTable)
}