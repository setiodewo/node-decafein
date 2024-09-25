// Author : Emanuel Setio Dewo, 09/09/2024

// reference: https://github.com/rubenruvalcabac/epson-epos-sdk-react
// https://www.npmjs.com/package/node-thermal-printer

let active_tab = 0;
let active_kategori = 0;
let sales_page = 0;
let sale_tgl = '';
let sale_cari = '';
let sale_prg;
let payment_type = [];
let printer_kasir = {};

const max_row = 10;

async function fn_penjualan() {
    main.innerHTML = await fetch_static('./static/sales.html');
    sale_prg = document.getElementById('sale_prg');
    sale_prg.style.display = 'none';
    const init_tab = document.getElementById('sales_menu');
    init_tab.click();
    init_sales_type();
    init_payment_type();
    printer_kasir = await get_printer(1);
}

async function fn_sales_tab(tab) {
    // init tab
    let aktif = document.getElementsByClassName('sales_tab active');
    if (aktif.length == 0) {}
    else {
        for (let i = 0; i < aktif.length; i++) {
            aktif[i].classList.remove('active');
        }
    }
    tab.classList.add('active');
    active_tab = tab.dataset.index;

    var f = tab.dataset.func;
    if (typeof window[f] === 'function') {
        await window[f]();
    }
    else alert(`ERROR FUNCTION ${f}`);
}

async function fn_sales_menu() {
    const panel1 = document.getElementById('panel1');
    get_daftar_kategori(panel1);
}

async function init_sales_type() {
    const tipe = document.getElementById('radio_saleType');
    tipe.innerHTML = '';
    await fetch(`${API}/sale/type`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => {
        if (j.status == 401) {
            throw j.statusText;
        } else return j.json();
    }).then(tp => {
        tp.forEach(t => {
            tipe.insertAdjacentHTML('beforeend', `
                <input type='radio'
                    class='btn-check'
                    name='saleType'
                    id='saleType_${t.id}'
                    value='${t.id}'
                    onclick="ganti_tipe(this)">
                    <label class="btn btn-outline-secondary"
                    for="saleType_${t.id}">
                    ${t.name}</label>
                </input>`)
        })
    })
}

