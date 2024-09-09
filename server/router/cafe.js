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

export default router;