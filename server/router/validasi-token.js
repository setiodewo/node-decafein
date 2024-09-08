// Author : Emanuel Setio Dewo, 07/09/2024

import db from "../db.js";

async function validate_token(req, res, next) {
    const [r, f] = await db.query('select id from user where id=? and token=? and active=1 limit 1',
        [req.headers.id, req.headers.token]);
    if (r.length == 0) {
        res.status(401).json({});
    } else {
        next();
    }
}

export default validate_token;