const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { validateToken } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

router.post('/upload', validateToken, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.status(400).json(err);
        }
        else if (req.file == undefined) {
            res.status(400).json({ message: "No file uploaded" });
        }
        else {
            res.json({ filename: req.file.filename });
        }
    })
});

router.delete('/upload/:filename', validateToken, (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '..', 'public', 'uploads', filename);

    fs.unlink(filePath, (error) => {
        if (error && error.code !== 'ENOENT') {
            return res.status(500).json({ message: 'Certificate could not be deleted.' });
        }
        return res.json({ message: 'Certificate deleted successfully.' });
    });
});

module.exports = router;