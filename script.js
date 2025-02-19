const ADMIN_PASSWORD = "admin123"; // Password in chiaro

function showLogin() {
    document.getElementById("loginModal").style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginButton").addEventListener("click", function () {
        const inputPassword = document.getElementById("passwordInput").value;

        if (inputPassword === ADMIN_PASSWORD) {
            window.location.href = "admin.html"; // Reindirizza all'area admin
        } else {
            alert("Password errata!");
        }
    });
});
