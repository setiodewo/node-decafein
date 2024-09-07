// Author : Emanuel Setio Dewo, 07/09/2024

const API = "http://localhost:4000";
let profile = {};

window.addEventListener("load", (ev) => {
    // Cek profile
    profile = localStorage.getItem('profile');
    if (profile === undefined || profile === null || profile == {}) {
        window.location = "login.html";
    }
});