// Author : Emanuel Setio Dewo, 08/09/2024

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