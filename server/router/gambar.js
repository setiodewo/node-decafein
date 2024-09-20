// Author : Emanuel Setio Dewo, 20/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';
import conf from '../config.js';
import fs from 'fs';
import formidable from 'formidable';

router.post('/upload/:id', async(req, res) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        let baru = `${conf.upload_folder}/${req.params.id}`;
        let raw = fs.readFileSync(files.filenya[0].filepath);

        fs.writeFile(baru, raw, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Gagal mengupload');
            } else {
                res.status(200).send('Berhasil');
            }
        })
    })
});


export default router;