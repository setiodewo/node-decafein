// Author : Emanuel Setio Dewo, 09/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';

// middleware validasi token
router.use(validate_token);

router.get('/', async(req, res) => {
    try {
        const [r, f] = await db.query(`select c.*, uc.levelId, ul.name as levelName, u.name as ownerName
            from user_cafe uc
            left outer join user_level ul on ul.id = uc.levelId
            left outer join cafe c on c.id = uc.cafeId
            left outer join user u on u.id = c.ownerId
            where uc.userId = ?`,
            [req.headers.id]);
        res.send({ ok: r.length, data: r });
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.get('/edit/:id', async(req, res) => {
    try {
        const [r, f] = await db.query(`select *, 0 as md from cafe where id = ?`,
            [req.params.id]);
        res.send({ ok: r.length, data: r[0] });
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.post('/simpan', async(req, res) => {
    try {
        if (req.body.md == 0) {
            // Edit
            const [r, f] = await db.query(`update cafe
                set name = ?,
                address = ?,
                city = ?,
                province = ?,
                country = ?,
                zipCode = ?,
                lat = ?,
                lng = ?,
                url = ?,
                phone = ?,
                active = ?
                where id = ?`, [
                    req.body.name,
                    req.body.address,
                    req.body.city,
                    req.body.province,
                    req.body.country,
                    req.body.zipCode,
                    req.body.lat == '' ? '0' : req.body.lat,
                    req.body.lng == '' ? '0' : req.body.lng,
                    req.body.url,
                    req.body.phone,
                    req.body.active,
                    req.body.id
                ]);
            res.send({ ok: r.affectedRows, msg: r.info });
        } else {
            // TODO: INSERT new cafe
            res.send(500).send({ ok: 0, message: 'Belum diimplementasikan!', data: req.body});
        }
    } catch(err) {
        res.status(500).send({ ok: 0, message: err.message });
    };
});

export default router;