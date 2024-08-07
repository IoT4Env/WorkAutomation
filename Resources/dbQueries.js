import SQLite3 from 'sqlite3';
import path, { join } from 'path'
import { fileURLToPath } from 'url';


export default class DbInfo {
    static __filename = fileURLToPath(import.meta.url);
    static __dirname = path.dirname(this.__filename);

    static ModelsDb = new SQLite3.Database(join(DbInfo.__dirname, '../Databases/models.db'));

    static CurrentTable
    static ColumnNames

    static getTables = async _ => {
        return new Promise(resolve => {
            DbInfo.ModelsDb.serialize(_ => {
                const query = `SELECT name FROM sqlite_master WHERE type='table'`
                DbInfo.ModelsDb.all(query, (err, tables) => {
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

    static getColumnNames = async (tableName) => {
        return new Promise(resolve => {
            DbInfo.ModelsDb.serialize(_ => {
                const query = `PRAGMA table_info(${tableName})`
                DbInfo.ModelsDb.all(query, (err, columns) => {
                    if (err) {
                        console.log(err)
                        return
                    }
                    let columnNames = []

                    

                    columns.forEach(column => {
                        columnNames.push(column.name[0].toUpperCase() + column.name.slice(1))
                    })
                    DbInfo.ColumnNames = columnNames
                    
                    resolve(columnNames)
                })
            })

        })
    }

    static updateTable = tableName =>{
        DbInfo.CurrentTable = tableName
    }

    static getCurrentTable = _ =>{
        return DbInfo.CurrentTable
    }
}