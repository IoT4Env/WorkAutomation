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
        DDL: readFileSync(join(this.__dirname, '../public/MainPage/Index.html'), 'utf-8'),
        Content: readFileSync(join(this.__dirname, '../public/ContentBody.html'), 'utf-8'),
        Get: readFileSync(join(this.__dirname, '../public/GETS/GETS.html'), 'utf-8'),
        Post: readFileSync(join(this.__dirname, '../public/POST/POST.html'), 'utf-8'),
        Update: readFileSync(join(this.__dirname, '../public/UPDATE/UPDATE.html'), 'utf-8'),
        Delete: readFileSync(join(this.__dirname, '../public/DELETE/DELETE.html'), 'utf-8')
    }
    ReturnBackButton = `<button><a href="/">BACK</a></button>`

    //Names as params, so must be capitalized
    ColumnsName = [
        "Name",
        "Surname",
        "Address",
        "Mail"
    ]
}
