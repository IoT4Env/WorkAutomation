import multer from 'multer'
import path from 'path';
import fs from 'fs'

import Resources from './resources.js'

const resources = new Resources();

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const tmp = path.join(resources.__dirname, '/Tmp/')
    const dir = await fs.promises.opendir(tmp).catch(err =>{
      fs.mkdirSync(tmp)
    })

    cb(null, tmp)
    dir.close()
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}-${Date.now()}`)
  }
})

export default multer({ storage: storage })