async function init_payment_type() {
    await fetch(`${API}/sale/paymenttype`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(data => {
        payment_type = data;
    })
    .catch(err => {
        alert(err);
    });
}

async function get_daftar_kategori(dv) {
    dv.innerHTML = `<div class="btn-group" id="group_kategori"></div>`;
    const grp = document.getElementById('group_kategori');
    sale_prg.style.display = 'inline-block';
    await fetch(`${API}/menu/kategori`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    })
    .then(j => {
        if (j.status == 401) {
            throw "Sesi expired. Mungkin akun digunakan di komputer lain. Silakan logout & login lagi!";
        } else {
            return j.json();
        }
    })
    .then(kat => {
        active_kategori = kat[0].id;
        kat.forEach(k => {
            if (k.active == 1)
            grp.insertAdjacentHTML('beforeend', `
                <input type='radio' 
                    class='btn-check' 
                    name='btn-categori'
                    id='btn_kategori_${k.id}' 
                    value='${k.id}'
                    data-id="${k.id}"
                    onclick="fn_ganti_kategori(this)">
                    <label class="btn btn-outline-secondary" for="btn_kategori_${k.id}" title="Filter menu berdasarkan kategori">
                        <i class="${k.icon}"></i>
                        ${k.name}</label>
                </input>`)
        });
        document.getElementById(`btn_kategori_${active_kategori}`).click();
    }).catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

function fn_ganti_kategori(btn) {
    active_kategori = btn.dataset.id;
    const content1 = document.getElementById('content1');
    get_daftar_menu(content1);
}

async function get_daftar_menu(dvc) {
    dvc.innerHTML = `<div id="daftar_menu" class="d-flex flex-row overflow-auto flex-wrap" style="max-height: 100%"></div>`;
    let dv = document.getElementById('daftar_menu');
    sale_prg.style.display = 'inline-block';
    let time = Date.now();
    await fetch(`${API}/menu/daftar/${time}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id,
            'kategori' : active_kategori
        }
    })
    .then(j => {
        if (j.status == 401) {
            throw "Sesi expired atau digunakan di komputer lain. Silakan logout & login lagi.";
        } else {
            return j.json();
        }
    })
    .then(menu => {
        if (menu.ok > 0) {
            menu.data.forEach(m => {
                if (m.active == 1)
                dv.insertAdjacentHTML('beforeend', `
                    <div class="pe-2" style="width:200px;">
                        <div class="card mb-3">
                            <!--
                            <div class="card-header">${m.categoryName}</div>
                            -->
                            <img src="${m.img}" class="card-img-top menu-img" onclick="fn_lihat_foto('${m.name}', '${m.img}')" style="cursor: pointer;">
                            <div class="card-body menu-title">
                                <p class="card-text">${m.name}</p>
                            </div>
                            <div class="card-footer align-middle">
                                ${Number(m.basePrice).toLocaleString()}
                                <button 
                                    class="btn btn-sm btn-primary float-end"
                                    title="Tambahkan"
                                    data-id="${m.id}"
                                    data-kat="${m.categoryName}"
                                    data-katid="${m.categoryId}"
                                    data-desc="${m.description}"
                                    data-name="${m.name}"
                                    data-currency="${m.currency}"
                                    data-price="${m.basePrice}"
                                    data-cogs="${m.COGS}"
                                    onclick="fn_tambah_item(this)">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>`);
            })
        } else {
            dv.innerHTML = `Tidak ada menu`;
        }
    })
    .catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

async function fn_tambah_item(btn) {
    const par = {
        'itemId' : btn.dataset.id,
        'name' : btn.dataset.name,
        "description" : btn.dataset.desc,
        'categoryName' : btn.dataset.kat,
        'categoryId' : btn.dataset.katid,
        'currency': btn.dataset.currency,
        'basePrice' : btn.dataset.price,
        'COGS' : btn.dataset.cogs,
        'quantity' : 1,
        'discount': 0,
        'notes' : ''
    }
    const tombol = `
        <button type="button" class="btn btn-primary" onclick="fn_tambahkan_item(this)">
            <i class="bi bi-plus-lg"></i> Tambahkan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    const frm = await fetch_static('./static/add_trxitem.html');
    show_modal('Tambah Item', frm, tombol);
    populate_form('frm_add_trxitem', par);
    document.getElementById('currencyName').innerHTML = par.currency;

    blank_prg.style.display = 'none';
}

async function fn_tambahkan_item(btn) {
    var par = serialize_form('frm_add_trxitem');
    const hdr = document.getElementById('frm_sale_hdr');
    const saleId = hdr.elements['id'].value;
    const statusId = hdr.elements['statusId'].value;

    if (saleId == null || saleId == '') {
        alert('Tidak ada transaksi aktif di panel kanan!');
        return;
    }
    if (statusId != 0) {
        alert('Status transaksi sudah dibayar/dihapus. Tidak dapat ditambahkan item baru!');
        return;
    }

    sale_prg.style.display = 'inline-block';
    await fetch(`${API}/sale/additem/${saleId}`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify(par)
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 0) {
            alert(ret.message);
        } else {
            par['id'] = ret.id;
            var tbl = document.getElementById('body_trxitem');
            render_trxitem(tbl, par);
            recalculate_sale(saleId);
            blank_dlg.hide();
        }
    }).catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

function render_trxitem(tbl, par) {
    let prc = Number(par.basePrice).toLocaleString();
    let stt = document.getElementById('frm_sale_hdr').elements['statusId'];
    let del = (stt.value == 0)? `
        <button class="btn btn-sm btn-danger" onclick="fn_delete_item(${par.saleId}, ${par.id})">
            <i class="bi-trash"></i>
        </button>` : '';
    tbl.insertAdjacentHTML('beforeend', `
        <tr id="trxid_${par.id}">
            <td class='align-middle'>${par.name}</td>
            <td class='align-middle'>${prc}</td>
            <td class='align-middle text-center'>${par.quantity}</td>
            <td class='align-middle text-center'>${par.discount}%</td>
            <td class='align-middle'>${del}</td>
        </tr>`);
}

async function fn_delete_item(saleId, trxId) {
    if (confirm("Anda yakin mau menghapus item ini?")) {
        sale_prg.style.display = 'inline-block';
        await fetch(`${API}/sale/delitem`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'id' : profile.id,
                'token' : profile.token,
                'cafe' : cafe.id
            },
            body: JSON.stringify({ 'saleId': saleId, 'trxId': trxId })
        }).then(j => j.json()).then(ret => {
            if (ret.ok == 0) {}
            else {
                document.getElementById(`trxid_${trxId}`).remove();
                fn_recalculate_sale();
            }
        })
        sale_prg.style.display = 'none';
    }
}

