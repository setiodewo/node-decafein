// Author : Emanuel Setio Dewo, 11/09/2024

const max_row = 10;
import express from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';

// middleware validasi token
router.use(validate_token);

router.get("/type", async(req, res) => {
    try {
        const [r, f] = await db.query('select * from sale_type order by id');
        res.send(r);
    } catch(err) {
        res.status(500).send(err.message);
    }
});

router.get('/new', async(req, res) => {
    try {
        const [r, f] = await db.query(`insert into sale_hdr
            set cafeId = ?,
            saleDate = now(),
            saleType = 1,
            totalAmount = 0,
            totalDiscount = 0,
            totalTax = 0,
            totalPaid = 0,
            statusId = 0,
            createdBy = ?`, [
                req.headers.cafe, req.headers.id
            ]);
        console.log('insert', r);
        var par = {
            'id' : r.insertId,
            'cafeId' : req.headers.cafe,
            'saleDate' : new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            'saleType' : 1,
            'saleTo' : '',
            'phoneNum' : '',
            'tableId' : '',
            'totalAmount' : 0,
            'totalDiscount' : 0,
            'totalTax' : 0,
            'totalPaid' : 0,
            'grandTotal' : 0,
            'statusId' : 0,
            'statusName': 'OPEN',
            'notes' : '',
            'createdBy' : req.headers.id
        }
        res.send({ ok: r.affectedRows, messsage: r.info, data: par });
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/edit/:id', async(req, res) => {
    const [r, f] = await db.query(`select h.id, h.cafeId, date_format(h.saleDate, '%d/%m/%Y %H:%i') as saleDate,
        h.saleType, h.saleTo, h.phoneNum, h.tableId,
        h.totalAmount, h.totalDiscount, h.totalTax, h.totalPaid, h.statusId,
        h.notes, h.createdBy
        from sale_hdr h
        where h.id = ? and h.cafeId = ?`, [
            req.params.id, req.headers.cafe
        ]);
    res.send({ ok: r.length, data: r[0] });
})

router.post('/field', async(req, res) => {
    try {
        const [r, f] = await db.query(`update sale_hdr
            set ${req.body.field} = ?
            where id = ?`,
            [ req.body.value, req.body.id ]);
        res.send({ ok: r.affectedRows, message: r.info });
    } catch(err) {
        res.status(500).send(err);
    }
});

router.get('/', async(req, res) => {
    try {
        //new Date().toISOString().substring(0, 10)
        var whr_tgl = (req.headers.tgl == undefined || req.headers.tgl == '')? 
            '' : `and h.saleDate like '${req.headers.tgl} %' `;
        const [r, f] = await db.query(`select h.*, 
            date_format(h.saleDate, '%H:%i') as tgl,
            t.name as typeName, s.name as statusName
            from sale_hdr h
            left outer join sale_type t on t.id = h.saleType
            left outer join sale_status s on s.id = h.statusId
            where h.cafeId = ? ${whr_tgl}
            order by h.saleDate desc
            limit ${max_row}`, [ req.headers.cafe ]);
        res.send({ ok: r.length, data: r });
    } catch(err) {
        res.status(500).send(err.message);
    }
})

export default router;