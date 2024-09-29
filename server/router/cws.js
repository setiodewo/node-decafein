// Author: Emanuel Setio Dewo, 29/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';
import conf from '../config.js';

// middleware validasi token
router.use(validate_token);

router.get('/all', async(req, res) => {
    try {
        const [r, f] = await db.query(`select * 
            from space
            where cafeId = ? and floor = ? and active = 1
            order by rowNum, colNum`,
            [ req.headers.cafe, req.headers.floor ]);
        let _row = 0;
        const [rw, fw] = await db.query(`select max(rowNum + rowSize -1) as MR
            from space
            where cafeId = ? and floor = ? and active = 1`,
            [ req.headers.cafe, req.headers.floor ]);
        if (rw.length > 0) _row = rw[0].MR;
        res.send({row: _row, data: r});
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/edit/:id', async(req, res) => {
    try {
        const [r, f] = await db.query(`select *, 0 as md
            from space
            where cafeId = ? and id = ?`,
            [ req.headers.cafe, req.params.id ]);
        res.send(r[0]);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/save', async(req, res) => {
    // TODO: CEK BENTROK!!!
    if (req.body.md == 0) {
        // edit
        const [r, f] = await db.query(`update space
            set name = ?,
            floor = ?,
            rowNum = ?,
            colNum = ?,
            rowSize = ?,
            colSize = ?,
            leftright = ?,
            capacity = ?,
            description = ?,
            facility = ?,
            priceHourly = ?,
            priceDaily = ?,
            priceMonthly = ?,
            priceAnnually = ?,
            active = ?
            where cafeId = ? and id = ?`,
        [
            req.body.name,
            req.body.floor,
            req.body.rowNum,
            req.body.colNum,
            req.body.rowSize,
            req.body.colSize,
            req.body.leftright,
            req.body.capacity,
            req.body.description,
            req.body.facility,
            req.body.priceHourly,
            req.body.priceDaily,
            req.body.priceMonthly,
            req.body.priceAnnually,
            req.body.active,
            req.headers.cafe, req.body.id 
        ]);
        res.send({ ok: r.affectedRows, message: r.info });
    } else {
        // tambah
        const [r, f] = await db.query(`insert into space
            set name = ?,
            cafeId = ?,
            floor = ?,
            rowNum = ?,
            colNum = ?,
            rowSize = ?,
            colSize = ?,
            leftright = ?,
            capacity = ?,
            description = ?,
            facility = ?,
            priceHourly = ?,
            priceDaily = ?,
            priceMonthly = ?,
            priceAnnually = ?,
            createdBy = ?,
            createdAt = now(),
            active = ?`, 
        [
            req.body.name,
            req.headers.cafe,
            req.body.floor,
            req.body.rowNum,
            req.body.colNum,
            req.body.rowSize,
            req.body.colSize,
            req.body.leftright,
            req.body.capacity,
            req.body.description,
            req.body.facility,
            req.body.priceHourly,
            req.body.priceDaily,
            req.body.priceMonthly,
            req.body.priceAnnually,
            req.headers.id,
            req.body.active
        ]);
        res.send({ ok: r.affectedRows, message: r.info });
    }
})

export default router;