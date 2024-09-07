// Author: Emanuel Setio Dewo, 06/09/2024

const API = "http://localhost:4000";

window.addEventListener("load", (ev) => {
    console.log("Resetting");
    localStorage.clear();
});

const frm = document.getElementById('frmLogin');
frm.addEventListener("submit", async(event) => {
    event.preventDefault();
    const kode = document.getElementById('kode').value;
    const em = document.getElementById('em').value;
    const pwd = document.getElementById('pwd').value;
    
    await fetch(`${API}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "kode": kode,
            "em": em,
            "pwd": pwd
        })
    }).then(r => {
        if (r.status == 200) {
            return r.json();
        } else {
            throw r;
        }
    }).then(data => {
        if (data.ok == 0) {
            alert(data.message);
        } else {
            localStorage.setItem('profile', data.profile);
            window.location = "index.html";
        }
    }).catch(err => {
        console.log(err.message);
        alert(`Tidak dapat login. Pesan: ${err.message}`);
    });
});