function fn_recalculate_sale() {
    const hdr = document.getElementById('frm_sale_hdr');
    const saleId = hdr.elements['id'].value;
    const statusId = hdr.elements['statusId'].value;

    if (saleId == null || saleId == '') {
        alert('Tidak ada transaksi aktif!');
        return;
    }
    if (statusId != 0) {
        alert(`Status transaksi: ${hdr.elements['statusName'].value}`);
        return;
    }
    recalculate_sale(saleId);
}

async function recalculate_sale(id) {
    await fetch(`${API}/sale/recalculate/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 0) {}
        else {
            let datanya = {
                _totalAmount : Number(ret.data.totalAmount).toLocaleString(),
                _totalDiscount : Number(ret.data.totalDiscount).toLocaleString(),
                _totalTax : Number(ret.data.totalTax).toLocaleString(),
                _grandTotal : Number(ret.data.grandTotal).toLocaleString()
            }
            populate_form('frm_sale_total', datanya);
            console.log('total', datanya);
        }
    }).catch(err => {
        alert(err);
    })
}

function change_amount(jml) {
    let amount = document.getElementById('frm_add_trxitem').elements['quantity'];
    let j = (Number(amount.value) + jml) <= 0 ? 1 : Number(amount.value) + jml;

    amount.value = j;
}

async function fn_new_trx() {
    sale_prg.style.display = 'inline-block';
    var tbl = document.getElementById('body_trxitem');
    tbl.innerHTML = '';
    await fetch(`${API}/sale/new`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => {
        if (j.status == 401) {
            throw 'Sesi expired. Mungkin akun Anda digunakan di komputer lain.';
        } else {
            return j.json();
        }
    }).then(neo => {
        populate_form('frm_sale_hdr', neo.data);
        populate_form('frm_sale_total', neo.data);
        document.getElementById('frm_sale_hdr').elements['saleTo'].focus();
    }).catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

async function fn_edit_trx(id) {
    sale_prg.style.display = 'inline-block';
    await fetch(`${API}/sale/edit/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => {
        if (j.status == 401) {
            throw 'Sesi expired. Mungkin akun Anda digunakan di komputer lain.';
        } else {
            return j.json();
        }
    }).then(edit => {
        populate_form('frm_sale_hdr', edit.data);
        populate_form('frm_sale_total', edit.data);
        daftar_trxitem(id);
    }).catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

async function daftar_trxitem(id) {
    await fetch(`${API}/sale/daftaritem/${id}`, {
        method: 'GET',
        headers: {
            'Content-type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(daftar => {
        var tbl = document.getElementById('body_trxitem');
        tbl.innerHTML = '';
        if (daftar.ok > 0) {
            daftar.data.forEach(d => {
                render_trxitem(tbl, d);
            })
        }
    }).catch(err => {
        alert(err);
    });
}

async function ganti_tipe(btn) {
    let id = document.getElementById('frm_sale_hdr').elements['id'].value;
    if (id == null || id == '') return;

    // Cek statusnya, krn selain 0, nilainya tdk bisa diubah
    if (document.getElementById('frm_sale_hdr').elements['statusId'].value != 0) {
        inp.value = inp.dataset.data;
        return;
    }

    // set value
    sale_prg.style.display = 'inline-block';
    await fetch(`${API}/sale/field`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify({
            'id' : id,
            'field' : 'saleType',
            'value' : btn.value
        })
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 1) {}
        else {
            alert(ret.message);
        }
    }).catch(err => {
        alert(err);
    });
    sale_prg.style.display = 'none';
}

function focusin(inp) {
    inp.dataset.data = inp.value;
}

async function focusout(inp) {
    let id = document.getElementById('frm_sale_hdr').elements['id'].value;
    if (id == null || id == '') return;

    // Cek statusnya, krn selain 0, nilainya tdk bisa diubah
    if (document.getElementById('frm_sale_hdr').elements['statusId'].value != 0) {
        inp.value = inp.dataset.data;
        return;
    }

    if (inp.value != '' && inp.value != inp.dataset.data) {
        // set value
        sale_prg.style.display = 'inline-block';
        await fetch(`${API}/sale/field`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'id' : profile.id,
                'token' : profile.token,
                'cafe' : cafe.id
            },
            body: JSON.stringify({
                'id' : id,
                'field' : inp.id,
                'value' : inp.value
            })
        }).then(j => j.json()).then(ret => {
            if (ret.ok == 1) {}
            else {
                alert(ret.message);
            }
        }).catch(err => {
            alert(err);
        });
        sale_prg.style.display = 'none';
    }
}

