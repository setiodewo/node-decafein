// Author : Emanuel Setio Dewo, 09/09/2024

let active_kategori = 0;

async function fn_penjualan() {
    main.innerHTML = await fetch_static('./static/sales.html');
    const init_tab = document.getElementById('sales_menu');
    init_tab.click();
}

async function fn_sales_tab(tab) {
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

async function get_daftar_kategori(dv) {
    dv.innerHTML = `<div class="btn-group" id="group_kategori"></div>`;
    const grp = document.getElementById('group_kategori');
    await fetch(`${API}/menu/kategori`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(kat => {
        active_kategori = kat[0].id;
        kat.forEach(k => {
            if (k.active == 1)
            grp.insertAdjacentHTML('beforeend', `
                <input type='radio' 
                    class='btn-check' 
                    name='btn-categori' 
                    id='btn_kategori_${k.id}' 
                    data-id="${k.id}"
                    onclick="fn_ganti_kategori(this)">
                    <label class="btn btn-outline-secondary" for="btn_kategori_${k.id}">
                        <i class="${k.icon}"></i>
                        ${k.name}</label>
                </input>`)
        });
        document.getElementById(`btn_kategori_${active_kategori}`).click();
    })
}

function fn_ganti_kategori(btn) {
    active_kategori = btn.dataset.id;
    const content1 = document.getElementById('content1');
    get_daftar_menu(content1);
}

async function get_daftar_menu(dv) {
    dv.innerHTML = '';
    await fetch(`${API}/menu`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id,
            'kategori' : active_kategori
        }
    }).then(j => j.json()).then(menu => {
        if (menu.ok > 0) {
            menu.data.forEach(m => {
                if (m.active == 1)
                dv.insertAdjacentHTML('beforeend', `
                    <div class="col-4">
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
}

async function fn_tambah_item(btn) {
    const par = {
        'id' : btn.dataset.id,
        'name' : btn.dataset.name,
        "description" : btn.dataset.desc,
        'categoryName' : btn.dataset.kat,
        'categoryId' : btn.dataset.katid,
        'currency': btn.dataset.currency,
        'basePrice' : btn.dataset.price,
        'COGS' : btn.dataset.cogs,
        'amount' : 1,
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
    document.getElementById('currency').innerHTML = par.currency;

    blank_prg.style.display = 'none';
}

function change_amount(jml) {
    let amount = document.getElementById('frm_add_trxitem').elements['amount'];
    let j = (Number(amount.value) + jml) <= 0 ? 1 : Number(amount.value) + jml;

    amount.value = j;
}