// Author : Emanuel Setio Dewo, 24/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';
import conf from '../config.js';
import fs from 'fs';

// middleware validasi token
router.use(validate_token);

router.get('/', async(req, res) => {
    const [r, f] = await db.query(`select p.*, t.name as typeName
        from printer p
        left outer join printer_type t on t.id = p.printerType
        where p.cafeId = ? order by p.name`,
        [req.headers.cafe]
    );
    res.send(r);
});

router.get('/type', async(req, res) => {
    const [r, f] = await db.query(`select * from printer_type order by id`);
    res.send(r);
});

router.get('/satu/:type', async(req, res) => {
    const [r, f] = await db.query(`select *
        from printer
        where cafeId = ? and printerType = ? and active = 1 
        order by id
        limit 1`,
        [ req.headers.cafe, req.params.type ]);
    res.send(r[0]);
})

router.get('/edit/:id', async(req, res) => {
    const [r, f] = await db.query(`select p.*, t.name as typeName, 0 as md
        from printer p
        left outer join printer_type t on t.id = p.printerType
        where p.cafeId = ? and p.id = ?`,
        [ req.headers.cafe, req.params.id ]);
    res.send(r[0]);
})

router.post('/save', async(req, res) => {
    if (req.body.md == 0) {
        // edit
        const [r, f] = await db.query(`update printer
            set name = ?,
            printerType = ?,
            url = ?,
            token = ?,
            active = ?
            where id = ? and cafeId = ?`, [
                req.body.name,
                req.body.printerType,
                req.body.url,
                req.body.token,
                req.body.active,
                req.body.id,
                req.headers.cafe
            ]);
        res.send({ ok: r.affectedRows, message: r.info });
    } else {
        // insert
        const [r, f] = await db.query(`insert into printer
            set name = ?,
            cafeId = ?,
            printerType = ?,
            url = ?,
            token = ?,
            active = ?,
            createdBy = ?,
            createdAt = now()`, [
                req.body.name,
                req.headers.cafe,
                req.body.printerType,
                req.body.url,
                req.body.token,
                req.body.active,
                req.headers.id
            ]);
        res.send({ ok: r.affectedRows, message: r.info });
    }
})

export default router;