async function fn_sales_daftar() {
    const panel1 = document.getElementById('panel1');
    panel1.innerHTML = `
        <div class="input-group" style="max-width: 600px;">
            <span class="input-group-text">Filter</span>
            <input type="date" id="filter_tanggal" class="form-control" onchange="search_sales_daftar()">
            <span class="input-group-text">Cari Pembeli</span>
            <input type="text" id="cari_pembeli" class="form-control">
            <button type="button" class="btn btn-outline-secondary" onclick="search_sales_daftar()"><i class="bi-search"></i></button>
            <button type="button" class="btn btn-outline-secondary" onclick="reset_sales_daftar()"><i class="bi-x-circle"></i></button>
        </div>`;
    if (sale_tgl != '') document.getElementById('filter_tanggal').value = sale_tgl;
    if (sale_cari != '') document.getElementById('cari_pembeli').value = sale_cari;
    get_sales_daftar();
}

function search_sales_daftar() {
    sales_page = 0;
    get_sales_daftar();
}

function reset_sales_daftar() {
    sales_page = 0;
    document.getElementById('filter_tanggal').value = '';
    document.getElementById('cari_pembeli').value = '';
    get_sales_daftar();
}

async function get_sales_daftar() {
    sale_tgl = document.getElementById('filter_tanggal').value;
    sale_cari = document.getElementById('cari_pembeli').value;
    const content1 = document.getElementById('content1');
    content1.innerHTML = `<table class='table'>
        <tr>
            <th class="col-md-1 bg-body-tertiary">Trx</th>
            <th class="col-md-1 bg-body-tertiary">Jam</th>
            <th class="col-md-2 bg-body-tertiary">Jenis</th>
            <th class="bg-body-tertiary">Pembeli</th>
            <th class="col-md-1 bg-body-tertiary">Total</th>
            <th class="col-md-1 bg-body-tertiary">Status</th>
            <th class="col-md-1 bg-body-tertiary" style="width:50px;">&nbsp;</th>
        </tr>
        <tbody id="body_sales_daftar"></tbody>
        </table>
        <div id='halaman_sales_daftar' class='mt-2'></div>`;

    sale_prg.style.display = 'inline-block';
    let jml = 0;
    await fetch(`${API}/sale`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id,
            'tgl' : sale_tgl,
            'cari' : sale_cari,
            'page' : sales_page
        }
    }).then(j => j.json()).then(data => {
        let daft = document.getElementById('body_sales_daftar');
        if (data.ok > 0) {
            jml = data.data.length;
            data.data.forEach(d => {
                let wrn = '';
                if (d.statusId < 0) {
                    wrn = 'text-danger';
                }
                if (d.statusId > 0) {
                    wrn = 'text-success';
                }
                let grandTotal = Number(d.grandTotal).toLocaleString();
                daft.insertAdjacentHTML('beforeend', `
                    <tr>
                    <td class="align-middle">${d.id}</td>
                    <td class="align-middle">${d.tgl}</td>
                    <td class="align-middle">${d.typeName}</td>
                    <td class="align-middle">${d.saleTo}</td>
                    <td class="align-middle text-end">${grandTotal}</td>
                    <td class="align-middle bg-body-tertiary text-center ${wrn}">${d.statusName}</td>
                    <td class="align-middle">
                        <button type="button" class="btn btn-sm btn-primary" onclick="fn_edit_trx(${d.id})">
                            <i class="bi-arrow-right"></i>
                        </button>
                    </td>
                    </tr>`);
            });
            document.getElementById('halaman_sales_daftar').innerHTML = pagination(max_row, sales_page, jml, "page_sales_daftar");
        }
    });
    sale_prg.style.display = 'none';
}

function page_sales_daftar(pg) {
    sales_page += pg;
    get_sales_daftar();
}

