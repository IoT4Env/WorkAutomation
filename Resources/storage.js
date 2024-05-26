import multer from 'multer'
import path from 'path';
import fs from 'fs'

import Resources from './resources.js'

const resources = new Resources();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tmp = path.join(resources.__dirname, '/Tmp/')
    fs.opendir(tmp, (err) => {
      if (err) {
        fs.mkdirSync(tmp)
      }
      cb(null, tmp)
    })
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}`)
  }
})

export default multer({ storage: storage })