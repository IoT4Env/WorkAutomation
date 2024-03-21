import multer from 'multer'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '/Tmp/'))
    },
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}-${Date.now()}`)
    }
  })
  
export default multer({ storage: storage })