async function fn_show_payment() {
    let hdr = document.getElementById('frm_sale_hdr');
    let saleId = hdr.elements['id'].value;
    if (saleId == null || saleId == '') return;

    let statusId = hdr.elements['statusId'].value;
    if (statusId != 0) {
        let statusName = hdr.elements['statusName'].value;
        alert(`Status ${statusName}. Tidak dapat dilakukan pembayaran lagi.`);
        return;
    }

    let frm = await fetch_static('./static/edit_payment.html');
    const tombol = `
        <button type="button" class="btn btn-primary" onclick="fn_save_payment(this)">
            <i class="bi bi-send-check"></i> Bayarkan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    show_modal('Pembayaran', frm, tombol);

    await fetch(`${API}/sale/edit/${saleId}`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(data => {
        if (data.ok > 0) {
            populate_form('frm_pay_sale', data.data);
            let opt = optionize(payment_type);
            document.getElementById('frm_pay_sale').elements['paymentType'].innerHTML = opt;
        }
    });
    blank_prg.style.display = 'none';
}

function change_payment_type(select) {
    let det = payment_type.find(o => o.id == select.value);
    if (det == null) return;
    let grandTotal = Number(valueof('frm_pay_sale', 'grandTotal'));
    let finalAmount = grandTotal;
    if (det.percent == 0) {
        payCharge = Number(det.paymentCharge);
        finalAmount = grandTotal + Number(det.paymentCharge);
    } else {
        payCharge = (grandTotal * Number(det.paymentCharge) / 100);
        finalAmount = grandTotal + payCharge;
    }
    setvalueof('frm_pay_sale', 'payCharge', Number(payCharge).toLocaleString());
    //setvalueof('frm_pay_sale', '_payCharge', );
    setvalueof('frm_pay_sale', 'finalAmount', finalAmount);
    setvalueof('frm_pay_sale', '_finalAmount', Number(finalAmount).toLocaleString());
}

function fn_jumlah_pas() {
    let fa = valueof('frm_pay_sale', 'finalAmount');
    if (fa == '' || fa == 0) {
        fa = valueof('frm_pay_sale', 'grandTotal');
    }
    //setvalueof('frm_pay_sale', 'payAmount', fa);
    setvalueof('frm_pay_sale', 'payAmount', Number(fa).toLocaleString());
    hitung_kembalian(document.getElementById('payAmount'));
}

function hitung_kembalian(inp) {
    let paymentType = valueof('frm_pay_sale', 'paymentType');
    if (paymentType == '') {
        alert('Pilih jenis pembayaran terlebih dahulu!');
        return;
    }
    let fa = valueof('frm_pay_sale', 'finalAmount');
    let byr = inp.value;
    byr = String(byr).replace(/,/g, '');
    let sisa = Number(byr) - Number(fa);
    if (sisa < 0) sisa = 0;
    setvalueof('frm_pay_sale', 'payChange', Number(sisa).toLocaleString());
}

async function fn_save_payment(btn) {
    if (invalid_input('frm_pay_sale', 'paymentType', 'Pilih dulu jenis pembayaran!')) return;
    if (invalid_input('frm_pay_sale', 'payAmount', 'Masukkan jumlah bayar!')) return;
    let fa = valueof('frm_pay_sale', 'finalAmount');
    let pa = valueof('frm_pay_sale', 'payAmount');

    if (Number(String(fa).replace(/,/g, '')) > Number(String(pa).replace(/,/g, ''))) {
        alert("Nilai pembayaran harus sama dengan atau lebih besar dari pada harga akhir!");
        return;
    }
    btn.style.display = 'none';
    blank_prg.style.display = 'inline-block';

    let par = serialize_form('frm_pay_sale');
    par['payAmount'] = String(par['payAmount']).replace(/,/g, '');
    par['payCharge'] = String(par['payCharge']).replace(/,/g, '');
    par['payChange'] = String(par['payChange']).replace(/,/g, '');
    
    await fetch(`${API}/sale/pay`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify(par)
    }).then(j => j.json()).then(ret => {
        if (ret.ok > 0) {
            blank_dlg.hide();
            if (active_tab == 1) get_sales_daftar();
            fn_edit_trx(par['id']);
        }
    }).catch(err => {
        alert(err);
    })
}

async function fn_delete_sale() {
    let frm = document.getElementById('frm_sale_hdr');
    if (frm.elements['id'].value == '') return false;
    if (frm.elements['statusId'].value != 0) {
        alert(`Status: ${frm.elements['statusName'].value}. Tidak dapat dihapus!`);
        return;
    }

    if (confirm(`Yakin Anda akan menghapus transaksi ini?`)) {
        await fetch(`${API}/sale/delhdr`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
                'id' : profile.id,
                'token' : profile.token,
                'cafe' : cafe.id
            },
            body: JSON.stringify({ id: frm.elements['id'].value })
        }).then(j => j.json()).then(ret => {
            if (ret.ok == 0) {
                alert(`Gagal menghapus data. Error: ${ret.message}`);
            } else {
                get_sales_daftar();
                fn_edit_trx(frm.elements['id'].value);
            }
        })
    }
}

async function fn_print_struk() {
    const frm = document.getElementById('frm_sale_hdr');
    if (frm.elements['id'].value == null || frm.elements['id'].value == '') {
        return;
    }

    let data = await ambil_data_sales(frm.elements['id'].value);
    let hdr = data.hdr;
    let itm = data.item;
    let pay = data.pay;

    let struk = `${esc._reset}${esc._center}${esc._big}${cafe.name}${esc._normal}\n` +
        `${cafe.address}\n${cafe.city} ${cafe.zipCode}\n` + esc._left + esc._grs + 
        'Nomor: ' + String(hdr.id).padEnd(9, ' ') +
            `${hdr.Tanggal} ${hdr.Jam}\n` +
        'Kasir: ' + String(hdr.userName).padEnd(15, ' ') +
            String(hdr.typeName).padStart(10, ' ') + "\n" + esc._grs;
    struk += 'A/N. : ' + String(hdr.saleTo).substring(0, 32) + "\n" + esc._grs;
    struk += String('Pembelian').padEnd(16, ' ') +
        String('Amount').padStart(16, ' ') + "\n" + esc._grs2;
    itm.forEach(i => {
        let amount = i.quantity * (i.basePrice - (i.basePrice * i.discount / 100));
        struk += `${String(i.menuName).substring(0, 32)}\n`;
        let diskon = (i.discount == 0) ? String('').padEnd(5, ' ') : String('-'+i.discount + '%').padStart(5, ' ');
        struk += '  ' +
            String(i.quantity + 'x').padEnd(5, ' ') +
            String(Number(i.basePrice).toLocaleString()).padEnd(9, ' ') +
            diskon +
            String(Number(amount).toLocaleString()).padStart(11, ' ') +
            "\n\n";
    });

    let grandTotal = Number(hdr.totalAmount) - Number(hdr.totalDiscount);
    struk += esc._grs2;
    // Jika ada diskon
    if (Number(hdr.totalDiscount) > 0) {
        struk += String('Total Pembelian:').padStart(16, ' ') +
        String(Number(hdr.totalAmount).toLocaleString()).padStart(16, ' ') + "\n" +
        String('Total Diskon :').padStart(16, ' ') +
        String(Number(hdr.totalDiscount).toLocaleString()).padStart(16, ' ') + "\n";
    }
    // Grand total
    struk += String('Grand Total :').padStart(16, ' ') +
        String(Number(grandTotal).toLocaleString()).padStart(16, ' ') + "\n\n";
    
    // Jika sudah ada pembayaran
    let byr = 0;
    if (pay.length > 0) {
        struk += padBoth('PEMBAYARAN', 32, '-') + "\n";
        pay.forEach((p, idx) => {
            byr += Number(p.grandTotal) + Number(p.paymentCharge);
            let paymentCharge = '';
            if (Number(p.payCharge) > 0) {
                paymentCharge = String('Charge :').padStart(16, ' ') +
                String(Number(p.payCharge).toLocaleString()).padStart(16, ' ') + "\n";
            }
            let paymentChange = '';
            if (Number(p.payChange) > 0) {
                paymentChange = String('Kembalian :').padStart(16, ' ') +
                String(Number(p.payChange).toLocaleString()).padStart(16, ' ') + "\n";
            }
            struk += esc._boldOn +
                String(`${p.paymentName}`).substring(0, 32) + esc._boldOff + "\n" +
                paymentCharge +
                String('Pembayaran :').padStart(16, ' ') +
                String(Number(p.payAmount).toLocaleString()).padStart(16, ' ') + "\n" +
                paymentChange;
        })
    }
        
    // Penutup
    struk += "\n" + esc._grs + "Terima kasih atas kunjungan Anda\n\n\n\n";

    await fetch(`${printer_kasir.url}`, {
        method: 'POST',
        headers: {
            token: printer_kasir.token
        },
        body: struk
    }).then(t => t.text()).then(t => {
        console.log(t);
    }).catch(err => {
        alert(err);
    })
}

async function ambil_data_sales(id) {
    return await fetch(`${API}/sale/data/${id}`, {
        method: 'GET',
        headers: {
            'id': profile.id,
            'token': profile.token,
            'cafe': cafe.id
        }
    }).then(j => j.json()).then(ret => {
        return ret;
    }).catch(err => {
        alert(err);
    });
    return null;
}