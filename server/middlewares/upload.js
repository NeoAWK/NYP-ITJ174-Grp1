const multer = require('multer');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const uploadDirectory = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },
    filename: (req, file, callback) => {
        callback(null, nanoid(10) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 }
}).single('file'); // file input name

module.exports = { upload };
