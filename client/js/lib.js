// Author : Emanuel Setio Dewo, 08/09/2024

const esc = {
    _reset : '\x1B@',
    _center: '\x1Ba\x01',
    _left: '\x1Ba\x00',
    _big: '\x1D!\x11',
    _normal: '\x1D!\x00',
    _boldOn : "\x1b\x45\x01",
    _boldOff : "\x1b\x45\x00",
    _grs:  '--------------------------------\n',
    _grs2: '================================\n'
}

async function fetch_static(f) {
    var hasil = '';
    await fetch(f).then(t => t.text()).then(t => {
        hasil = t;
    }).catch(err => {
        hasil = err;
    });
    return hasil;
}

function valueof(frm, id) {
    var f = document.getElementById(frm);
    return f.elements[id].value;
}

function setvalueof(frm, id, val) {
    var f = document.getElementById(frm);
    f.elements[id].value = val;
}

function invalid_input(frm, id, msg) {
    var f = document.getElementById(frm);
    var v = f.elements[id];
    if (v == undefined || v.value == undefined || v.value == '') {
        alert(msg);
        v.focus();
        return true;
    } else {
        return false;
    }
}

function populate_form(id, data) {
    var frm = document.getElementById(id);
    Object.keys(data).forEach(nilai => {
        if (frm.elements[nilai] === undefined) {}
        else frm.elements[nilai].value = data[nilai];
    });
    //frm.elements['name'].value = data['name'];
    //console.log('name', frm.elements['name'].value);
}

function serialize_form(id) {
    var frm = document.getElementById(id);
    var par = {};
    for (var i = 0; i < frm.elements.length; i++) {
        if (frm.elements[i].type == 'checkbox') {
            par[frm.elements[i].id] = frm.elements[i].checked === true? 1 : 0;
        } 
        else {
            par[frm.elements[i].id] = frm.elements[i].value;
        }
    }
    return par;
}

function optionize(arr) {
    var opt = "<option></option>";
    if (arr === undefined) {}
    else {
        arr.forEach(a => {
            var val = Object.values(a);
            opt += `<option value='${val[0]}' style="word-wrap: normal !important">${val[1]}</option>`;
        });
    }
    return opt;
}

function pagination(max, pg, jml, lnk) {
    let _prv = (pg == 0)? '' : `<li class='page-item'><a class='page-link' href='#' onclick="${lnk}(-1)">Previous</a></li>`;
    let _nxt = (jml < max)? '' : `<li class='page-item'><a class='page-link' href='#' onclick="${lnk}(1)">Next</a></li>`;
    let _pg = `<li class='page-item'><span class='page-link'>${pg + 1}</span></li>`;
    return `<nav>
        <ul class='pagination justify-content-end'>
            ${_prv}
            ${_pg}
            ${_nxt}
        </ul>
    </nav>`;
}

function opsi_bulan() {
    // butuh moment.js
    let opt = '';
    moment.months().forEach(function(bln, idx) {
        opt += `<option value='${idx}'>${bln}</option>`;
    });
    return opt;
}

const padBoth = (str, length, char = ' ') =>
    str.padStart((str.length + length) / 2, char).padEnd(length, char);