// Author : Emanuel Setio Dewo, 07/09/2024

const API = "http://192.168.100.35:4000";
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
    const p = localStorage.getItem('profile');
    const c = localStorage.getItem('cafe');
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
    localStorage.clear();
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

async function get_opsi_kategori() {
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

async function get_opsi_level() {
    return await fetch(`${API}/user/level`, {
        method: 'GET',
        headers: {
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(opsi => {
        var o = `<option value=''></option>`;
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
    <div id='mm_data'></div>`;
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
            alert(ret.message);
        }
    }).catch(err => {
        alert(err.message);
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
            <th scope="col" colspan=2>Gambar</th>
            <th scope="col">Aktif</th>
        </tr>`;
    d.forEach(r => {
        let aktif = (r.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dash-circle-fill' style='color: red;'></i>";
        ret += `<tr>
        <td>
            <a href="#" onclick="fn_edit_menu(${r.id})" class="btn btn-secondary">
                <i class="bi-pencil"></i>
            </a>
        </td>
        <th class="align-middle" role="row">${r.name}</th>
        <td class="align-middle">${r.categoryName}</td>
        <td class="align-middle">${r.currency}</td>
        <td class="align-middle">${Number(r.basePrice).toLocaleString()}</td>
        <td class="align-middle">${Number(r.COGS).toLocaleString()}</td>
        <td class="align-middle">
            <a href="#" onclick="fn_upload_gambar_menu(${r.id})" class="btn btn-secondary">
                <i class="bi-cloud-upload"></i>
            </a>
        </td>
        <td class="align-middle"></i></td>
        <td class="align-middle">${aktif}</td>
        </tr>`;
    });
    return `${ret}</table>`;
}

async function fn_master_kategori() {
    main.innerHTML = `
        <div class="input-group" style="padding: 16px;">
            <button class="btn btn-outline-secondary" onclick="get_master_kategori()">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button class="btn btn-outline-secondary" onclick="fn_edit_kategori()">
                <i class="bi bi-plus"></i> Tambah Kategori
            </button>
        </div>
        <table class="table table-hover">
            <thead>
            <tr>
                <th>Edit</th>
                <th>Kategori</th>
                <th>Icon</th>
                <th>Aktif</th>
            </thead>
            <tbody id="table_kategori"></tbody>
        </table>`;
    get_master_kategori();
}

async function get_master_kategori() {
    await fetch(`${API}/menu/kategori`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    })
    .then(j => j.json())
    .then(data => {
        if (data.ok == 0) {
            alert(data.message);
            return;
        }
        var b = document.getElementById('table_kategori');
        b.innerHTML = '';
        data.forEach(d => {
            let aktif = (d.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dash-circle-fill' style='color: red;'></i>";
            b.insertAdjacentHTML('beforeend', `
            <tr>
                <td class="align-middle">
                    <button class="btn btn-secondary" onclick="fn_edit_kategori(${d.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
                <td class="align-middle">${d.name}</td>
                <td class="align-middle">
                    <i class="${d.icon}"></i>
                </td>
                <td class="align-middle">${aktif}</td>
            </tr>`);
        })
    }).catch(err => {
        alert(err);
    });
}

async function fn_edit_kategori(id) {
    const editor = await fetch_static('./static/edit_kategori.html');
    const btn = `
        <button type="button" class="btn btn-primary" onclick="fn_simpan_kategori(this)">
            <i class="bi bi-floppy"></i> Simpan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    show_modal('Edit Kategori', editor, btn);

    if (id == null) {
        blank_dlg_title.innerHTML = "Tambah Kategori";
        blank_prg.style.display = 'none';
    } else {
        const data = await fetch(`${API}/menu/kategori1/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'id' : profile.id,
                'token' : profile.token,
                'cafe' : cafe.id
            }
        }).then(j => j.json()).then(d => {
            populate_form('frm_edit_kategori', d);
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

async function fn_simpan_kategori(btn) {
    if (invalid_input('frm_edit_kategori', 'name', 'Masukkan nama kategori!')) return;
    btn.style.display = 'none';
    blank_prg.display = 'inline-block';

    await fetch(`${API}/menu/simpankategori`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify(serialize_form('frm_edit_kategori'))
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 1) {
            blank_dlg.hide();
            get_master_kategori();
        } else {
            alert(ret.message);
        }
    }).catch(err => {
        alert(err.message);
    });
    btn.style.display = 'inline-block';
    blank_prg.style.display = 'none';
}

function fn_master_user() {
    main.innerHTML = `
        <div class="input-group" style="padding: 16px;">
            <button class="btn btn-outline-secondary" onclick="get_master_user()">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button class="btn btn-outline-secondary" onclick="fn_undang_user()">
                <i class="bi bi-envelope-plus"></i> Undang User
            </button>
        </div>
        <table class="table table-hover">
            <thead>
            <tr>
                <th>Edit</th>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Level</th>
                <th>Aktif</th>
            </thead>
            <tbody id="table_user"></tbody>
        </table>`;
    get_master_user();
}

async function get_master_user() {
    await fetch(`${API}/user`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(data => {
        if (data.ok == 0) {
            alert(data.message);
            return;
        }
        var b = document.getElementById('table_user');
        b.innerHTML = '';
        data.data.forEach(u => {
            let aktif = (u.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dash-circle-fill' style='color: red;'></i>";
            b.insertAdjacentHTML('beforeend', `
            <tr>
                <td class='align-middle'>
                    <button class='btn btn-secondary' onclick="fn_edit_user(${u.id})">
                        <i class='bi bi-pencil'></i>
                    </button>
                </td>
                <td class='align-middle'>${u.userName}</td>
                <td class='align-middle'>${u.name}</td>
                <td class='align-middle'>${u.email}</td>
                <td class='align-middle'>${u.levelName}</td>
                <td class='align-middle'>${aktif}</td>
            </tr>`);
        })
    }).catch(err => {
        alert(err);
    });
}

async function fn_undang_user() {
    const undang = await fetch_static('./static/undang_user.html');
    const btn = `
        <button type="button" class="btn btn-primary" onclick="fn_undang_kirim(this)">
            <i class="bi bi-send"></i> Kirim Undangan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    show_modal('Undang User', undang, btn);
    const opsi = await get_opsi_level();
    document.getElementById('frm_undang_user').elements['levelId'].innerHTML = opsi;
    blank_prg.style.display = 'none';
}

function fn_master_cafe() {
    main.innerHTML = `
        <div class="input-group" style="padding: 16px;">
            <button class="btn btn-outline-secondary" onclick="get_master_cafe()">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button class="btn btn-outline-secondary" onclick="fn_edit_cafe()">
                <i class="bi bi-plus"></i> Tambah Cafe
            </button>
        </div>
        <div class="alert alert-light">Anda memiliki akses ke cafe di bawah ini.
            Menambah cafe baru menjadikan Anda sebagai owner dari cafe tersebut.
            Anda hanya bisa mengedit cafe yang mana Anda adalah ownernya.
        </div>
        <table class="table table-hover">
            <thead>
            <tr>
                <th>Edit</th>
                <th>Kode</th>
                <th>Nama Cafe</th>
                <th>Nama Owner</th>
                <th>Level Akses</th>
                <th>Kota</th>
                <th>Aktif</th>
            </thead>
            <tbody id="table_cafe"></tbody>
        </table>`;
    get_master_cafe();
}

async function get_master_cafe() {
    await fetch(`${API}/cafe`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        }
    }).then(j => j.json()).then(data => {
        if (data.ok == 0) {
            alert(data.message);
            return;
        }
        var b = document.getElementById('table_cafe');
        b.innerHTML = '';
        data.data.forEach(u => {
            let aktif = (u.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dash-circle-fill' style='color: red;'></i>";
            let edit = (u.ownerId == profile.id)? `<button class='btn btn-secondary' onclick="fn_edit_cafe('${u.id}')"><i class='bi bi-pencil'></i></button>` : "&nbsp;";
            b.insertAdjacentHTML('beforeend', `
            <tr>
                <td class='align-middle'>${edit}</td>
                <td class='align-middle'>${u.id}</td>
                <td class='align-middle'>${u.name}</td>
                <td class='align-middle'>${u.ownerName}</td>
                <td class='align-middle'>${u.levelName}</td>
                <td class='align-middle'>${u.city}</td>
                <td class='align-middle'>${aktif}</td>
            </tr>`);
        })
    }).catch(err => {
        alert(err);
    });
}

async function fn_edit_cafe(id) {
    const editor = await fetch_static('./static/edit_cafe.html');
    const btn = `
        <button type="button" class="btn btn-primary" onclick="fn_simpan_cafe(this)">
            <i class="bi bi-floppy"></i> Simpan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    show_modal('Edit Cafe', editor, btn);

    if (id == null) {
        blank_dlg_title.innerHTML = "Tambah Cafe";
        blank_prg.style.display = 'none';
        document.getElementById('frm_edit_cafe').elements['id'].setAttribute('readonly', false);
        document.getElementById('label_cafeId').innerHTML = "Kode Cafe (harus unik)";
    } else {
        document.getElementById('frm_edit_cafe').elements['id'].setAttribute('readonly', true);
        document.getElementById('label_cafeId').innerHTML = "Kode Cafe (tidak dapat diubah)";
        const data = await fetch(`${API}/cafe/edit/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'id' : profile.id,
                'token' : profile.token,
                'cafe' : cafe.id
            }
        }).then(j => j.json()).then(d => {
            populate_form('frm_edit_cafe', d.data);
            if (d.data.active == 1) {
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

async function fn_simpan_cafe(btn) {
    if (invalid_input('frm_edit_cafe', 'id', 'Masukkan kode cafe!')) return;
    if (invalid_input('frm_edit_cafe', 'name', 'Masukkan nama cafe!')) return;
    if (invalid_input('frm_edit_cafe', 'city', 'Masukkan kota!')) return;
    if (invalid_input('frm_edit_cafe', 'province', 'Masukkan propinsi!')) return;
    if (invalid_input('frm_edit_cafe', 'zipCode', 'Masukkan kode pos!')) return;

    btn.style.display = 'none';
    blank_prg.display = 'inline-block';
    await fetch(`${API}/cafe/simpan`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id
        },
        body: JSON.stringify(serialize_form('frm_edit_cafe'))
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 1) {
            blank_dlg.hide();
            get_master_cafe();
        } else {
            alert(ret.message);
        }
    }).catch(err => {
        alert(err.message);
    });
    btn.style.display = 'inline-block';
    blank_prg.style.display = 'none';
}