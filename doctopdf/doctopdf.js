const express = require('express');
const path = require('path');
const multer = require('multer');
const { diskStorage } = require('multer');
const fs = require('fs');
const libre = require('libreoffice-convert');
const promisify = require('util.promisify');
const lib_convert = promisify(libre.convert)

const router = express.Router();

// handling file upload
const storage = diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync('./uploads', { recursive: true });
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        let ext = file.originalname.split('.');
        cb(null, `${file.fieldname}-${ext[0]}-${Date.now()}.${ext[1]}`);
    },
});


const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.doc' && ext !== '.docx') {
            return cb(JSON.stringify({ code: 400, err: true, msg: 'Files with extension doc or docx are allowed' }))
        }
        cb(null, true);
    }
});

// doc-to-pdf endpoint
router.post('/doc-to-pdf', upload.single('file'), async (req, res) => {
    try {
        const pdfConvert = await convert(req.file);
        if (pdfConvert.success) {
            res.download(`./uploads/${pdfConvert.fileName}`);
        } else {
            return res.status(400).json({ code: 400, err: true, msg: `${pdfConvert.error}` });
        }
    } catch (error) {
        res.status(400).json({ code: 400, err:true, msg: error });
    }
});


// libre converter 
async function convert(file) {
    try {
        const FilePath = path.join(__dirname, `../uploads/${file.filename}`);
        const outputPath = path.join(__dirname, `../uploads/${file.filename.split('.').shift()}.pdf`);

        // Read file     
        let data = await fs.readFileSync(FilePath)
        let done = await lib_convert(data, '.pdf', undefined)
        await fs.writeFileSync(outputPath, done)
        return { success: true, fileName: `${file.filename.split('.').shift()}.pdf` };
    }
    catch (err) {
        return { success: false, error: err }
    }
}


module.exports = router;