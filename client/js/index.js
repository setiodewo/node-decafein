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
});

async function fn_logout() {
    await localStorage.clear();
    window.location = "login.html";
}

function fn_link(lnk, func) {
    let aktif = document.getElementsByClassName('nav-link active');
    if (aktif.length == 0) {}
    else {
        for (let i = 0; i < aktif.length; i++) {
            console.log('inactive', i);
            aktif[i].classList.remove('active');
        }
    }

    if (lnk != null) lnk.classList.add('active');
    main.innerHTML = func;
}