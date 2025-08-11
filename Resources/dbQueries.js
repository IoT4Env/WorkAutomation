import Resources from "./resources.js";


const resources = new Resources()

const modelsDb = resources.ModelsDb

export default class PreparationQueries{
    getTables = _ =>{
        let tablesContainer = []
        modelsDb.serialize(_ => {
            const query = `SELECT name FROM sqlite_master WHERE type='table'`
            modelsDb.all(query, (err, tables) =>{
                if(err){
                    console.log(err)
                    return
                }
                tables.forEach(table => 
                    tablesContainer.push(table))
            })
        })
        return tablesContainer
    }
}