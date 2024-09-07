// Author : Emanuel Setio Dewo, 07/09/2024

import express from "express";
const router = express.Router();
import db from "../db.js";
import crypto from "crypto";

router.get("/", (req, res) => {
    res.redirect("login.html");
});

router.post("/", async(req, res) => {
    try {
        const [result, fields] = await db.query('select * from user where email=? and pwd=MD5(?) limit 1',
            [req.body.em, req.body.pwd]);
        if (result.length == 0) {
            console.log("Gagal login");
            res.send({
                "ok": 0,
                "message": "Gagal login. Masukkan username & password yang benar!"
            });
        } else {
            // TODO: Cek table cafe
            const [cafe, flds] = await db.query(`select uc.id, uc.userId, uc.cafeId,
                c.name
                from user_cafe uc
                where uc.userId = ? and uc.cafeId = ?`,
                [result[0].id, req.body.kode]);
            if (cafe.length == 0) {
                res.status(200).send({
                    "ok": 0,
                    "message" : "Akun valid, tetapi cafe tidak valid!"
                });
            } else {
                // Token
                const token = crypto.randomBytes(64).toString("hex");
                await db.query("update user set token=? where id=?", 
                    [token, result[0].id]
                );
                // Tulis log
                /*
                await db.query("insert into user_log set userId=?, token=?, timestamp=now()",
                    [result[0].id, token]
                );
                */
                console.log("Login berhasil");
                result[0].token = token;
                res.status(200).send({
                    "ok": 1,
                    "profile" : result[0],
                    "message": "success"
                });
            }
        }
    } catch(err) {
        throw err;
    }
});

export default router;