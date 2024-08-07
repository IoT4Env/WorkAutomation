import { readFileSync, writeFileSync } from 'fs'
import path, { join } from 'path'
import { fileURLToPath } from 'url';


export default class Resources {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(this.__filename);

    PublicPaths = {
        Index: join(this.__dirname,'../public/MainPage/index.html'),
        HamburgerMenu:join(this.__dirname,'../public/HamburgerMenu/hamburgerMenu.html'),
        Menu:{
            Settings:join(this.__dirname,'../public/Menu/Settings/settings.html')
        },
        Content:join(this.__dirname,'../public/CttBody/ContentBody.html'),
        ConfirmDeletion:join(this.__dirname,'../public/ConfirmDeletion/ConfirmDeletion.html'),
        Get:join(this.__dirname,'../public/GETS/gets.html'),
        Post:join(this.__dirname,'../public/POST/post.html'),
        Update:join(this.__dirname,'../public/UPDATE/update.html'),
        UpdateRes:join(this.__dirname,'../public/UPDATE/updateRes.html'),
        Delete:join(this.__dirname,'../public/DELETE/delete.html'),
    }
    //DDL = Drop Down List
    HtmlTemplates = {
        Index: readFileSync(join(this.PublicPaths.Index), 'utf-8'),
        HamburgerMenu: readFileSync(join(this.PublicPaths.HamburgerMenu), 'utf-8'),
        Menu:{
            Settings: readFileSync(join(this.PublicPaths.Menu.Settings), 'utf-8'),
        },
        Content: readFileSync(join(this.PublicPaths.Content), 'utf-8'),
        ConfirmDeletion: readFileSync(join(this.PublicPaths.ConfirmDeletion), 'utf-8'),
        Get: readFileSync(join(this.PublicPaths.Get), 'utf-8'),
        Post: readFileSync(join(this.PublicPaths.Post), 'utf-8'),
        Update: readFileSync(join(this.PublicPaths.Update), 'utf-8'),
        UpdateRes: readFileSync(join(this.PublicPaths.UpdateRes), 'utf-8'),
        Delete: readFileSync(join(this.PublicPaths.Delete), 'utf-8')
    }

    MenuConfigPath = join(this.__dirname, 'menuConfig.json')
    MenuConfigCtt = JSON.parse(readFileSync(this.MenuConfigPath, 'utf-8'))
    
    ReturnBackButton = `<button><a href="/">BACK</a></button>`

    SqlQueries = {
        GetByField: (field, table) =>{
            return `SELECT ROWID, ${field} FROM ${table}`
        }
    }

    UpdateMenuConfig = (data) => {
        writeFileSync(this.MenuConfigPath, JSON.stringify(data))
    }
}
