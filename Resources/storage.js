import multer from 'multer'
import path from 'path';

import Resources from './resources.js'

const resources = new Resources();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(resources.__dirname, '/Tmp/'))
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}`)
    }
  })
  
export default multer({ storage: storage })