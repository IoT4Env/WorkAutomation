import SQLite3 from 'sqlite3';
import { readFileSync } from 'fs'
import path, { join } from 'path'
import { fileURLToPath } from 'url';


export default class Resources {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(this.__filename);

    ModelsDb = new SQLite3.Database(join(this.__dirname, '../Databases/models.db'));

    //DDL = Drop Down List
    HtmlTemplates = {
        Index: readFileSync(join(this.__dirname, '../public/MainPage/index.html'), 'utf-8'),
        Content: readFileSync(join(this.__dirname, '../public/ContentBody.html'), 'utf-8'),
        Get: readFileSync(join(this.__dirname, '../public/GETS/gets.html'), 'utf-8'),
        Post: readFileSync(join(this.__dirname, '../public/POST/post.html'), 'utf-8'),
        Update: readFileSync(join(this.__dirname, '../public/UPDATE/update.html'), 'utf-8'),
        UpdateRes: readFileSync(join(this.__dirname,'../public/UPDATE/updateRes.html'), 'utf-8'),
        Delete: readFileSync(join(this.__dirname, '../public/DELETE/delete.html'), 'utf-8')
    }

    ReturnBackButton = `<button><a href="/">BACK</a></button>`

    //Names as params, so must be capitalized
    ColumnsName = [
        "Name",
        "Surname",
        "Address",
        "Mail"
    ]

    SqlQueries = {
        GetByField: (field) =>{
            return `SELECT ROWID, ${field} FROM Models`
        }
    }
}
