// Author : Emanuel Setio Dewo, 07/09/2024

const API = "http://localhost:4000";
let profile = {};
let cafe = {};

const main = document.getElementById('main');
const blank_dlg = new bootstrap.Modal(document.getElementById('blank_dlg'), {});
const blank_dlg_title = document.getElementById('blank_dlg_title');
const blank_dlg_body = document.getElementById('blank_dlg_body');
const blank_dlg_footer = document.getElementById('blank_dlg_footer');
const blank_prg = document.getElementById('blank_prg');

window.addEventListener("load", async(ev) => {
    // Cek profile
    const p = await localStorage.getItem('profile');
    const c = await localStorage.getItem('cafe');
    if (p === null || c === null) {
        window.location = "login.html";
    }
    profile = await JSON.parse(p);
    cafe = await JSON.parse(c);

    // infoUserName
    const infoUserName = document.getElementById('infoUserName');
    infoUserName.innerHTML = profile.name;

    fn_link(document.getElementById("menu-penjualan"), "fn_penjualan");
});

async function fn_logout() {
    await localStorage.clear();
    window.location = "login.html";
}

async function fn_link(lnk, func) {
    let aktif = document.getElementsByClassName('atas active');
    if (aktif.length == 0) {}
    else {
        for (let i = 0; i < aktif.length; i++) {
            aktif[i].classList.remove('active');
        }
    }

    if (lnk != null) lnk.classList.add('active');
    if (typeof window[func] === 'function') {
        await window[func]();
    }
    else main.innerHTML = `ERROR FUNCTION ${func}`;
}

function show_modal(title='Judul', body='body', footer='footer') {
    blank_dlg_title.innerHTML = title;
    blank_dlg_body.innerHTML = body;
    blank_dlg_footer.innerHTML = footer;
    blank_dlg.show();
}

async function get_opsi_kategori(def = '') {
    return await fetch(`${API}/menu/kategori`, {
        method: 'GET',
        headers: {
            'id': profile.id,
            'token': profile.token,
            'cafe': cafe.id
        }
    }).then(j => j.json()).then(opsi => {
        var o = `<option value=''>( Semua )</option>`;
        opsi.forEach(k => {
            o += `<option value='${k.id}'>${k.name}</option>`;
        });
        return o;
    }).catch(err => {
        console.error(err.message);
    })
}

async function fn_master_menu() {
    main.innerHTML = `
    <div id='mm_panel' class="btn-toolbar" style="padding: 16px;">
        <div class="row col-sm-4">
            <label for="opsi_kategori" class="col-form-label col-sm-4">Kategori</label>
            <div class="col">
                <select id="opsi_kategori" class="form-select" onchange="get_master_menu()"></select>
            </div>
        </div>
        <div class="input-group" style="margin-left: 16px;">
            <button type="button" class="btn btn-outline-secondary" onclick="get_master_menu()">
                <i class="bi bi-arrow-clockwise"></i>
                Refresh
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="fn_edit_menu()">
                <i class="bi bi-plus"></i>
                Menu
            </button>
        </div>
    </div>
    <div id='mm_data'>`;
    var opsi_kategori = document.getElementById('opsi_kategori');
    opsi_kategori.innerHTML = await get_opsi_kategori();
}

async function fn_edit_menu(menuId) {
    const editor = await fetch_static('./static/edit_menu.html');
    const btn = `
        <button type="button" class="btn btn-primary" onclick="fn_simpan_menu(this)">
            <i class="bi bi-floppy"></i> Simpan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    show_modal('Edit Menu', editor, btn);

    let opsi = await get_opsi_kategori();
    document.getElementById('categoryId').innerHTML = opsi;

    if (menuId == null) {
        blank_dlg_title.innerHTML = "Tambah Menu";
        blank_prg.style.display = 'none';
    } else {
        blank_prg.style.display = 'block';
        const data = await fetch(`${API}/menu/edit/${menuId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'id': profile.id,
                'token': profile.token,
                'cafe': cafe.id
            }
        }).then(j => j.json()).then(d => {
            populate_form('frm_edit_menu', d);
            if (d.active == 1) {
                document.getElementById('active').checked = true;
            } else {
                document.getElementById('active').checked = false;
            }
        }).catch(err => {
            alert(err.message);
        });
        blank_prg.style.display = 'none';
    }
}

async function fn_simpan_menu(btn) {
    // validasi dulu
    if (invalid_input('frm_edit_menu', 'name', 'Nama menu tidak boleh kosong!')) return;
    if (invalid_input('frm_edit_menu', 'categoryId', 'Pilih kategori menu!')) return;
    if (invalid_input('frm_edit_menu', 'basePrice', 'Masukkan harga jual!')) return;
    if (invalid_input('frm_edit_menu', 'COGS', 'Masukkan Harga Pokok Penjualan (HPP)!')) return;

    btn.style.display = 'none';
    blank_prg.style.display = 'inline-block';

    await fetch(`${API}/menu/simpan`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify(serialize_form('frm_edit_menu'))
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 1) {
            blank_dlg.hide();
            get_master_menu();
        } else {
            alert(ok.message);
        }
    }).catch(err => {
        alert(err);
    });
    btn.style.display = 'inline-block';
    blank_prg.style.display = 'none';
}

async function get_master_menu() {
    let opsi = document.getElementById("opsi_kategori").value;
    let mm_data = document.getElementById("mm_data");
    mm_data.innerHTML = await fetch(`${API}/menu`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'id': profile.id,
            'token': profile.token,
            'cafe': cafe.id,
            'kategori': opsi
        }
    })
    .then(j => j.json())
    .then(res => {
        return render_master_menu(res);
    })
    .catch(err => {
        return err.message;
    });
}

function render_master_menu(data) {
    let d = data.data;
    let ret = `<table class='table table-hover'>
        <tr>
            <th scope="col">Edit</th>
            <th scope="col">Nama</th>
            <th scope="col">Kategori</th>
            <th scope="col" colspan=2>Harga</th>
            <th scope="col">HPP</th>
            <th scope="col">Aktif</th>
        </tr>`;
    d.forEach(r => {
        let aktif = (r.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dash-circle-fill' style='color: red;'></i>";
        ret += `<tr>
        <td>
            <a href="#" onclick="fn_edit_menu(${r.id})">
                <i class="bi-pencil"></i>
            </a>
        </td>
        <td>${r.name}</td>
        <td>${r.categoryName}</td>
        <td>${r.currency}</td>
        <td>${Number(r.basePrice).toLocaleString()}</td>
        <td>${Number(r.COGS).toLocaleString()}</td>
        <td>${aktif}</td>
        </tr>`;
    });
    return `${ret}</table>`;
}

async function fn_penjualan() {
    main.innerHTML = "Module penjualan";
}