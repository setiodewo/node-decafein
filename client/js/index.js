// Author : Emanuel Setio Dewo, 07/09/2024

const API = "http://localhost:4000";
let profile = {};
let cafe = {};

const main = document.getElementById('main');

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
            <select id="opsi_kategori" class="form-select" onchange="get_master_menu()"><option>( Semua )</option></select>
            </div>
        </div>
        <div class="input-group" style="margin-left: 16px;">
            <button type="button" class="btn btn-outline-secondary" onclick="get_master_menu()">
                <i class="bi bi-arrow-clockwise"></i>
                Refresh
            </button>
            <button type="button" class="btn btn-outline-secondary">
                <i class="bi bi-plus"></i>
                Menu
            </button>
        </div>
    </div>
    <div id='mm_data'>`;
    var opsi_kategori = document.getElementById('opsi_kategori');
    opsi_kategori.innerHTML = await get_opsi_kategori();
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
        let aktif = (r.active == 1)? "<i class='bi bi-check-circle-fill' style='color: green;'></i>" : "<i class='bi bi-dasch-circle-fill' style='color: red;'></i>";
        ret += `<tr>
        <td>
            <a href="#" onclick="">
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