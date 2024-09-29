// Author : Emanuel Setio Dewo, 29/09/2024

let cws_floor = 1;

function fn_coworkingspace() {
    main.innerHTML = "Coworking space";
}

function fn_master_cws() {
    main.innerHTML = `
    <div class="mb-3 mt-3 col-md-6">
    <div class="input-group">
        <span class='input-group-text'>Lantai</span>
        <input type="number" id="cws_floor" class="form-control" value='${cws_floor}'>
        <button type="button" class="btn btn-outline-secondary" onclick="change_floor_cws()">Refresh</button>
        <button type="button" class="btn btn-primary" onclick="fn_edit_cws(0)">
            <i class="bi bi-plus-lg"></i>
            Tambah
        </button>
    </div>
    </div>
    <table id='table_cws' class='table-responsive table-bordered table-hover'>
    </table>`;
    get_master_cws();
}

function change_floor_cws() {
    let lantai = document.getElementById('cws_floor').value;
    console.log('lantai', Number(lantai));
    if (isNaN(Number(lantai))) {
        div_alert.insertAdjacentHTML('beforeend', html_alert('danger', 'Masukkan angka!'));
        timer_alert(5);
        return false;
    }

    cws_floor = Number(lantai);
    get_master_cws();
}

async function get_master_cws() {
    await fetch(`${API}/cws/all`, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'id' : profile.id,
            'token' : profile.token,
            'cafe' : cafe.id,
            'floor' : cws_floor
        }
    }).then(j => j.json()).then(ret => {
        parsing_master_cws(ret);
    }).catch(err => {
        alert(err);
    });
}

function parsing_master_cws(cws) {
    let table_cws = document.getElementById('table_cws');
    let tbl = '';
    // place holder
    for (let r = 0; r <= cws.row; r++) {
        tbl += `<tr>`;
        for (let c = 0; c <= 12; c++) {
            let add = `<a href="#" onclick="fn_edit_cws(0, ${r}, ${c})">
                <i class="bi bi-plus-lg"></i></a>`;
            let w = '';
            if (c == 0) {
                add = r;
            }
            if (r == 0) {
                add = c;
            }
            if (c == 0 && r == 0) {
                add = '&nbsp;';
            }

            tbl += `<td id='space_${r}_${c}' class="space0 text-center align-middle" ${w}>
                ${add}
                </td>`;
        }
        tbl += `</tr>`;
    }
    table_cws.innerHTML = tbl;


    // Masukkan datanya
    cws.data.forEach(d => {
        let id = `space_${d.rowNum}_${d.colNum}`;
        let spc = document.getElementById(id);
        // coloumn
        if (d.colSize > 1) {
            for (let _col = 1; _col < d.colSize; _col++) {
                let _colElm = document.getElementById(`space_${d.rowNum}_${d.colNum + _col}`);
                _colElm.remove();
            }
            spc.setAttribute('colspan', d.colSize);
        }

        // row
        if (d.rowSize > 1) {
            for (let _row = 1; _row < d.rowSize; _row++) {
                for (let _col = 0; _col < d.colSize; _col++) {
                    let _rowElm = document.getElementById(`space_${d.rowNum + _row}_${d.colNum + _col}`);
                    _rowElm.remove();
                }
            }
            spc.setAttribute('rowspan', d.rowSize);
        }
        let leftright = '';
        if (d.leftright == 1) {
            leftright = 'space-left';
        }
        if (d.leftright == 2) {
            leftright = 'space-right';
        }
        spc.innerHTML = `<div class='space1 align-middle ${leftright}'>
            <a href="#" onclick="fn_edit_cws(${d.id}, ${d.rowNum}, ${d.colNum})">${d.name}</a>
            </div>`;
    });
}

async function fn_edit_cws(id, row = '', col = '') {
    let frm = await fetch_static('./static/edit_cws.html');
    const tombol = `
        <button type="button" class="btn btn-primary" onclick="fn_simpan_cws(this)">
            <i class="bi bi-floppy me-1"></i> Simpan
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>`;
    let judul = (id == 0) ? 'Tambah Coworking Space' : 'Edit Coworking Space';
    show_modal(judul, frm, tombol);
    document.getElementById('frm_edit_cws').elements['floor'].value = document.getElementById('cws_floor').value;
    if (row != '') setvalueof('frm_edit_cws', 'rowNum', row);
    if (col != '') setvalueof('frm_edit_cws', 'colNum', col);

    if (id > 0) {
        // Ambil cws
        await fetch(`${API}/cws/edit/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'id': profile.id,
                'token': profile.token,
                'cafe': cafe.id
            }
        }).then(j => j.json()).then(data => {
            populate_form('frm_edit_cws', data);
            document.getElementById('frm_edit_cws').elements['active'].checked = (data.active == 1);
        }).catch(err => {
            alert(err);
        });
    }
    blank_prg.style.display = 'none';
}

async function fn_simpan_cws(btn) {
    // validasi
    if (invalid_input('frm_edit_cws', 'name', 'Nama Coworking Space harus diisi!')) return;
    if (invalid_input('frm_edit_cws', 'floor', 'Masukkan lantai!')) return;
    if (invalid_input('frm_edit_cws', 'rowNum', 'Masukkan posisi baris!')) return;
    if (invalid_input('frm_edit_cws', 'colNum', 'Masukkan posisi kolom!')) return;
    if (invalid_input('frm_edit_cws', 'rowSize', 'Masukkan ukuran baris (dalam unit)!')) return;
    if (invalid_input('frm_edit_cws', 'colSize', 'Masukkan ukuran kolom (dalam unit)!')) return;
    if (invalid_input('frm_edit_cws', 'capacity', 'Masukkan kapasitas (dalam orang)!')) return;
    btn.style.display = 'none';
    blank_prg.style.display = 'inline-block';
    var par = serialize_form('frm_edit_cws');
    par.active = (document.getElementById('frm_edit_cws').elements['active'].checked) ? 1 : 0;

    await fetch(`${API}/cws/save`, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            'id': profile.id,
            'token': profile.token,
            'cafe': cafe.id
        },
        body: JSON.stringify(par)
    }).then(j => j.json()).then(ret => {
        if (ret.ok == 1) {
            blank_dlg.hide();
            get_master_cws();
        } else {
            div_alert.insertAdjacentHTML('beforeend', html_alert('danger', ret.message));
            blank_prg.style.display = 'none';
            btn.style.display = 'inline-block';
        }
    }).catch(err => {
            div_alert.insertAdjacentHTML('beforeend', html_alert('danger', err));
            blank_prg.style.display = 'none';
            btn.style.display = 'inline-block';
    });
}