// Author : Emanuel Setio Dewo, 07/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';

// middleware validasi token
router.use(validate_token);

router.get('/', async(req, res) => {
    try {
        var kategori = (req.headers.kategori == null || req.headers.kategori == '')? '' : `and m.categoryId='${req.headers.kategori}'`;
        const [r, f] = await db.query(`select m.*, mc.name as categoryName
            from menu m
            left outer join menu_category mc on mc.id = m.categoryId
            where m.cafeId=? ${kategori}
            order by m.name`,
            [req.headers.cafe]);
        res.send({
            "ok": r.length,
            "data": r
        });
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.get('/kategori', async(req, res) => {
    try {
        const [r, f] = await db.query(`select id, name from menu_category where cafeId=? order by name`,
            [req.headers.cafe]);
        res.send(r);
    } catch(err) {
        res.status(500).send(err.message);
    }
})

export default router;