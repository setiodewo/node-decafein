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
});

router.get('/edit/:id', async(req, res) => {
    try {
        const [r, f] = await db.query(`select *, 0 as md from menu where id = ? and cafeId = ?`, 
            [req.params.id, req.headers.cafe]);
        res.send(r[0]);
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.post('/simpan', async(req, res) => {
    if (req.body.md == 0) {
        // Edit
        const [r, f] = await db.query(`update menu
            set name = ?,
            categoryId = ?,
            description = ?,
            currency = ?,
            basePrice = ?,
            COGS = ?,
            active = ?
            where id = ?`, [
                req.body.name,
                req.body.categoryId,
                req.body.description,
                req.body.currency,
                req.body.basePrice,
                req.body.COGS,
                req.body.active,
                req.body.id
            ]);
        res.send({ok: r.affectedRows, message: r.info});
    } else {
        // Insert
        const [r, f] = await db.query(`insert into menu
            set name = ?,
            cafeId = ?,
            categoryId = ?,
            description = ?,
            currency = ?,
            basePrice = ?,
            COGS = ?,
            active = ?,
            createdBy = ?,
            createdAt = now()`, [
                req.body.name,
                req.headers.cafe,
                req.body.categoryId,
                req.body.description,
                req.body.currency,
                req.body.basePrice,
                req.body.COGS,
                req.body.active,
                req.headers.id
            ]);
        console.log('result', r);
        res.send({ok: 1, message: r.info});
    }
})

export default router;