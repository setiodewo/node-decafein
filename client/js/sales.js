// Author : Emanuel Setio Dewo, 09/09/2024

let active_kategori = 0;
let sales_page = 0;
let sale_tgl = '';
let sale_cari = '';
let sale_prg;

async function fn_penjualan() {
    main.innerHTML = await fetch_static('./static/sales.html');
    sale_prg = document.getElementById('sale_prg');
    sale_prg.style.display = 'none';
    const init_tab = document.getElementById('sales_menu');
    init_tab.click();
    init_sales_type();
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
    await fetch(`${API}/menu`, {
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
                    <div class="col-4 pe-2">
                        <div class="card mb-3">
                            <!--
                            <div class="card-header">${m.categoryName}</div>
                            -->
                            <div class="card-body">
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
    tbl.insertAdjacentHTML('beforeend', `
        <tr>
            <td class='align-middle'>${par.name}</td>
            <td class='align-middle'>${prc}</td>
            <td class='align-middle'>${par.quantity}</td>
            <td class='align-middle'>${par.discount}%</td>
        </tr>`);
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
        alert('Status transaksi sudah dibayar/dihapus. Tidak dapat ditambahkan item baru!');
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
                totalAmount : Number(ret.data.totalAmount).toLocaleString(),
                totalDiscount : Number(ret.data.totalDiscount).toLocaleString(),
                grandTotal : Number(ret.data.grandTotal).toLocaleString()
            }
            populate_form('frm_sale_total', datanya);
            console.log('total', datanya);
        }
    }).catch(err => {
        alert(err);
    })
}

function change_amount(jml) {
    let amount = document.getElementById('frm_add_trxitem').elements['amount'];
    let j = (Number(amount.value) + jml) <= 0 ? 1 : Number(amount.value) + jml;

    amount.value = j;
}

async function fn_new_trx() {
    sale_prg.style.display = 'inline-block';
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
    <div class="row">
        <div class="col-md-12">
            <div class="input-group">
                <span class="input-group-text">Filter</span>
                <input type="date" id="filter_tanggal" class="form-control" onchange="get_sales_daftar()">
                <span class="input-group-text">Cari Pembeli</span>
                <input type="text" id="cari_pembeli" class="form-control">
                <button type="button" class="btn btn-outline-secondary" onclick="get_sales_daftar()"><i class="bi-search"></i></button>
                <button type="button" class="btn btn-outline-secondary" onclick="reset_sales_daftar()"><i class="bi-x-circle"></i></button>
            </div>
        </div>
    </div>`;
    get_sales_daftar();
}

function reset_sales_daftar() {
    let cari_pembeli = document.getElementById('cari_pembeli');
    cari_pembeli.value = '';
    get_sales_daftar();
}

async function get_sales_daftar() {
    var tgl = document.getElementById('filter_tanggal').value;
    const content1 = document.getElementById('content1');
    content1.innerHTML = `<table class='table'>
        <tr>
            <th class="col-md-1 bg-body-tertiary">Trx</th>
            <th class="col-md-1 bg-body-tertiary">Jam</th>
            <th class="col-md-2 bg-body-tertiary">Jenis</th>
            <th class="bg-body-tertiary">Pembeli</th>
            <th class="col-md-1 bg-body-tertiary">Total</th>
            <th class="col-md-1 bg-body-tertiary">Status</th>
            <th class="col-md-1 bg-body-tertiary"></th>
        </tr>
        <tbody id="body_sales_daftar"></tbody>
        </table>`;

    sale_prg.style.display = 'inline-block';
    await fetch(`${API}/sale`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id,
            'tgl' : tgl,
            'page' : sales_page
        }
    }).then(j => j.json()).then(data => {
        let daft = document.getElementById('body_sales_daftar');
        if (data.ok > 0) {
            data.data.forEach(d => {
                daft.insertAdjacentHTML('beforeend', `
                    <tr>
                    <td class="align-middle">${d.id}</td>
                    <td class="align-middle">${d.tgl}</td>
                    <td class="align-middle">${d.typeName}</td>
                    <td class="align-middle">${d.saleTo}</td>
                    <td class="align-middle">${d.totalPaid}</td>
                    <td class="align-middle">${d.statusName}</td>
                    <td class="align-middle">
                        <button type="button" class="btn btn-secondary" onclick="fn_edit_trx(${d.id})">
                            <i class="bi-arrow-right"></i>
                        </button>
                    </td>
                    </tr>`);
            })
        }
    });
    sale_prg.style.display = 'none';
}