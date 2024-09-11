// Author: Emanuel Setio Dewo, 06/09/2024

const API = "http://192.168.100.40:4000";

window.addEventListener("load", (ev) => {
    console.log("Resetting");
    //localStorage.removeItem("profile");
    //localStorage.removeItem("cafe");
    localStorage.clear();
});

const frm = document.getElementById('frmLogin');
frm.addEventListener("submit", async(event) => {
    event.preventDefault();
    const cafe = document.getElementById('cafe').value;
    const uname = document.getElementById('uname').value;
    const pwd = document.getElementById('pwd').value;
    
    await fetch(`${API}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "cafe": cafe,
            "uname": uname,
            "pwd": pwd
        })
    }).then(r => {
        if (r.status == 200) {
            return r.json();
        } else {
            throw r;
        }
    }).then(async(data) => {
        if (data.ok == 0) {
            alert(data.message);
        } else {
            localStorage.setItem('profile', JSON.stringify(data.profile));
            localStorage.setItem('cafe', JSON.stringify(data.cafe));
            window.location = "index.html";
        }
    }).catch(err => {
        console.log(err.message);
        alert(`Tidak dapat login. Pesan: ${err.message}`);
    });
});