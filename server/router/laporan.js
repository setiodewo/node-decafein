// Author : Emanuel Setio Dewo, 17/09/2024

import express, { response } from 'express';
var router = express.Router();

import validate_token from './validasi-token.js';
import db from '../db.js';
import moment from 'moment/moment.js';

// middleware validasi token
router.use(validate_token);

router.get('/sales1', async(req, res) => {
    var bln = Number(req.headers.bln) + 1;
    if (String(bln).length == 1) bln = String(bln).padStart(2, '0');
    var thn = (req.headers.thn.length == 2)? req.headers.thn.padStart('20') : req.headers.thn;
    const [r, f] = await db.query(`
        select date_format(h.saleDate, '%d') as x,
        sum((i.basePrice * i.quantity) - amountDiscount - amountTax) as NET,
        sum(i.COGS * i.quantity) as COGS,
        sum(((i.basePrice * i.quantity) - amountDiscount - amountTax) - (i.COGS * i.quantity)) as PROFIT

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
        sum(h.totalAmount - h.totalDiscount - h.totalTax) as JML
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
        c.name as categoryName,
        sum(((i.basePrice * i.quantity) - amountDiscount - amountTax) - (i.COGS * i.quantity)) as PROFIT
        from sale_hdr h
        left outer join sale_item i on i.saleId = h.id
        left outer join menu_category c on c.id = i.itemId
        where h.cafeId = ? and LEFT(h.saleDate, 7) = ? and h.statusId > 0
        group by 1, 2`, 
        [ req.headers.cafe, `${thn}-${bln}` ]);
    const [cat, catf] = await db.query(`select name from menu_category where cafeId = ? order by name`, [req.headers.cafe]);
    let hari = [];
    let d = [];
    
    for (let i = 1; i <= moment().daysInMonth(bln); i++) {
        hari.push(String(i));
        cat.forEach(c => {
            const ketemu = r.find(({ x, categoryName }) => x === String(i) && categoryName === c.name);
            if (ketemu == null) {
                d.push({ name: c.name, x: i, JML: 0 });
            } else {
                d.push({ name: c.name, x: i, JML: ketemu.PROFIT });
            }
        });
    }
    
    let datasets = [];
    cat.forEach(c => {
        datasets.push({
            label: c.name,
            data: d.filter(({ name }) => name === c.name),
            parsing: { yAxisKey: 'JML' },
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

export default router;