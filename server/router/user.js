// Author : Emanuel Setio Dewo, 09/09/2024

import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';

// middleware validasi token
router.use(validate_token);

router.get('/', async(req, res) => {
    try {
        const [r, f] = await db.query(`select u.*, uc.cafeId, uc.levelId, ul.name as levelName
            from user_cafe uc
            left outer join user_level ul on ul.id = uc.levelId
            left outer join user u on u.id = uc.userId
            where uc.cafeId = ? 
            order by u.userName`, 
            [req.headers.cafe]);
        res.send({ ok: r.length, data: r });
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.get('/level', async(req, res) => {
    try {
        const [r, f] = await db.query(`select id, name from user_level order by id`);
        res.send(r);
    } catch(err) {
        res.status(500).send(err.message);
    }
});

export default router;