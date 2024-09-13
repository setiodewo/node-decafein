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

router.get("/paymenttype", async(req, res) => {
    const [r, f] = await db.query(`select * 
        from payment_type 
        where cafeId = ?
        order by id`, [req.headers.cafe]);
    res.send(r);
})

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
        h.totalAmount,
        format(h.totalAmount, 0) as _totalAmount,
        h.totalDiscount,
        format(h.totalDiscount, 0) as _totalDiscount,
        h.totalAmount - h.totalDiscount as grandTotal,
        format(h.totalAmount - h.totalDiscount, 0) as _grandTotal,
        h.totalTax, 
        format(h.totalTax, 0) as _totalTax,
        h.totalPaid, h.statusId, s.name as statusName,
        h.notes, h.createdBy
        from sale_hdr h
        left outer join sale_status s on s.id = h.statusId
        where h.id = ? and h.cafeId = ?`, [
            req.params.id, req.headers.cafe
        ]);
    res.send({ ok: r.length, data: r[0] });
});

router .get('/daftaritem/:saleId', async(req, res) => {
    const [r, f] = await db.query(`select si.*, m.name
        from sale_item si
        left outer join menu m on m.id = si.itemId
        where si.saleId = ?`, [req.params.saleId]);
    res.send({ ok: r.length, data: r, message: r.info });
});

router.post('/additem/:saleId', async(req, res) => {
    var amountDiscount = 0;
    if (req.body.discount > 0) {
        amountDiscount = req.body.quantity * req.body.basePrice * req.body.discount / 100;
    }
    try {
        const [r, f] = await db.query(`insert into sale_item
            set saleId = ?,
            itemId = ?,
            categoryId = ?,
            currency = ?,
            basePrice = ?,
            COGS = ?,
            quantity = ?,
            discount = ?,
            amountDiscount = ?,
            tax = ?,
            amountTax = ?,
            notes = ?,
            statusId = 0,
            createdBy = ?,
            createdAt = now()`, [
                req.params.saleId,
                req.body.itemId,
                req.body.categoryId,
                req.body.currency,
                req.body.basePrice,
                req.body.COGS,
                req.body.quantity,
                req.body.discount,
                amountDiscount,
                0,
                0,
                req.body.notes,
                req.headers.id
            ]);
        // TODO: hitung total
        res.send({ ok: r.affectedRows, id: r.insertId, message: r.info });
    } catch(err) {
        res.status(500).send(err);;
    };
});

router.get('/recalculate/:saleId', async(req, res) => {
    try {
        const [r, f] = await db.query(`select sum(quantity * basePrice) as totalAmount,
            sum(quantity * (basePrice * discount / 100)) as totalDiscount,
            sum(amountTax) as totalTax
            from sale_item
            where saleId = ?`, [ req.params.saleId ]);
        if (r.length > 0) {
            // tuliskan
            const [r1, f1] = await db.query(`update sale_hdr
                set totalAmount = ?,
                totalDiscount = ?
                where id = ?`, [ r[0].totalAmount, Number(r[0].totalDiscount).toFixed(2), req.params.saleId ]);
            res.send({ ok : r[0].length, data: { 
                totalAmount: r[0].totalAmount, 
                totalDiscount: r[0].totalDiscount,
                totalTax: r[0].totalTax,
                grandTotal: r[0].totalAmount - r[0].totalDiscount,
                message: 'recalculate'
            } });
        } else {
            res.send({ ok: 1, data: { totalAmount: 0, totalDiscount: 0, grandTotal: 0 }});
        }
    } catch(err) {
        res.status(500).send({ok: 0, message: err, data: { totalAmout: 0, totalDiscount: 0, grandTotal : 0 }});
    };
});

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

router.post('/delitem', async(req, res) => {
    try {
        const [r, f] = await db.query(`delete from sale_item where id = ?`, [ req.body.trxId ]);
        res.send({ ok: r.affectedRows, message: r.info });
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/delhdr', async(req, res) => {
    try {
        // TODO: Perlu diperkuat dengan pengecekan statusId terlebih dahulu
        const [r, f] = await db.query(`update sale_hdr
            set statusId = -1
            where id = ?`, [ req.body.id ]);
        res.send({ ok: r.affectedRows, message: r.info });
    } catch(err) {
        res.status(500).send(err);
    }
})

router.post('/pay', async(req, res) => {
    try {
        const [r, f] = await db.query(`insert into sale_payment 
            set saleId = ?,
            cafeId = ?,
            paymentType = ?,
            grandTotal = ?,
            paymentCharge = ?,
            payAmount = ?,
            payChange = ?,
            notes = ?,
            createdBy = ?,
            createdAt = now()`, [
                req.body.id,
                req.headers.cafe,
                req.body.paymentType,
                req.body.grandTotal,
                req.body.payCharge,
                req.body.payAmount,
                req.body.payChange,
                req.body.notes,
                req.params.id
            ]);
        if (r.affectedRows > 0) {
            const [r_hdr, f_hdr] = await db.query(`update sale_hdr
                set totalPaid = ?, statusId = 1
                where id = ?`, [
                    Number(req.body.grandTotal) + Number(req.body.payCharge),
                    req.body.id
                ]);
        }
        res.send({ ok: r.affectedRows, message: r.info });
    } catch(err) {
        res.send({ ok: 0, message: err });
    }
});

router.get('/', async(req, res) => {
    try {
        //new Date().toISOString().substring(0, 10)
        var whr_tgl = (req.headers.tgl == undefined || req.headers.tgl == '')? 
            '' : `and h.saleDate like '${req.headers.tgl} %' `;
        var whr_cari = (req.headers.cari == undefined || req.headers.cari == '')?
            '' : `and h.saleTo like '${req.headers.cari}%' `;
        const [r, f] = await db.query(`select h.*,
            h.totalAmount - h.totalDiscount - h.totalTax as grandTotal,
            date_format(h.saleDate, '%H:%i') as tgl,
            t.name as typeName, s.name as statusName
            from sale_hdr h
            left outer join sale_type t on t.id = h.saleType
            left outer join sale_status s on s.id = h.statusId
            where h.cafeId = ? ${whr_tgl} ${whr_cari}
            order by h.saleDate desc
            limit ${max_row}`, [ req.headers.cafe ]);
        res.send({ ok: r.length, data: r });
    } catch(err) {
        res.status(500).send(err.message);
    }
})

export default router;