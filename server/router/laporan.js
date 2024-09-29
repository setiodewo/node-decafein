// Author : Emanuel Setio Dewo, 17/09/2024

import express, { response } from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';
import moment from 'moment/moment.js';
import * as xlsx from 'xlsx';

// middleware validasi token
router.use(validate_token);

router.get('/sales1', async(req, res) => {
    var bln = Number(req.headers.bln) + 1;
    if (String(bln).length == 1) bln = String(bln).padStart(2, '0');
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart('20') : req.headers.thn;
    const [r, f] = await db.query(`
        select date_format(h.saleDate, '%d') as x,
        sum((i.basePrice * i.quantity) - amountDiscount) as NET,
        sum(i.COGS * i.quantity) as COGS,
        sum(((i.basePrice * i.quantity) - amountDiscount) - (i.COGS * i.quantity)) as PROFIT

        from sale_hdr h
        left outer join sale_item i on i.saleId = h.id
        where h.cafeId = ? and LEFT(h.saleDate, 7) = ? and h.statusId > 0
        group by 1`, [
            req.headers.cafe, `${thn}-${bln}`
        ]);
    let hari = [];
    let d = [];
    for (let i = 1; i <= moment().daysInMonth(bln); i++) {
        hari.push(String(i));
        const ketemu = r.find(({ x }) => x === String(i));
        if (ketemu == null) {
            d.push({ "x": String(i), "NET": 0, "COGS": 0, "PROFIT": 0 });
        } else {
            d.push(ketemu);
        }
    }
    const cfg = {
        type: 'line',
        data: {
            labels: hari,
            datasets: [
                {
                    label: 'Penjualan Bersih',
                    data: d,
                    parsing: { yAxisKey: 'NET' },
                    borderWidth: 1,
                    fill: true,
                    borderColor: 'rgba(100, 100, 255, 1)',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)'
                },
                {
                    label: 'COGS',
                    data: d,
                    parsing: { yAxisKey: 'COGS' },
                    borderWidth: 1,
                    fill: true,
                    borderColor: 'rgba(255, 100, 100, 1)',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)'
                },
                {
                    label: 'Profit',
                    data: d,
                    parsing: { yAxisKey: 'PROFIT' },
                    borderWidth: 1,
                    fill: true,
                    borderColor: '#00FF00',
                    backgroundColor: 'rgba(100, 255, 100, 0.1)'
                }
            ],
            borderWidth: 0.1
        },
        options: {
            responsive: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    }
    res.send(cfg);
});

