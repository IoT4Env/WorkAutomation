import Resources from './resources.js'

const resources = new Resources();

const modelsDb = resources.ModelsDb;
class Apis {
    DefineFilters = () => {
        modelsDb.serialize(_ => {
            modelsDb.all('SELECT ROWID, surname FROM Models', (err, rows) => {
                if (err) {
                    const errorObj = {
                        "Code": 1,
                        "Body": err
                    }
                    res.redirect(`/handleError/:${JSON.stringify(errorObj)}`)
                    return;
                }

            })
        })
    }
}

export default Apis