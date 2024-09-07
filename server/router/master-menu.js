// Author : Emanuel Setio Dewo, 07/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';

// middleware validasi token
router.use(validate_token);

router.get('/', async(req, res) => {
    try {
        const [r, f] = await db.query(`select * from menu where cafeId=? order by name`,
            [req.headers.cafeId]);
        res.send({
            "ok": r.length,
            "data": r
        });
    } catch(err) {
        res.status(500).send(err.message);
    }
});