router.get('/sales12', async(req, res) => {
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart(2, '20') : req.headers.thn;
    const [r, f] = await db.query(`select MONTH(h.saleDate) as x,
        sum(h.totalAmount - h.totalDiscount) as JML
        from sale_hdr h
        where h.cafeId = ? and YEAR(h.saleDate) = ? and h.statusId > 0
        group by 1`, 
        [ req.headers.cafe, thn ]);
    let namaBulan = moment.months();
    let d = [];
    for (let i = 1; i <= 12; i++) {
        const ketemu = r.find(({x}) => x === i);
        if (ketemu == null) {
            d.push({"x": namaBulan[i-1], 'JML': 0 });
        } else {
            d.push({ 'x': namaBulan[i-1], 'JML': ketemu['JML'] });
        }
    }
    const cfg = {
        type: 'bar',
        data: {
            labels: namaBulan,
            datasets: [
                {
                    label: 'Penjualan Bersih Setahun',
                    data: d,
                    parsing: { yAxisKey: 'JML' },
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    }
    res.send(cfg);
});

router.get('/salescat', async(req, res) => {
    var bln = Number(req.headers.bln) + 1;
    if (String(bln).length == 1) bln = String(bln).padStart(2, '0');
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart('20') : req.headers.thn;
    const [r, f] = await db.query(`select date_format(h.saleDate, '%d') as x,
        c.id as categoryId, c.name as categoryName,
        sum(((i.basePrice * i.quantity) - amountDiscount) - (i.COGS * i.quantity)) as PROFIT
        from sale_hdr h
        left outer join sale_item i on i.saleId = h.id
        left outer join menu_category c on c.id = i.categoryId
        where h.cafeId = ? and LEFT(h.saleDate, 7) = ? and h.statusId > 0
        group by 1, 2`, 
        [ req.headers.cafe, `${thn}-${bln}` ]);
    const [cat, catf] = await db.query(`select id, name from menu_category where cafeId = ? order by name`, [req.headers.cafe]);
    let hari = [];
    let d = [];
    
    for (let i = 1; i <= moment().daysInMonth(bln); i++) {
        hari.push(String(i));
        cat.forEach(c => {
            const ketemu = r.find(({ x, categoryId }) => x === String(i) && categoryId === c.id);
            if (ketemu == null) {
                d.push({ name: c.name, x: i, PROFIT: 0 });
            } else {
                d.push({ name: c.name, x: i, PROFIT: ketemu.PROFIT });
            }
        });
    }
    
    let datasets = [];
    cat.forEach(c => {
        datasets.push({
            label: c.name,
            data: d.filter(({ name }) => name === c.name),
            parsing: { yAxisKey: 'PROFIT' },
            borderWidth: 1
        })
    });
    res.send({
        type: 'line',
        data: {
            labels: hari,
            datasets: datasets
        },
        options: {
            responsive: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});

router.get('/perkasir', async(req, res) => {
    var bln = Number(req.headers.bln) + 1;
    if (String(bln).length == 1) bln = String(bln).padStart(2, '0');
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart('20') : req.headers.thn;
    const [u, fu] = await db.query(`select distinct(u.userName)
        from sale_hdr h
        left outer join user u on u.id = h.createdBy
        where h.cafeId = ? and LEFT(h.saleDate, 7) = ?`, [ req.headers.cafe, `${thn}-${bln}` ]);
    const [r, f] = await db.query(`select u.userName, date_format(h.saleDate, '%d') as tgl,
        sum(totalAmount - totalDiscount) as Total
        from sale_hdr h
        left outer join user u on u.id = h.createdBy
        where h.cafeId = ? and LEFT(h.saleDate, 7) = ?
        group by 1, 2`,
        [ req.headers.cafe, `${thn}-${bln}` ]);
    // translasikan
    let hsl = [];
    var arr_hdr = ['Username'];
    for (let i = 1; i <= moment().daysInMonth(bln); i++) {
        arr_hdr.push(String(i));
    }
    arr_hdr.push('TOTAL');
    hsl.push(arr_hdr);

    let gtot = 0;
    u.forEach(usr => {
        let arr = [usr.userName];
        let tot = 0;
        for (let i = 1; i <= moment().daysInMonth(bln); i++) {
            const ktm = r.find(({ userName, tgl }) => userName == usr.userName && tgl == i);
            if (ktm == null) {
                arr.push(0);
            } else {
                arr.push(Number(ktm.Total));
                tot += Number(ktm.Total);
            }
        }
        gtot += tot;
        arr.push(tot);
        arr.push(usr.userName);
        hsl.push( arr );
    });
    console.log(hsl);
    var ws = xlsx.utils.aoa_to_sheet( hsl );

    var wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, moment.months()[req.headers.bln]);
    var buf = xlsx.write(wb, {type: 'buffer', bookType: 'xlsx'});
    var skrg = new Date().toJSON().slice(0,10).replace(/-/g,'');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.attachment(`${req.headers.cafe}_kasir_${thn}${bln}.xlsx`);
    res.status(200).end(buf);
});

router.get('/perpembayaran', async(req, res) => {
    var bln = Number(req.headers.bln) + 1;
    if (String(bln).length == 1) bln = String(bln).padStart(2, '0');
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart('20') : req.headers.thn;
    const [p, fp] = await db.query(`select id, name from payment_type where cafeId = ?`, [req.headers.cafe]);
    const [r, f] = await db.query(`select pt.name, date_format(p.createdAt, '%d') as tgl,
        sum(p.grandTotal + p.paymentCharge) as Total
        from sale_payment p
        left outer join payment_type pt on pt.id = p.paymentType
        where p.cafeId = ? and LEFT(p.createdAt, 7) = ?
        group by 1, 2`,
        [ req.headers.cafe, `${thn}-${bln}` ]);
    // translasikan
    let hsl = [];
    var arr_hdr = ['Pembayaran'];
    for (let i = 1; i <= moment().daysInMonth(bln); i++) {
        arr_hdr.push(String(i));
    }
    arr_hdr.push('TOTAL');
    hsl.push(arr_hdr);

    let gtot = 0;
    p.forEach(pt => {
        let arr = [pt.name];
        let tot = 0;
        for (let i = 1; i <= moment().daysInMonth(bln); i++) {
            const ktm = r.find(({ name, tgl }) => name == pt.name && tgl == i);
            if (ktm == null) {
                arr.push(0);
            } else {
                arr.push(Number(ktm.Total));
                tot += Number(ktm.Total);
            }
        }
        gtot += tot;
        arr.push(tot);
        arr.push(pt.name);
        hsl.push( arr );
    });
    var ws = xlsx.utils.aoa_to_sheet( hsl );

    var wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, moment.months()[req.headers.bln]);
    var buf = xlsx.write(wb, {type: 'buffer', bookType: 'xlsx'});
    var skrg = new Date().toJSON().slice(0,10).replace(/-/g,'');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.attachment(`${req.headers.cafe}_pembayaran_${thn}${bln}.xlsx`);
    res.status(200).end(buf);
});

export default router;